import { apiClient } from './client';
import { ApiResponse, Booking, BookingStatus } from '../types';

export const bookingsApi = {
  exportMyCalendar: async (): Promise<Blob> => {
    const res = await apiClient.get('/bookings/my-bookings.ics', { responseType: 'blob' });
    return res.data;
  },

  list: async (params?: {
    status?: BookingStatus;
    departmentId?: string;
    resourceId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings', { params });
    return res.data;
  },

  getMyBookings: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings/my-bookings', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data;
  },

  create: async (data: {
    resourceId: string;
    startDateTime: string;
    endDateTime: string;
    purpose: string;
    attendeesCount?: number;
    specialRequirements?: string | null;
  }) => {
    const res = await apiClient.post<ApiResponse<Booking>>('/bookings', data);
    return res.data;
  },

  approve: async (id: string, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/approve`, { notes });
    return res.data;
  },

  reject: async (id: string, reason: string) => {
    const res = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/reject`, { reason });
    return res.data;
  },
  

  cancel: async (id: string, reason: string) => {
    const res = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },
};
