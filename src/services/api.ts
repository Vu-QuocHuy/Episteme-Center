import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import { ClassFormData, HomeContentFormData } from '../types';

// Type definitions for API parameters and responses
export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
}

export interface ClassData {
  name: string;
  grade?: number;
  section?: number;
  year?: number;
  description?: string;
  feePerLesson?: number;
  status?: 'active' | 'inactive';
  max_student?: number;
  room?: string;
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

export interface StudentData {
  name: string;
  email?: string;
  password?: string;
  gender?: 'male' | 'female';
  dayOfBirth?: string;
  address?: string;
  phone?: string;
}

export interface TeacherData {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dayOfBirth?: string;
  address?: string;
  password?: string;
  description?: string;
  qualifications?: string[];
  specializations?: string[];
  salaryPerLesson?: number;
  isActive?: boolean;
}

export interface ParentData {
  name: string;
  email?: string;
  password?: string;
  gender?: 'male' | 'female';
  dayOfBirth?: string;
  address?: string;
  phone?: string;
}

export interface AttendanceData {
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  isModified?: boolean;
  note?: string;
}

export interface PaymentData {
  amount: number;
  method?: string;
  note?: string;
}

export interface AnnouncementData {
  title: string;
  content: string;
  image?: File;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: any;
}

// Auth APIs
export const registerAPI = (data: any) => axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
export const registerAdminAPI = (data: any) => axiosInstance.post(API_CONFIG.ENDPOINTS.ADMIN.CREATE, data);
export const loginUserAPI = (data: LoginData) => {
  const formData = new URLSearchParams();
  formData.append('email', data.email);
  formData.append('password', data.password);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.USER_LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const loginAdminAPI = (data: LoginData) => {
  const formData = new URLSearchParams();
  formData.append('email', data.email);
  formData.append('password', data.password);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
// Backward compatibility
export const loginAPI = loginUserAPI;

export const changePasswordAPI = (oldPassword: string, newPassword: string) => {
  const formData = new URLSearchParams();
  formData.append('oldPassword', oldPassword);
  formData.append('newPassword', newPassword);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const logoutAPI = (refreshToken: string) => {
  const formData = new URLSearchParams();
  formData.append('refreshToken', refreshToken);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const forgotPasswordAPI = (email: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const verifyCodeAPI = (code: string, email: string) => {
  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const resetPasswordAPI = (email: string, code: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('code', code);
  formData.append('password', password);

  console.log('resetPasswordAPI debug:', {
    email,
    code,
    password,
    formDataString: formData.toString()
  });

  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// User APIs
export const uploadAvatarAPI = (formData: FormData) => axiosInstance.post(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, formData);
export const getUserByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

// Class APIs
export const createClassAPI = (data: ClassFormData) => {
  return axiosInstance.post(API_CONFIG.ENDPOINTS.CLASSES.CREATE, data, {
    headers: {
      'Content-Type': 'application/json',
      'x-lang': 'vi',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getAllClassesAPI = (params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.filters) queryParams.filters = params.filters;

  return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_ALL, {
    params: queryParams,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getClassByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_BY_ID(id), {
    headers: {
      'x-lang': 'vi',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const updateClassAPI = (id: string, data: Partial<ClassFormData>) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.UPDATE(id), data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const deleteClassAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.DELETE ? API_CONFIG.ENDPOINTS.CLASSES.DELETE(id) : `/classes/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const assignTeacherAPI = (classId: string, teacherId: string) => {
  return axiosInstance.patch(`${API_CONFIG.ENDPOINTS.CLASSES.ASSIGN_TEACHER}?classId=${classId}&teacherId=${teacherId}`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const unassignTeacherAPI = (classId: string, teacherId: string) => {
  return axiosInstance.patch(`${API_CONFIG.ENDPOINTS.CLASSES.UNASSIGN_TEACHER}?classId=${classId}&teacherId=${teacherId}`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getAvailableStudentsAPI = (classId: string, params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_AVAILABLE_STUDENTS(classId), {
    params: queryParams,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};
export const addStudentsToClassAPI = (classId: string, students: Array<{studentId: number, discountPercent?: number}>) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ADD_STUDENTS(classId), students, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const removeStudentsFromClassAPI = (classId: string, studentIds: string[]) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.REMOVE_STUDENTS(classId), studentIds, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};
// Backward compatibility
export const enrollStudentAPI = addStudentsToClassAPI;
export const removeStudentFromClassAPI = (classId: string, studentId: string) => removeStudentsFromClassAPI(classId, [studentId]);
export const getStudentsInClassAPI = (classId: string, params?: ApiParams) => {
  // Sử dụng endpoint get class by id và extract students từ response
  return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_BY_ID(classId), { params });
};

// Student APIs
export const createStudentAPI = (data: StudentData) => axiosInstance.post(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);
export const getAllStudentsAPI = (params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL, { params });
export const getStudentByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));
export const updateStudentAPI = (id: string, data: Partial<StudentData>) => axiosInstance.patch(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);
export const deleteStudentAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));
export const getStudentScheduleAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.SCHEDULE(id));
export const getStudentAttendanceAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE(id));
export const getMonthlyStudentChangeAPI = (params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.MONTHLY_CHANGES, { params });

// Teacher APIs - Updated for new backend structure
export const createTeacherAPI = (data: TeacherData) => {
  console.log('📊 Teacher API Create Request:', data);

  // Use JSON format as per Postman spec
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data, {
    headers: {
      'Content-Type': 'application/json',
      'x-lang': 'vi'
    }
  });
};

export const getAllTeachersAPI = (params?: ApiParams) => {
  console.log('📊 Teachers API Request:', params);

  // Build query params for pagination
  const queryParams: any = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  // Handle search/filters - no filters mentioned in Postman spec
  // Keep simple pagination only

  return axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL, {
    params: queryParams,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
};

export const getTeacherByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));
};

export const updateTeacherAPI = (id: string, data: Partial<TeacherData>) => {
  console.log('📊 Teacher API Update Request:', data);

  // Use JSON format as per Postman spec
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data, {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const deleteTeacherAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));

// Teacher schedule API
export const getTeacherScheduleAPI = (id: string) => axiosInstance.get(`/teachers/schedule/${id}`);

// Legacy APIs for backward compatibility
export const getMyClassesAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_MY_CLASSES);

// Parent APIs - Updated for new backend structure
export const createParentAPI = (data: ParentData) => {
  // Convert to FormData for URL-encoded format as per Postman spec
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.CREATE, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-lang': 'vi'
    }
  });
};

export const getAllParentsAPI = (params?: ApiParams) => {
  console.log('📊 Parents API Request:', params);

  // Build query params for pagination and filters
  const queryParams: any = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  // Handle search/filters - similar to students API
  if (params?.name) {
    const filters = { name: params.name };
    queryParams.filters = JSON.stringify(filters);
  }

  return axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, { params: queryParams });
};

export const getParentByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id), {
    headers: { 'x-lang': 'vi' }
  });
};

export const updateParentAPI = (id: string, data: Partial<ParentData>) => {
  // Convert to FormData for URL-encoded format
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteParentAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.DELETE(id));

// New parent-child management APIs
export const addChildToParentAPI = (studentId: string, parentId: string) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);

  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const removeChildFromParentAPI = (studentId: string, parentId: string) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);

  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const payTuitionFeeAPI = () => {
  // TODO: Implement when backend API is ready
  return axiosInstance.get('/parents/pay-tuition-fee');
};

// Legacy API for backward compatibility
export const getParentChildrenAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_CHILDREN(id));
export const addChildAPI = (studentId: string, parentId: string) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const removeChildAPI = (studentId: string, parentId: string) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const payTuitionAPI = (data: any) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION_FEE, data);

// Session APIs (Attendance)
export const getTodaySessionAPI = (classId: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_TODAY(classId));
export const updateSessionAttendanceAPI = (sessionId: string, data: AttendanceData[]) => axiosInstance.patch(API_CONFIG.ENDPOINTS.SESSIONS.UPDATE_ATTENDANCE(sessionId), data);
export const getSessionsByClassAPI = (classId: string, params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_ALL_BY_CLASS(classId), { params });
export const getSessionsByStudentAPI = (studentId: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_BY_STUDENT(studentId));
// Backward compatibility
export const getTodayAttendanceAPI = getTodaySessionAPI;
export const updateAttendanceAPI = (id: string, data: AttendanceData) => updateSessionAttendanceAPI(id, [data]);

// Payment APIs
export const getAllPaymentsAPI = (params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, { params });
export const payStudentAPI = (paymentId: string, data: PaymentData) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(Number(data.amount)));
  if (data.method) formData.append('method', data.method);
  if (data.note) formData.append('note', data.note);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PAYMENTS.PAY_STUDENT(paymentId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const getTeacherPaymentsAPI = (params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENTS, { params });
// Backward compatibility
export const getPaymentsAPI = getAllPaymentsAPI;
export const getTotalPaymentsAPI = () => axiosInstance.get('/payments/total');
export const getPaymentsByStudentAPI = (studentId: string, params?: ApiParams) => axiosInstance.get(`/payments?studentId=${studentId}`, { params });
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
export const getAttendanceListAPI = (params?: ApiParams) => axiosInstance.get('/attendances/all', { params });
export const getAttendanceByIdAPI = (id: string) => axiosInstance.get(`/attendances/${id}`);

// Schedule APIs
export const getLoggedInStudentSchedule = () => axiosInstance.get(API_CONFIG.ENDPOINTS.SCHEDULES.GET_STUDENT_SCHEDULE);

// Announcement APIs (Quản lý quảng cáo)
export const createAnnouncementAPI = (data: AnnouncementData) =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.CREATE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getAllAnnouncementsAPI = (params?: ApiParams) => {
  // Temporary check for development - can be removed when API is ready
  const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';
  if (isDevelopment && import.meta.env.VITE_MOCK_ANNOUNCEMENTS === 'true') {
    return Promise.resolve({ data: [] }); // Return empty data for development
  }
  return axiosInstance.get(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_ALL, { params });
};

export const getAnnouncementByIdAPI = (id: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_BY_ID(id));

export const updateAnnouncementAPI = (id: string, data: Partial<AnnouncementData>) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteAnnouncementAPI = (id: string) =>
  axiosInstance.delete(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.DELETE(id));

// Home Content APIs
export const createHomeContentAPI = (data: HomeContentFormData) => {
  return axiosInstance.post(API_CONFIG.ENDPOINTS.HOME_CONTENT.CREATE, data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getAllHomeContentAPI = (params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.section) queryParams.section = params.section;

  return axiosInstance.get(API_CONFIG.ENDPOINTS.HOME_CONTENT.GET_ALL, {
    params: queryParams,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getHomeContentByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.HOME_CONTENT.GET_BY_ID(id), {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const updateHomeContentAPI = (id: string, data: Partial<HomeContentFormData>) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.HOME_CONTENT.UPDATE(id), data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const deleteHomeContentAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.HOME_CONTENT.DELETE(id), {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getHomeContentBySectionAPI = (section: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.HOME_CONTENT.GET_BY_SECTION(section));
};

export const getActiveHomeContentAPI = () => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.HOME_CONTENT.GET_ACTIVE);
};

// Refresh token
export const refreshTokenAPI = (refreshToken?: string) => {
  // Use the new refresh endpoint with Authorization header
  const config = refreshToken ? {
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    }
  } : {};
  return axiosInstance.get(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, config);
};

// Gửi email xác thực
export const sendVerificationEmailAPI = () =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL);

// Xác thực email
export const verifyEmailAPI = (token: string) =>
  axiosInstance.post(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);

// Update user (PATCH)
export const updateUserAPI = (userId: string, data: UserUpdateData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// Menu APIs
export interface MenuData {
  title: string;
  url: string;
  parentId?: string;
}

export const createMenuAPI = (data: MenuData) => axiosInstance.post(API_CONFIG.ENDPOINTS.MENUS.CREATE, data);
export const getAllMenusAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.MENUS.GET_ALL);
export const updateMenuAPI = (id: string, data: Partial<MenuData>) => axiosInstance.patch(API_CONFIG.ENDPOINTS.MENUS.UPDATE(id), data);
export const deleteMenuAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.MENUS.DELETE(id));

// Transaction APIs
export interface TransactionData {
  amount: number;
  type: 'revenue' | 'expense';
  description: string;
}

export const createTransactionAPI = (data: TransactionData) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(data.amount));
  formData.append('type', data.type);
  formData.append('description', data.description);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TRANSACTIONS.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const getAllTransactionsAPI = (params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_ALL, { params });
export const getTransactionByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_BY_ID(id));
export const updateTransactionAPI = (id: string, data: Partial<TransactionData>) => {
  const formData = new URLSearchParams();
  if (data.amount) formData.append('amount', String(data.amount));
  if (data.type) formData.append('type', data.type);
  if (data.description) formData.append('description', data.description);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TRANSACTIONS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const deleteTransactionAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.TRANSACTIONS.DELETE(id));

// Dashboard APIs
export const getAdminDashboardAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);
export const getTeacherDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.TEACHER(id));
export const getParentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.PARENT(id));
export const getStudentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT(id));

// Audit Log APIs
export interface AuditLogChange {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditLogItem {
  id: string;
  entity: string;
  entityId: string | null;
  path: string;
  method: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  changes: AuditLogChange[];
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
};
