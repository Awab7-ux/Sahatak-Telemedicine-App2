import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sahatak_jwt_token';

// ------------------------------------------------------------
// Base URL Configuration
// For Android emulator : http://10.0.2.2:5000/api
// For physical device  : http://<YOUR_LAN_IP>:5000/api
//                        (e.g. http://192.168.100.7:5000/api)
// For iOS simulator    : http://localhost:5000/api
// Override at runtime via EXPO_PUBLIC_API_URL env variable.
// ------------------------------------------------------------
const DEFAULT_BASE_URL = Platform.select({
  android: 'http://192.168.100.7:5000/api',
  ios: 'http://192.168.100.7:5000/api',
  default: 'http://192.168.100.7:5000/api',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;
export const SERVER_HOST = API_BASE_URL.replace(/\/api\/?$/, '');

// ------------------------------------------------------------
// Real Backend Response Envelope
// Every successful response from Sahatak-2/backend is wrapped:
//   { success, message, timestamp, status_code, data, meta? }
// This helper unwraps the `data` field.
// ------------------------------------------------------------
export function unwrapData<T>(responseData: any): T {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }
  // Fallback: return as-is (handles legacy / non-wrapped responses)
  return responseData as T;
}

export const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${SERVER_HOST}${cleanPath}`;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Secure token helpers
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.warn('Failed to save auth token to SecureStore', e);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to get auth token from SecureStore', e);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to remove auth token from SecureStore', e);
  }
};

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-clear invalid token
      removeAuthToken();
    }
    return Promise.reject(error);
  }
);

