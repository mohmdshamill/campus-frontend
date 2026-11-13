import { apiClient } from './client';
import { ApiResponse, MaintenanceRecord, MaintenanceStatus } from '../types';

export const maintenanceApi = {
  list: async (params?: { resourceId?: string; status?: MaintenanceStatus; page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<MaintenanceRecord[]>>('/maintenance', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<MaintenanceRecord>>(`/maintenance/${id}`);
    return res.data;
  },

  create: async (data: {
    resourceId: string;
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    priority?: string;
    blockResource?: boolean;
  }) => {
    const res = await apiClient.post<ApiResponse<any>>('/maintenance', data);
    return res.data;
  },

  update: async (id: string, data: Partial<MaintenanceRecord>) => {
    const res = await apiClient.patch<ApiResponse<MaintenanceRecord>>(`/maintenance/${id}`, data);
    return res.data;
  },
};
