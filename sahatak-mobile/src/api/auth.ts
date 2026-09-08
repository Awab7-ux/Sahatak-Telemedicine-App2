import apiClient, {
  ApiEnvelope,
  ApiError,
  removeAuthToken,
  saveAuthToken,
} from './client';
import { UserProfile } from '../types';

export interface AuthUser {
  id: number;
  email?: string;
  full_name?: string;
  user_type?: 'patient' | 'doctor' | 'admin';
  language_preference?: 'ar' | 'en';
  is_active?: boolean;
  is_verified?: boolean;
  is_online?: boolean;
  profile?: ApiPatientProfile | ApiDoctorProfile;
  [key: string]: unknown;
}

// Mirrors Patient.to_dict() in the real backend's models.py
export interface ApiPatientProfile {
  id: number;
  user_id: number;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  blood_type?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  height?: number;
  weight?: number;
  [key: string]: unknown;
}

// Mirrors Doctor.to_dict() in the real backend's models.py
export interface ApiDoctorProfile {
  id: number;
  user_id: number;
  phone: string;
  phone_country?: string;
  license_number: string;
  license_country?: string;
  specialty: string;
  years_of_experience: number;
  qualification?: string;
  hospital_affiliation?: string;
  consultation_fee?: string;
  bio?: string;
  is_verified?: boolean;
  verification_status?: string;
  profile_completed?: boolean;
  [key: string]: unknown;
}

interface LoginResponseData {
  // Real backend /auth/login returns an ApiEnvelope whose data is:
  // { user, needs_verification, verification_redirect, access_token? }
  // NOTE: access_token may be ABSENT (session-only fallback) — never assume it exists.
  user?: AuthUser;
  access_token?: string;
  needs_verification?: boolean;
  verification_redirect?: string | null;
  verification_status?: string;
  profile_completed?: boolean;
  [key: string]: unknown;
}

// The backend returns flat bodies, but tolerate an ApiEnvelope-shaped
// { success, data } wrapper in case a future deployment adds it.
function pickAuthPayload<T>(body: any): T {
  if (body && typeof body === 'object' && body.data && !body.token) {
    return body.data as T;
  }
  return (body ?? {}) as T;
}

export const USER_NOT_VERIFIED = 'USER_NOT_VERIFIED';

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type: 'patient' | 'doctor';
  age?: number;
  gender?: 'male' | 'female';
  license_number?: string;
  specialty?: string;
  years_of_experience?: number;
}

// Maps the REAL backend user shape (User.to_dict() + optional Patient/Doctor
// profile) to the app's UserProfile. The real backend has NO avatar, no
// Arabic-name field, and no insurance/location fields — those fall back to
// empty strings (flagged in the Phase-1 reconciliation notes).
export function transformBackendUser(raw: any): UserProfile {
  if (!raw) return raw;

  const profile = raw.profile ?? {};
  const genderRaw = profile.gender ?? '';
  const gender =
    genderRaw === 'female' ? 'Female' : genderRaw === 'male' ? 'Male' : genderRaw;
  const genderAr = genderRaw === 'female' ? 'أنثى' : genderRaw === 'male' ? 'ذكر' : '';

  return {
    id: raw.id !== undefined ? String(raw.id) : undefined,
    userType: raw.user_type,
    name: raw.full_name ?? raw.name ?? '',
    nameAr: raw.full_name ?? raw.name ?? '',
    phone: profile.phone ?? '',
    email: raw.email ?? '',
    avatar: raw.avatar ?? raw.profile_picture ?? '',
    bloodType: profile.blood_type,
    bloodGroup: profile.blood_type,
    age: profile.age ?? 0,
    gender,
    genderAr,
    height: profile.height !== undefined && profile.height !== null ? String(profile.height) : '',
    weight: profile.weight !== undefined && profile.weight !== null ? String(profile.weight) : '',
    emergencyContact: profile.emergency_contact,
    insuranceProvider: '',
    insuranceProviderAr: '',
    policyNumber: undefined,
    insurancePolicyNumber: undefined,
    location: '',
    locationAr: '',
  };
}

export async function loginUser(
  identifier: string,
  password: string,
  rememberMe: boolean = true,
): Promise<{ user: UserProfile | null; token: string }> {
  // Real backend /auth/login expects: { login_identifier, password, remember_me }
  // where login_identifier can be an email OR a phone number.
  const response = await apiClient.post<ApiEnvelope<LoginResponseData>>('/auth/login', {
    login_identifier: identifier,
    password,
    remember_me: rememberMe,
  });

  const data = pickAuthPayload<LoginResponseData>(response.data);
  // The real backend puts the JWT in `access_token` and MAY omit it
  // (session-only fallback). The bearer token is what the mobile app needs
  // for api_login_required-protected endpoints.
  const token = data.access_token;
  if (!data.user) {
    throw new ApiError(
      'Login succeeded but no user data was returned by the server.',
      response.status,
      'NO_USER_IN_RESPONSE',
    );
  }

  if (token) {
    await saveAuthToken(token);
  }
  return { user: transformBackendUser(data.user), token: token ?? '' };
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<{ user: UserProfile | null; token?: string; requiresEmailVerification?: boolean }> {
  // Real backend /auth/register expects (routes/auth.py):
  //   required for ALL: full_name, user_type ('patient'|'doctor'), phone,
  //                     email, password
  //   patient:          + age, gender ('male'|'female') required; optional
  //                     blood_type, emergency_contact, medical_history,
  //                     allergies, current_medications
  //   doctor:           + license_number, specialty, years_of_experience
  //                     required; optional phone_country, license_country,
  //                     qualification, hospital_affiliation, consultation_fee, bio
  // RegisterPayload already matches these names 1:1 — send it as-is.
  // Response data = the created user dict + requires_email_verification: true.
  // NO token is returned: the account must be email-verified before login.
  const response = await apiClient.post<ApiEnvelope<LoginResponseData>>('/auth/register', payload);
  const raw: any = pickAuthPayload<LoginResponseData>(response.data);

  // NOTE: /auth/register returns the user dict SPREAD at the top level of
  // `data` (with requires_email_verification), NOT nested under `user`.
  const userDict = raw?.user ?? (raw?.full_name !== undefined ? raw : null);
  if (!userDict) {
    return { user: null };
  }
  // Do NOT save/authenticate: the account is unverified until the user
  // clicks the email-verification link.
  return {
    user: transformBackendUser(userDict),
    requiresEmailVerification: raw?.requires_email_verification === true,
  };
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const response = await apiClient.get<ApiEnvelope<LoginResponseData>>('/auth/me');
  // Real backend /auth/me returns data: { user: { ...user, profile? } }
  const data = pickAuthPayload<LoginResponseData>(response.data);
  return transformBackendUser(data.user);
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Best-effort
  } finally {
    await removeAuthToken();
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification', { email });
}