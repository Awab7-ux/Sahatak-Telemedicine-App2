import { apiClient } from './client';
import { UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';

export const fetchProfileApi = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get('/profile');
    return response.data;
  } catch {
    return INITIAL_USER;
  }
};

export const updateProfileApi = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await apiClient.put('/profile', data);
    return response.data;
  } catch {
    return { ...INITIAL_USER, ...data };
  }
};

