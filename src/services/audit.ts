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

export interface AuditLogFilters {
  userEmail?: string;
  entityName?: string;
  entityId?: string;
  startTime?: Date;
  endTime?: Date;
}

export const getAuditLogsAPI = (params: {
  page?: number;
  limit?: number;
  filter?: AuditLogFilters;
} = {}) => {
  const { page = 1, limit = 10, filter } = params;

  const queryParams: any = { page, limit };

  if (filter && Object.keys(filter).length > 0) {
    // Convert Date objects to ISO strings in the filter object
    const filterWithISODates: any = { ...filter };
    if (filter.startTime) filterWithISODates.startTime = filter.startTime.toISOString();
    if (filter.endTime) filterWithISODates.endTime = filter.endTime.toISOString();

    // Stringify the entire filter object
    queryParams.filters = JSON.stringify(filterWithISODates);
  }

  return axiosInstance.get<AuditLogResponse>(API_CONFIG.ENDPOINTS.AUDIT!.LOGS, {
    params: queryParams,
  });
}
