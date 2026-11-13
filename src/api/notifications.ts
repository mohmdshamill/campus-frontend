import { apiClient } from './client';
import { ApiResponse, Notification } from '../types';

export const notificationsApi = {
  list: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const res = await apiClient.get<ApiResponse<Notification[]>>('/notifications', { params });
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch<ApiResponse<null>>('/notifications/read-all');
    return res.data;
  },
};
