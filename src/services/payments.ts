import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import { createQueryParams } from '../utils/apiHelpers';
import type { ApiParams, PaymentData } from './api';

export const getAllPaymentsAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, {
    params: queryParams,
    headers: { 'x-lang': 'vi' }
  });
};

export const payStudentAPI = (paymentId: string, data: PaymentData) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(Number(data.amount)));
  if (data.method) formData.append('method', data.method);
  if (data.note) formData.append('note', data.note);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PAYMENTS.PAY_STUDENT(paymentId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getAllTeacherPaymentsAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get('/teacher-payments', { params: queryParams });
};

export const updateTeacherPaymentAPI = (id: string, data: {
  method?: string;
  paidAmount?: number;
  note?: string;
}) => axiosInstance.patch(`/teacher-payments/${id}`, data);

export const getTeacherPaymentsAPI = getAllTeacherPaymentsAPI;
export const getPaymentsAPI = getAllPaymentsAPI;
export const getTotalPaymentsAPI = () => axiosInstance.get('/payments/total');
export const getPaymentsByStudentAPI = (studentId: string, params?: ApiParams) =>
  axiosInstance.get(`/payments/students/${studentId}`, { params });

export const exportPaymentsReportAPI = (filters?: Record<string, any>) => {
  const params: Record<string, any> = {};
  if (filters && Object.keys(filters).length > 0) {
    params.filters = typeof filters === 'string' ? filters : JSON.stringify(filters);
  }
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.EXPORT_REPORT, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Accept': 'application/json'
    },
    params
  });
};

export const payTeacherAPI = (id: string, data: PaymentData, params: ApiParams = {}) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(Number(data.amount)));
  if (data.method) formData.append('method', data.method);
  if (data.note) formData.append('note', data.note);
  return axiosInstance.post(`/teacher-payments/${id}/pay`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params
  });
};

export const getTeacherPaymentByIdAPI = (id: string) => axiosInstance.get(`/teacher-payments/${id}`);

export const exportTeacherPaymentsReportAPI = (filters?: Record<string, any>) => {
  const params: Record<string, any> = {};
  if (filters && Object.keys(filters).length > 0) {
    params.filters = typeof filters === 'string' ? filters : JSON.stringify(filters);
  }
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.TEACHER_EXPORT_REPORT, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Accept': 'application/json'
    },
    params
  });
};

export const payTuitionAPI = (data: any) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION_FEE, data);

// Get QR Code for Payment
export const getQRCodeAPI = (amount: number, paymentId: string) => {
  // Đảm bảo amount là số nguyên (integer) và > 0
  const amountInt = Math.floor(Math.abs(Number(amount)));

  if (amountInt <= 0 || isNaN(amountInt)) {
    throw new Error('Số tiền phải là số nguyên lớn hơn 0');
  }

  // Vấn đề: XMLHttpRequest không gửi body trong GET request theo HTTP spec
  // Postman có thể làm được với disableBodyPruning, nhưng browser không
  // Giải pháp: Gửi qua query params thay vì body
  // Backend đã được điều chỉnh để đọc từ @Query() thay vì @Body()

  // Sử dụng axios.get với params option để axios tự động encode query params
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_QR_CODE, {
    params: {
      amount: amountInt,
      paymentId: paymentId
    },
    headers: {
      'x-lang': 'vi'
    },
    withCredentials: true
  });
};
