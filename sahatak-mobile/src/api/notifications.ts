import { apiClient } from './client';
import { NotificationItem } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';

export const fetchNotificationsApi = async (): Promise<NotificationItem[]> => {
  try {
    const response = await apiClient.get('/notifications');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const markNotificationReadApi = async (id: string): Promise<boolean> => {
  try {
    await apiClient.put(`/notifications/${id}/read`);
    return true;
  } catch {
    return true;
  }
};

export const markAllNotificationsReadApi = async (): Promise<boolean> => {
  try {
    await apiClient.put('/notifications/read-all');
    return true;
  } catch {
    return true;
  }
};

