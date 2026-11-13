import { apiClient } from './client';
import { ApiResponse, Equipment, EquipmentCondition, EquipmentTransaction } from '../types';

export const equipmentApi = {
  list: async (params?: {
    departmentId?: string;
    category?: string;
    search?: string;
    condition?: EquipmentCondition;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<Equipment[]>>('/equipment', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Equipment>>(`/equipment/${id}`);
    return res.data;
  },

  create: async (data: Partial<Equipment>) => {
    const res = await apiClient.post<ApiResponse<Equipment>>('/equipment', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Equipment>) => {
    const res = await apiClient.patch<ApiResponse<Equipment>>(`/equipment/${id}`, data);
    return res.data;
  },

  borrow: async (data: {
    equipmentId: string;
    quantity: number;
    expectedReturnDate: string;
    purpose: string;
    notes?: string | null;
  }) => {
    const res = await apiClient.post<ApiResponse<EquipmentTransaction>>('/equipment/borrow', data);
    return res.data;
  },

  issue: async (id: string, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<EquipmentTransaction>>(
      `/equipment/transactions/${id}/issue`,
      { notes }
    );
    return res.data;
  },

  returnItem: async (
    id: string,
    data: {
      conditionOnReturn: EquipmentCondition;
      status: 'RETURNED' | 'DAMAGED_RETURN' | 'LOST';
      notes?: string | null;
    }
  ) => {
    const res = await apiClient.patch<ApiResponse<EquipmentTransaction>>(
      `/equipment/transactions/${id}/return`,
      data
    );
    return res.data;
  },

  listTransactions: async (params?: {
    status?: string;
    departmentId?: string;
    isOverdue?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<EquipmentTransaction[]>>('/equipment/transactions', {
      params,
    });
    return res.data;
  },
};
