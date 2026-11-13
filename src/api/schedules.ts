import { apiClient } from './client';
import { ApiResponse, AcademicSchedule } from '../types';

export const schedulesApi = {
  list: async (params?: { departmentId?: string; resourceId?: string; dayOfWeek?: string }) => {
    const res = await apiClient.get<ApiResponse<AcademicSchedule[]>>('/schedules', { params });
    return res.data;
  },

  create: async (data: Partial<AcademicSchedule>) => {
    const res = await apiClient.post<ApiResponse<any>>('/schedules', data);
    return res.data;
  },

  update: async (id: string, data: Partial<AcademicSchedule>) => {
    const res = await apiClient.patch<ApiResponse<AcademicSchedule>>(`/schedules/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/schedules/${id}`);
    return res.data;
  },
};
