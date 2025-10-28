import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
export type { MenuData } from './api';

export const createMenuAPI = (data: any) => axiosInstance.post(API_CONFIG.ENDPOINTS.MENUS.CREATE, data);
export const getAllMenusAPI = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.MENUS.GET_ALL, { params });
export const getMenuByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.MENUS.GET_BY_ID(id));
export const getMenuBySlugAPI = (slug: string) => axiosInstance.get(`/menus/slug/${slug}`);
export const updateMenuAPI = (id: string, data: any) => axiosInstance.patch(`/menus/${id}`, data);
export const deleteMenuAPI = (id: string) => axiosInstance.delete(`/menus/${id}`);
export const toggleMenuVisibilityAPI = (id: string, isActive: boolean) => axiosInstance.patch(`/menus/${id}`, { isActive });
