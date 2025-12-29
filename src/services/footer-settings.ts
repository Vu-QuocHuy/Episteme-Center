import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import { FooterSettings } from '../hooks/useFooterSettings';

export const getFooterSettingsAPI = () =>
  axiosInstance.get<FooterSettings>(API_CONFIG.ENDPOINTS.FOOTER_SETTINGS.GET, {
    headers: { 'x-lang': 'vi' }
  });

export const createFooterSettingsAPI = (data: FooterSettings) =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.FOOTER_SETTINGS.CREATE, data, {
    headers: { 'Content-Type': 'application/json' }
  });

export const updateFooterSettingsAPI = (data: Partial<FooterSettings>) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.FOOTER_SETTINGS.UPDATE, data, {
    headers: { 'Content-Type': 'application/json' }
  });

