import { apiClient, unwrapData } from './client';
import { UserProfile } from '../types';
import { transformBackendUser } from './auth';

export const fetchProfileApi = async (): Promise<UserProfile> => {
  // Endpoint: GET /api/users/profile
  const response = await apiClient.get('/users/profile');
  const inner = unwrapData<any>(response.data);
  return transformBackendUser(inner);
};

export const updateProfileApi = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  // Endpoint: PUT /api/users/profile  (backend requires PUT, not PATCH)
  // Transform mobile field names → backend snake_case field names
  const payload: Record<string, any> = {};
  if (data.name)            payload.full_name = data.name;
  if (data.phone)           payload.phone = data.phone;
  if (data.email)           payload.email = data.email;
  if (data.age !== undefined) payload.age = data.age;
  if (data.gender)          payload.gender = data.gender === 'أنثى' ? 'female' : data.gender;
  if (data.bloodType)       payload.blood_type = data.bloodType;
  if (data.emergencyContact) payload.emergency_contact = data.emergencyContact;
  if (data.location)        payload.city = data.location;

  const response = await apiClient.put('/users/profile', payload);
  const inner = unwrapData<any>(response.data);
  return transformBackendUser(inner);
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

  // Endpoint: POST /api/users/profile/avatar (real backend path)
  const response = await apiClient.post('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const inner = unwrapData<any>(response.data);
  return {
    avatar: inner?.avatar ?? inner?.profile_picture ?? '',
    user: transformBackendUser(inner?.user ?? inner),
  };
};



