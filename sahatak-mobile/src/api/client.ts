import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sahatak_jwt_token';

// For Android emulator: 10.0.2.2:5000/api
// For physical device: use machine's local IP (e.g. 192.168.1.X:5000/api)
// For Web/iOS simulator: localhost:5000/api
const DEFAULT_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;
export const SERVER_HOST = API_BASE_URL.replace(/\/api\/?$/, '');

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

