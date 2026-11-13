import { apiClient } from './client';
import { ApiResponse, AuditLog } from '../types';

export const auditApi = {
  list: async (params?: {
    action?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
    return res.data;
  },
};
