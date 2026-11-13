import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
    departmentId?: string | null;
    phone?: string | null;
  }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      data
    );
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse<{ message: string; resetToken?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return res.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      { token, newPassword }
    );
    return res.data;
  },
};
