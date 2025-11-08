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
  // Build query params with filters as JSON string
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.sort) queryParams.sort = params.sort;

  // Backend expects filters as JSON string
  if (params?.filters && Object.keys(params.filters).length > 0) {
    queryParams.filters = JSON.stringify(params.filters);
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
