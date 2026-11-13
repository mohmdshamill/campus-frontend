import { apiClient } from './client';
import { ApiResponse, Department } from '../types';

export const departmentsApi = {
  list: async (params?: { search?: string; isActive?: string }) => {
    const res = await apiClient.get<ApiResponse<Department[]>>('/departments', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data;
  },

  create: async (data: Partial<Department>) => {
    const res = await apiClient.post<ApiResponse<Department>>('/departments', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Department>) => {
    const res = await apiClient.patch<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data;
  },

  assignCoordinator: async (departmentId: string, data: { userId: string; roleInDept?: string; isPrimary?: boolean }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/departments/${departmentId}/coordinators`, data);
    return res.data;
  },

  removeCoordinator: async (departmentId: string, userId: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/departments/${departmentId}/coordinators/${userId}`);
    return res.data;
  },
};
