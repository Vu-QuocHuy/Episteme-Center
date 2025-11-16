import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

/**
 * Manually trigger update class status cron job
 * This will update class status based on their start/end dates
 */
export const manualUpdateClassStatusAPI = () => {
  return axiosInstance.post(API_CONFIG.ENDPOINTS.CRON.UPDATE_CLASS_STATUS);
};

