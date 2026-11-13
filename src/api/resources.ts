import { apiClient } from './client';
import { ApiResponse, Resource, ResourceType } from '../types';

export interface ResourceAvailabilityData {
  resource: Resource;
  date: string;
  dayOfWeek: string;
  busyIntervals: Array<{
    start: string;
    end: string;
    type: string;
    title: string;
    status?: string;
    id?: string;
  }>;
  academicSchedules: any[];
  bookings: any[];
  events: any[];
  maintenance: any[];
}

export const resourcesApi = {
  list: async (params?: {
    search?: string;
    departmentId?: string;
    type?: ResourceType;
    minCapacity?: number;
    isActive?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<Resource[]>>('/resources', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Resource>>(`/resources/${id}`);
    return res.data;
  },

  getAvailability: async (id: string, date: string) => {
    const res = await apiClient.get<ApiResponse<ResourceAvailabilityData>>(
      `/resources/${id}/availability`,
      { params: { date } }
    );
    return res.data;
  },

  create: async (data: Partial<Resource>) => {
    const res = await apiClient.post<ApiResponse<Resource>>('/resources', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Resource>) => {
    const res = await apiClient.patch<ApiResponse<Resource>>(`/resources/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/resources/${id}`);
    return res.data;
  },
};
