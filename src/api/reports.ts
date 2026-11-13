import { apiClient } from './client';
import { ApiResponse } from '../types';

export const reportsApi = {
  getAdminDashboard: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/dashboard/admin');
    return res.data;
  },

  getCoordinatorDashboard: async (departmentId?: string) => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/dashboard/coordinator', {
      params: { departmentId },
    });
    return res.data;
  },

  getStudentDashboard: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/dashboard/student');
    return res.data;
  },

  getAnalytics: async (params?: { startDate?: string; endDate?: string; departmentId?: string }) => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/analytics', { params });
    return res.data;
  },

  exportBookingsCsv: async (params?: { startDate?: string; endDate?: string; departmentId?: string }) => {
    const res = await apiClient.get('/reports/export/bookings', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};
