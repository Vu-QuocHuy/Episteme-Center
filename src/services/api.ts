import axiosInstance from '../utils/axios.customize';
// import { API_CONFIG } from '../config/api';
import { MenuItem } from '../types';

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

// Auth APIs moved to src/services/auth.ts

// User APIs moved to src/services/users.ts

// Class APIs moved to services/classes.ts

// Student APIs
// Student APIs moved to services/students.ts

// Teacher APIs moved to services/teachers.ts

// Parent APIs moved to services/parents.ts

// Session APIs (Attendance)
// Moved to services/sessions.ts

// Payment APIs moved to services/payments.ts
// Typical teacher detail (homepage featured teachers)
// Moved to sessions/teachers services where applicable

// Schedule APIs
// Kept for backward compatibility if used elsewhere
export const getLoggedInStudentSchedule = () => axiosInstance.get('/schedules/student/me');

// Announcement APIs (Quản lý quảng cáo)
// Announcement APIs moved to services/advertisements.ts (managed there as advertisements)



// Refresh/verification APIs moved to src/services/auth.ts

// Update user (PATCH)
// Update user API moved to src/services/users.ts

// Menu APIs
export interface MenuData {
  title: string;
  slug?: string;
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

// Menu APIs moved to src/services/menus.ts


// Transaction APIs
export interface TransactionData {
  amount: number;
  category_id?: string;
  description: string;
}

// Transaction APIs moved to src/services/transactions.ts

// Transaction Categories APIs
export interface TransactionCategoryData {
  type: 'revenue' | 'expense';
  name: string;
}

// Transaction category APIs moved to src/services/transactions.ts

// File APIs
export interface FileUploadResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    public_id: string;
  };
}

// File APIs moved to src/services/files.ts

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

// Advertisement APIs moved to src/services/advertisements.ts

// Dashboard APIs
// Moved to services/dashboard.ts

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

// Audit APIs moved to src/services/audit.ts

// Feedback APIs
// Feedback APIs moved to src/services/feedback.ts

// Teacher payments report API moved to src/services/payments.ts

// Transaction report API moved to src/services/transactions.ts

// Article APIs
export interface ArticleData {
  title: string;
  content: string;
  menuId: string;
  order?: number;
  isActive?: boolean;
  file?: string;
  publicId?: string;
}

export interface ArticleResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    title: string;
    content: string;
    menuId: string;
    file?: string;
    publicId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ArticlesListResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: ArticleResponse['data'][];
  };
}

// Article APIs moved to src/services/articles.ts

// Registration APIs
// Registration APIs moved to services/registrations.ts

// Legacy API moved to src/services/articles.ts

// Role/Permission APIs moved to services/roles.ts
