import { apiClient, saveAuthToken, removeAuthToken } from './client';
import { UserProfile } from '../types';

export interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', { email, password });
  const data = response.data;
  if (data.access_token) {
    await saveAuthToken(data.access_token);
  }
  return data;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
}): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/register', payload);
  const data = response.data;
  if (data.access_token) {
    await saveAuthToken(data.access_token);
  }
  return data;
};

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await removeAuthToken();
};

