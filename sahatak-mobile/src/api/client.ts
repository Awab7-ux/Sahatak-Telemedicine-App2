import axios, { AxiosError, AxiosResponse } from 'axios';
import type { AxiosRequestHeaders } from 'axios';
import * as SecureStore from 'expo-secure-store';

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://sahatak.pythonanywhere.com/api';

export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');
export const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');
export const SERVER_HOST = SOCKET_URL;

const TOKEN_KEY = 'sahatak_auth_token';

export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  timestamp: string;
  status_code: number;
  data: T;
  meta?: Record<string, unknown>;
  error_code?: string;
  field?: string;
}

export class ApiError extends Error {
  status: number | null;
  errorCode: string | null;
  field: string | null;
  rawBody?: unknown;
  url?: string;
  method?: string;

  constructor(
    message: string,
    status: number | null = null,
    errorCode: string | null = null,
    field: string | null = null,
    rawBody?: unknown,
    url?: string,
    method?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.field = field;
    this.rawBody = rawBody;
    this.url = url;
    this.method = method;
  }
}

export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data;
}

// Alias used by pre-existing files (e.g. src/api/profile.ts) that expect
// the envelope object itself, not the raw axios response.
export function unwrapData<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}

// ASSUMPTION: backend-served media (avatars etc.) is rooted at the server
// host (SOCKET_URL), not under /api. Relative paths like "/media/x.jpg"
// are resolved against the host; absolute URLs are passed through.
export function resolveImageUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SOCKET_URL}${clean}`;
}


export function unwrapWithMeta<T>(
  response: AxiosResponse<ApiEnvelope<T>>,
): { data: T; meta: Record<string, unknown> | undefined } {
  return { data: response.data.data, meta: response.data.meta };
}

type ForcedLogoutListener = (message: string) => void;
const forcedLogoutListeners = new Set<ForcedLogoutListener>();

export function onForcedLogout(listener: ForcedLogoutListener): () => void {
  forcedLogoutListeners.add(listener);
  return () => forcedLogoutListeners.delete(listener);
}

function emitForcedLogout(message: string): void {
  forcedLogoutListeners.forEach((listener) => listener(message));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status ?? null;
    const body = error.response?.data;
    const errorCode = body?.error_code ?? null;
    const message = body?.message ?? error.message ?? 'Network error';
    const field = body?.field ?? null;

    const looksBlocked =
      typeof errorCode === 'string' &&
      /BLOCKED|INACTIVE|SUSPENDED/i.test(errorCode);

    // ── TEMPORARY DEBUG LOGGING (chat error diagnosis) ──────────────────
    // Prints endpoint, method, HTTP status and the RAW response body for
    // every failed API call so intermittent errors (e.g. the generic
    // "Something went wrong on our side." chat fallback) can be traced to
    // their real cause. Remove once the issue is diagnosed.
    if (status !== null) {
      console.warn(
        `[ApiDebug] ${error.config?.method?.toUpperCase() ?? '?'} ${
          error.config?.url ?? '?'
        } -> ${status}`,
        JSON.stringify({ body, errorCode, field }),
      );
    }

    if (status === 403 || (status === 401 && looksBlocked)) {
      // Warn explicitly so the endpoint and body are immediately visible in
      // the log if this fires unexpectedly during a test session.  The generic
      // [ApiDebug] line above fires for every error; this one fires ONLY when
      // we are about to force-logout the user.
      console.warn(
        `[ForcedLogout] Triggering logout after HTTP ${status} from ` +
          `${error.config?.method?.toUpperCase() ?? '?'} ${error.config?.url ?? '?'}`,
        JSON.stringify({ status, body, errorCode }),
      );
      await removeAuthToken();
      emitForcedLogout(
        'Your account has been suspended. Please contact support.',
      );
    }

    return Promise.reject(
      new ApiError(
        message,
        status,
        errorCode,
        field,
        body,
        error.config?.url,
        error.config?.method?.toUpperCase(),
      ),
    );
  },
);

export default apiClient;