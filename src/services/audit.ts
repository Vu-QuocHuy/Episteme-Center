import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

export interface AuditLogItem {
  id: string;
  entityName: string;
  entityId: string | null;
  path: string;
  method: string;
  description: string;
  action?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  changedFields?: string[];
  newValue?: unknown;
  oldValue?: unknown;
}

export interface AuditLogResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: AuditLogItem[];
  };
}

export const getAuditLogsAPI = (params: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 10 } = params;
  return axiosInstance.get<AuditLogResponse>(API_CONFIG.ENDPOINTS.AUDIT!.LOGS, {
    params: { page, limit },
  });
}
