import { apiClient } from './client';
import { ApiResponse, User, Role } from '../types';

export const usersApi = {
  list: async (params?: {
    search?: string;
    role?: Role;
    departmentId?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return res.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    collegeId?: string | null;
    phone?: string | null;
    departmentId?: string | null;
  }) => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      role?: Role;
      departmentId?: string | null;
      isActive?: boolean;
      phone?: string | null;
    }
  ) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },
};
