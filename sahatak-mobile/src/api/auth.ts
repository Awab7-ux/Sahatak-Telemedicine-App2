import { apiClient, saveAuthToken, removeAuthToken } from './client';
import { UserProfile } from '../types';

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  nameAr?: string;
  gender?: string;
  genderAr?: string;
  age?: number;
  location?: string;
  locationAr?: string;
  avatar?: string;
}

export const loginUser = async (identifier: string, password: string): Promise<AuthResponse> => {
  const isEmail = identifier.includes('@');
  const payload = isEmail ? { email: identifier.trim(), password } : { phone: identifier.trim(), password };
  const response = await apiClient.post('/auth/login', payload);
  const data = response.data;
  const token = data.token || data.access_token;
  if (token) {
    await saveAuthToken(token);
  }
  return {
    token,
    user: data.user,
  };
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', payload);
  const data = response.data;
  const token = data.token || data.access_token;
  if (token) {
    await saveAuthToken(token);
  }
  return {
    token,
    user: data.user,
  };
};

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await removeAuthToken();
};


