import { apiClient, saveAuthToken, removeAuthToken, unwrapData } from './client';
import { UserProfile } from '../types';

// -------------------------------------------------------
// Types that mirror the real Sahatak-2 backend contracts
// -------------------------------------------------------
export interface AuthResponse {
  token: string;
  user: UserProfile;
  needsVerification?: boolean;
}

/** Base fields shared by Patient & Doctor registration */
interface BaseRegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type: 'patient' | 'doctor';
}

/** Extra fields required when user_type === 'patient' */
export interface PatientRegisterPayload extends BaseRegisterPayload {
  user_type: 'patient';
  age: number;
  gender: 'male' | 'female';
  blood_type?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
}

/** Extra fields required when user_type === 'doctor' */
export interface DoctorRegisterPayload extends BaseRegisterPayload {
  user_type: 'doctor';
  license_number: string;
  specialty: string;
  years_of_experience: number;
  qualification?: string;
  hospital_affiliation?: string;
  consultation_fee?: number;
  bio?: string;
}

export type RegisterPayload = PatientRegisterPayload | DoctorRegisterPayload;

// Kept for backward-compatibility with callers using the old shape
export interface LegacyRegisterPayload {
  name?: string;
  email: string;
  phone: string;
  password: string;
  nameAr?: string;
  gender?: string;
  age?: number;
  location?: string;
  avatar?: string;
}

/**
 * Login to the real backend.
 * Endpoint : POST /api/auth/login
 * Payload  : { login_identifier, password, remember_me? }
 * Response : { success, data: { access_token, user, needs_verification } }
 *
 * Special error: 401 with error_code "USER_NOT_VERIFIED"
 *   → Axios will reject; caller should read error.response.data.error_code
 */
export const loginUser = async (identifier: string, password: string): Promise<AuthResponse> => {
  const payload = {
    login_identifier: identifier.trim(),
    password,
    remember_me: true,
  };

  const response = await apiClient.post('/auth/login', payload);
  const inner = unwrapData<{
    access_token: string;
    user: any;
    needs_verification?: boolean;
  }>(response.data);

  const token = inner.access_token;
  if (token) {
    await saveAuthToken(token);
  }

  return {
    token,
    user: transformBackendUser(inner.user),
    needsVerification: inner.needs_verification ?? false,
  };
};

/**
 * Register a new patient or doctor account.
 * Endpoint : POST /api/auth/register
 * Note     : The backend sends a verification email; it does NOT return a JWT token on register.
 *            needsVerification will be true so the UI can show the email notice.
 */
export const registerUser = async (payload: RegisterPayload | LegacyRegisterPayload): Promise<AuthResponse> => {
  const backendPayload = normalizeLegacyPayload(payload);
  const response = await apiClient.post('/auth/register', backendPayload);
  const inner = unwrapData<{ user?: any; access_token?: string; needs_verification?: boolean }>(response.data);

  const token = inner?.access_token ?? '';
  if (token) {
    await saveAuthToken(token);
  }

  return {
    token,
    user: inner?.user ? transformBackendUser(inner.user) : ({} as UserProfile),
    needsVerification: inner?.needs_verification ?? true,
  };
};

/**
 * Fetch the currently authenticated user's profile.
 * Endpoint : GET /api/auth/me
 */
export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/me');
  const inner = unwrapData<any>(response.data);
  return transformBackendUser(inner);
};

/** Sign out: remove stored JWT token */
export const logoutUser = async (): Promise<void> => {
  await removeAuthToken();
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

/**
 * Transform the backend User object (snake_case + nested patient/doctor profile)
 * into the mobile app's UserProfile type.
 */
export function transformBackendUser(backendUser: any): UserProfile {
  if (!backendUser) return {} as UserProfile;
  const profile = backendUser.patient_profile || backendUser.doctor_profile || {};

  return {
    id: String(backendUser.id ?? ''),
    name: backendUser.full_name ?? '',
    nameAr: backendUser.full_name ?? '',
    phone: backendUser.phone ?? '',
    email: backendUser.email ?? '',
    avatar: backendUser.profile_picture ?? '',
    bloodType: profile.blood_type ?? undefined,
    bloodGroup: profile.blood_type ?? undefined,
    age: profile.age ?? 0,
    gender: profile.gender ?? '',
    genderAr: profile.gender === 'female' ? 'أنثى' : 'ذكر',
    height: '',
    weight: '',
    emergencyContact: profile.emergency_contact ?? undefined,
    insuranceProvider: '',
    location: backendUser.city ?? '',
    locationAr: backendUser.city ?? '',
  };
}

/**
 * If a caller still passes the old "name / nameAr" shape, convert it automatically.
 */
function normalizeLegacyPayload(payload: any): RegisterPayload {
  if ('full_name' in payload && 'user_type' in payload) {
    return payload as RegisterPayload;
  }
  return {
    full_name: payload.full_name || payload.name || '',
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    user_type: 'patient',
    age: payload.age ?? 25,
    gender: (payload.gender === 'female' || payload.gender === 'أنثى') ? 'female' : 'male',
  } as PatientRegisterPayload;
}
