import { apiClient } from './client';
import { UserProfile } from '../types';

export const fetchProfileApi = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/profile');
  return response.data;
};

export const updateProfileApi = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await apiClient.patch('/profile', data);
  return response.data;
};

export const uploadAvatarApi = async (imageUri: string): Promise<{ avatar: string; user: UserProfile }> => {
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  const response = await apiClient.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


