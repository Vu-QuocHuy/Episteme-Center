import axiosInstance from '../utils/axios.customize';

export const createRegistrationAPI = (data: {
  name: string;
  email?: string;
  phone: string;
  gender?: 'male'|'female'|'other';
  address?: string;
  note?: string;
  processed?: boolean;
  classId?: string;
}) => axiosInstance.post(`/registrations`, data);

export const getAllRegistrationsAPI = (params: { page?: number; limit?: number; sort?: string }) => {
  return axiosInstance.get(`/registrations`, { params });
};
