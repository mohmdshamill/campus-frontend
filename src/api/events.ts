import { apiClient } from './client';
import { ApiResponse, CollegeEvent } from '../types';

export const eventsApi = {
  list: async (params?: { resourceId?: string; isUpcoming?: string; search?: string }) => {
    const res = await apiClient.get<ApiResponse<CollegeEvent[]>>('/events', { params });
    return res.data;
  },

  create: async (data: Partial<CollegeEvent>) => {
    const res = await apiClient.post<ApiResponse<CollegeEvent>>('/events', data);
    return res.data;
  },

  update: async (id: string, data: Partial<CollegeEvent>) => {
    const res = await apiClient.patch<ApiResponse<CollegeEvent>>(`/events/${id}`, data);
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/events/${id}`);
    return res.data;
  },
};
