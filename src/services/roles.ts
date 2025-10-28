import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import type { CreateRoleRequest, UpdateRoleRequest } from '../types';

export const getAllRolesAPI = (params?: any) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.ROLES.GET_ALL, { params });
export const getRoleByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.ROLES.GET_BY_ID(id));
export const createRoleAPI = (data: CreateRoleRequest) => axiosInstance.post(API_CONFIG.ENDPOINTS.ROLES.CREATE, data);
export const updateRoleAPI = (id: number, data: UpdateRoleRequest) => axiosInstance.patch(API_CONFIG.ENDPOINTS.ROLES.UPDATE(id.toString()), data);
export const deleteRoleAPI = (id: number) => axiosInstance.delete(API_CONFIG.ENDPOINTS.ROLES.DELETE(id.toString()));
export const getAllPermissionsAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_ALL);
