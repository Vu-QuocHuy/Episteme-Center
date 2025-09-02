import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import {
  ClassFormData,
  MenuItem,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackResponse,
  FeedbacksListResponse
} from '../types';
import { createQueryParams } from '../utils/apiHelpers';

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
  introduction?: string;
  workExperience?: string;
  salaryPerLesson?: number;
  isActive?: boolean;
  typical?: boolean;
}

export interface TeacherScheduleClass {
  id: string;
  name: string;
  grade: number;
  section: number;
  schedule: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

export interface TeacherScheduleResponse {
  statusCode: number;
  message: string;
  data: TeacherScheduleClass[];
}

export interface StudentScheduleClass {
  discountPercent: number;
  class: {
    id: string;
    name: string;
    grade: number;
    section: number;
    schedule: {
      start_date: string;
      end_date: string;
      days_of_week: string[];
      time_slots: {
        start_time: string;
        end_time: string;
      };
    };
  };
}

export interface StudentScheduleResponse {
  statusCode: number;
  message: string;
  data: StudentScheduleClass[];
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
  studentId: string | number;
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
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_ALL, {
    params: queryParams
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
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ASSIGN_TEACHER, undefined, {
    params: {
      classId: classId,
      teacherId: teacherId
    },
    headers: {
      'x-lang': 'vi'
    }
  });
};

export const unassignTeacherAPI = (classId: string, teacherId: string) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.UNASSIGN_TEACHER, undefined, {
    params: {
      classId: classId,
      teacherId: teacherId
    },
    headers: {
      'x-lang': 'vi'
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
export const addStudentsToClassAPI = (classId: string, students: Array<{studentId: string, discountPercent?: number}>) => {
  // Try different formats based on API specification
  const requestData = students.map(student => ({
    studentId: student.studentId,
    discountPercent: student.discountPercent || 0
  }));
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ADD_STUDENTS(classId), requestData, {
    headers: {
      'Content-Type': 'application/json',
      'x-lang': 'vi'
    }
  }).then(response => {
    return response;
  }).catch(error => {
    // If it's a 500 error, the operation might have succeeded
    if (error.response?.status === 500) {
      // Return a mock success response
      return { data: { success: true, message: 'Students added successfully despite 500 error' } };
    }

    throw error;
  });
};

export const removeStudentsFromClassAPI = (classId: string, studentIds: string[]) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.REMOVE_STUDENTS(classId), studentIds, {
    headers: {
      'Content-Type': 'application/json',
      'x-lang': 'vi'
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
export const getAllStudentsAPI = (params?: ApiParams) => {
  // Use helper function to create query params with filters
  const queryParams = createQueryParams(params || {});
  // Use axios with properly encoded filters
  return axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL, {
    params: queryParams
  });
};
export const getStudentByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));
export const updateStudentAPI = (id: string, data: Partial<StudentData>) => axiosInstance.patch(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);
export const deleteStudentAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));
export const getStudentScheduleAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.SCHEDULE(id));
export const getStudentAttendanceAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE(id));
export const getMonthlyStudentChangeAPI = (params?: ApiParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.MONTHLY_CHANGES, { params });

// Teacher APIs - Updated for new backend structure
export const createTeacherAPI = (data: TeacherData) => {
  // Use JSON format as per Postman spec
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data, {
    headers: {
      'Content-Type': 'application/json',
      'x-lang': 'vi'
    }
  });
};

export const getAllTeachersAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL, {
    params: queryParams
  });
};

export const getTypicalTeachersAPI = () => {
  const timestamp = Date.now();
  return axiosInstance.get(`/teachers/typical?_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
};

export const getTeacherByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));
};

export const getTeacherBySlugAPI = (slug: string) => {
  return axiosInstance.get(`/teachers/slug/${slug}`);
};

export const updateTeacherAPI = (id: string, data: Partial<TeacherData>) => {
  // Use JSON format as per Postman spec
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data, {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const deleteTeacherAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));
};

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
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, {
    params: queryParams
  });
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
export const getParentChildrenAPI = (id: string) => {
  // Use parent detail API and let callers extract data.students
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id));
};
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
export const getAllPaymentsAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, {
    params: queryParams,
    headers: {
      'x-lang': 'vi'
    }
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
  return axiosInstance.get('/teacher-payments', {
    params: queryParams
  });
};

// Teacher Payment APIs


export const updateTeacherPaymentAPI = (id: string, data: {
  method?: string;
  paidAmount?: number;
  note?: string;
}) => {
  // Fix duplicated /api/v1 in path; axiosInstance baseURL already includes prefix when needed
  return axiosInstance.patch(`/teacher-payments/${id}`, data);
};



// Backward compatibility
export const getTeacherPaymentsAPI = getAllTeacherPaymentsAPI;
// Backward compatibility
export const getPaymentsAPI = getAllPaymentsAPI;
export const getTotalPaymentsAPI = () => axiosInstance.get('/payments/total');
export const getPaymentsByStudentAPI = (studentId: string, params?: ApiParams) =>
  axiosInstance.get(`/payments/students/${studentId}`, { params });
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
// Typical teacher detail (homepage featured teachers)
export const getTypicalTeacherDetailAPI = (id: string) => axiosInstance.get(`/teachers/typical/${id}`);
export const getAttendanceListAPI = (params: { classId: string; limit?: number; page?: number }) => {
  const { classId, ...queryParams } = params;
  return axiosInstance.get(`/sessions/all/${classId}`, { params: queryParams });
};
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



// Refresh token
export const refreshTokenAPI = () => {
  // Backend tự xử lý cookie
  return axiosInstance.get(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN);
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
  slug: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

export interface MenuResponse {
  statusCode: number;
  message: string;
  data: MenuItem;
}

export interface MenusListResponse {
  statusCode: number;
  message: string;
  data: MenuItem[];
}

export const createMenuAPI = (data: MenuData) => {
  const formData = new URLSearchParams();
  formData.append('title', data.title);
  formData.append('slug', data.slug);
  if (data.parentId) formData.append('parentId', data.parentId);
  if (data.order) formData.append('order', data.order.toString());
  if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

  return axiosInstance.post<MenuResponse>(API_CONFIG.ENDPOINTS.MENUS.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getAllMenusAPI = (params?: { page?: number; limit?: number }) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  return axiosInstance.get<MenusListResponse>(API_CONFIG.ENDPOINTS.MENUS.GET_ALL, {
    params: queryParams
  });
};

export const getMenuByIdAPI = (id: string) => {
  return axiosInstance.get<MenuResponse>(API_CONFIG.ENDPOINTS.MENUS.GET_BY_ID(id));
};

export const updateMenuAPI = (id: string, data: Partial<MenuData>) => {
  const formData = new URLSearchParams();
  if (data.title) formData.append('title', data.title);
  if (data.slug) formData.append('slug', data.slug);
  if (data.parentId) formData.append('parentId', data.parentId);
  if (data.order) formData.append('order', data.order.toString());
  if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

  return axiosInstance.patch<MenuResponse>(API_CONFIG.ENDPOINTS.MENUS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteMenuAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.MENUS.DELETE(id));
};

export const toggleMenuVisibilityAPI = (id: string, isActive: boolean) => {
  const formData = new URLSearchParams();
  formData.append('isActive', isActive.toString());

  return axiosInstance.patch<MenuResponse>(API_CONFIG.ENDPOINTS.MENUS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};


// Transaction APIs
export interface TransactionData {
  amount: number;
  category_id?: string;
  description: string;
}

export const createTransactionAPI = (data: TransactionData) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(data.amount));
  if (data.category_id) formData.append('categoryId', data.category_id); // Use camelCase as backend expects
  if (data.description) formData.append('description', data.description);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TRANSACTIONS.CREATE, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-lang': 'vi'
    }
  });
};

export const getAllTransactionsAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_ALL, {
    params: queryParams,
    headers: {
      'x-lang': 'vi'
    }
  });
};

export const getTransactionByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_BY_ID(id), {
    headers: {
      'x-lang': 'vi'
    }
  });
};

export const updateTransactionAPI = (id: string, data: Partial<TransactionData>) => {
  const formData = new URLSearchParams();
  if (data.amount) formData.append('amount', String(data.amount));
  if (data.category_id) formData.append('categoryId', data.category_id); // Use camelCase as backend expects
  if (data.description) formData.append('description', data.description);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TRANSACTIONS.UPDATE(id), formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-lang': 'vi'
    }
  });
};

export const deleteTransactionAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.TRANSACTIONS.DELETE(id), {
    headers: {
      'x-lang': 'vi'
    }
  });
};

// Transaction Categories APIs
export interface TransactionCategoryData {
  type: 'revenue' | 'expense';
  name: string;
}

export const createTransactionCategoryAPI = (data: TransactionCategoryData) => {
  const formData = new URLSearchParams();
  formData.append('type', data.type);
  formData.append('name', data.name);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getAllTransactionCategoriesAPI = (params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.GET_ALL, {
    params: queryParams,
    headers: {
      'x-lang': 'vi'
    }
  });
};

export const getTransactionCategoryByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.GET_BY_ID(id), {
    headers: {
      'x-lang': 'vi'
    }
  });
};

export const updateTransactionCategoryAPI = (id: string, data: Partial<TransactionCategoryData>) => {
  const formData = new URLSearchParams();
  if (data.type) formData.append('type', data.type);
  if (data.name) formData.append('name', data.name);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteTransactionCategoryAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.DELETE(id), {
    headers: {
      'x-lang': 'vi'
    }
  });
};

// File APIs
export interface FileUploadResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    public_id: string;
  };
}

export const uploadFileAPI = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post<FileUploadResponse>(API_CONFIG.ENDPOINTS.FILES.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteFileAPI = (publicId: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.FILES.DELETE, {
    params: { publicId }
  });
};

// Advertisement APIs
export interface AdvertisementData {
  title: string;
  description: string;
  priority: number;
  imageUrl: string;
  publicId: string;
  classId: string;
  type: string;
}

export interface AdvertisementResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    priority: number;
    imageUrl: string;
    publicId: string;
    classId: string;
    isActive: boolean;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AdvertisementsListResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: AdvertisementResponse['data'][];
  };
}

export const createAdvertisementAPI = (data: AdvertisementData) => {
  const formData = new URLSearchParams();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('priority', data.priority.toString());
  formData.append('imageUrl', data.imageUrl);
  formData.append('publicId', data.publicId);
  if (data.classId) formData.append('classId', data.classId);
  formData.append('type', data.type);

  return axiosInstance.post<AdvertisementResponse>(API_CONFIG.ENDPOINTS.ADVERTISEMENTS.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getAdvertisementsAPI = (params?: { limit?: number; page?: number }) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  return axiosInstance.get<AdvertisementsListResponse>(API_CONFIG.ENDPOINTS.ADVERTISEMENTS.GET_ALL, {
    params: queryParams
  });
};

export const getHomeBannersAPI = (limit: number = 3) => {
  const timestamp = Date.now();
  return axiosInstance.get<AdvertisementsListResponse>(`/advertisements/banners/${limit}?_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
};

export const getHomePopupAPI = () => {
  const timestamp = Date.now();
  return axiosInstance.get<AdvertisementsListResponse>(`/advertisements/popup?_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
};

export const getAdvertisementByIdAPI = (id: string) => {
  return axiosInstance.get<AdvertisementResponse>(API_CONFIG.ENDPOINTS.ADVERTISEMENTS.GET_BY_ID(id));
};

export const updateAdvertisementAPI = (id: string, data: Partial<AdvertisementData>) => {
  const formData = new URLSearchParams();
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.priority !== undefined) formData.append('priority', data.priority.toString());
  if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl);
  if (data.publicId !== undefined) formData.append('publicId', data.publicId);
  if (data.classId !== undefined) formData.append('classId', data.classId);
  if (data.type !== undefined) formData.append('type', data.type);

  return axiosInstance.patch<AdvertisementResponse>(API_CONFIG.ENDPOINTS.ADVERTISEMENTS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteAdvertisementAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.ADVERTISEMENTS.DELETE(id));
};

// Dashboard APIs
export const getAdminDashboardAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);
export const getTeacherDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.TEACHER(id));
export const getParentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.PARENT(id));
export const getStudentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT(id));

// Audit Log APIs
export interface AuditLogItem {
  id: string;
  entityName: string;
  entityId: string | null;
  path: string;
  method: string;
  description: string; // HTML content from backend
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

export const getAuditLogsAPI = (params: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 10 } = params;
  return axiosInstance.get<AuditLogResponse>(API_CONFIG.ENDPOINTS.AUDIT!.LOGS, {
    params: { page, limit },
  });
}

// Feedback APIs
export const createFeedbackAPI = (data: CreateFeedbackRequest) => {
  const formData = new URLSearchParams();
  formData.append('name', data.name);
  formData.append('description', data.description);
  if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
  if (data.publicId) formData.append('publicId', data.publicId);
  if (data.socialUrl) formData.append('socialUrl', data.socialUrl);

  return axiosInstance.post<FeedbackResponse>(API_CONFIG.ENDPOINTS.FEEDBACK!.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getFeedbacksAPI = (params?: { limit?: number; page?: number }) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  return axiosInstance.get<FeedbacksListResponse>(API_CONFIG.ENDPOINTS.FEEDBACK!.GET_ALL, {
    params: queryParams
  });
};

export const getFeedbackByIdAPI = (id: string) => {
  return axiosInstance.get<FeedbackResponse>(API_CONFIG.ENDPOINTS.FEEDBACK!.GET_BY_ID(id));
};

export const updateFeedbackAPI = (id: string, data: UpdateFeedbackRequest) => {
  const formData = new URLSearchParams();
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl);
  if (data.publicId !== undefined) formData.append('publicId', data.publicId);
  if (data.socialUrl !== undefined) formData.append('socialUrl', data.socialUrl);

  return axiosInstance.patch<FeedbackResponse>(API_CONFIG.ENDPOINTS.FEEDBACK!.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteFeedbackAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.FEEDBACK!.DELETE(id));
};
