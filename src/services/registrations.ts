import axiosInstance from '../utils/axios.customize';

export const createRegistrationAPI = (data: {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  address: string;
  note: string;
  processed: boolean;
  classId: string;
}) => axiosInstance.post(`/registrations`, data);

// Helper function to format filters with quotes for strings, without for boolean/number
const formatFiltersString = (filters: Record<string, any>): string => {
  const parts = Object.entries(filters).map(([key, value]) => {
    if (typeof value === 'string') {
      // Add quotes for string values: {"name":"Nguyễn"}
      return `"${key}":"${value}"`;
    } else if (typeof value === 'boolean') {
      // No quotes for boolean: {processed:false}
      return `${key}:${value}`;
    } else if (typeof value === 'number') {
      // No quotes for number
      return `${key}:${value}`;
    }
    return `${key}:${value}`;
  });
  return `{${parts.join(',')}}`;
};

export const getAllRegistrationsAPI = (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: {
    name?: string;
    email?: string;
    processed?: boolean;
    class?: string;
  };
}) => {
  // Build query params
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.sort) queryParams.sort = params.sort;

  // Format filters with quotes for strings, without for boolean: {"name":"Nguyễn"}, {processed:false}
  if (params?.filters && Object.keys(params.filters).length > 0) {
    queryParams.filters = formatFiltersString(params.filters);
  }

  return axiosInstance.get(`/registrations`, { params: queryParams });
};

export const getRegistrationByIdAPI = (id: string) => {
  return axiosInstance.get(`/registrations/${id}`);
};

export const updateRegistrationAPI = (id: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female';
  address?: string;
  note?: string;
  processed?: boolean;
  classId?: string;
}) => {
  return axiosInstance.patch(`/registrations/${id}`, data);
};

export const deleteRegistrationAPI = (id: string) => {
  return axiosInstance.delete(`/registrations/${id}`);
};
