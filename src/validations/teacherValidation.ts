import { validateEmail, validatePhone, validateDayOfBirth, validateAddress, validateGender, validateName, validatePassword, validateChangePassword } from './commonValidation';

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  address: string;
  gender: string;
  salaryPerLesson?: string | number;
  qualifications: string;
  specialization: string;
  description: string;
}

export interface TeacherUpdateData {
  description: string;
  isActive: boolean;
}

export interface TeacherValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: string;
  salaryPerLesson?: string;
  qualifications?: string;
  specialization?: string;
  description?: string;
}

export interface TeacherUpdateErrors {
  description?: string;
  isActive?: string;
}

// Có thể mở rộng thêm nếu cần validate riêng cho teacher

// Validate toàn bộ form giáo viên
export function validateTeacher(form: TeacherFormData): TeacherValidationErrors {
  const errors: TeacherValidationErrors = {};
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;
  const dobError = validateDayOfBirth(form.dayOfBirth);
  if (dobError) errors.dayOfBirth = dobError;
  const addressError = validateAddress(form.address);
  if (addressError) errors.address = addressError;
  const genderError = validateGender(form.gender);
  if (genderError) errors.gender = genderError;

  // Validate salaryPerLesson (>=0)
  if (form.salaryPerLesson === undefined || form.salaryPerLesson === null || form.salaryPerLesson === '') {
    errors.salaryPerLesson = 'Lương không được để trống';
  } else if (isNaN(Number(form.salaryPerLesson)) || Number(form.salaryPerLesson) < 0) {
    errors.salaryPerLesson = 'Lương phải là số lớn hơn hoặc bằng 0';
  }

  // Validate qualifications, specialization, description (không được để trống)
  if (!form.qualifications || form.qualifications.trim() === '') {
    errors.qualifications = 'Bằng cấp không được để trống';
  }
  if (!form.specialization || form.specialization.trim() === '') {
    errors.specialization = 'Chuyên môn không được để trống';
  }
  if (!form.description || form.description.trim() === '') {
    errors.description = 'Mô tả không được để trống';
  }

  return errors;
}

// Validate teacher update
export function validateTeacherUpdate(data: TeacherUpdateData): TeacherUpdateErrors {
  const errors: TeacherUpdateErrors = {};

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Mô tả không được để trống';
  }

  if (typeof data.isActive !== 'boolean') {
    errors.isActive = 'Trạng thái hoạt động không hợp lệ';
  }

  return errors;
}

export {
  validateEmail,
  validatePhone,
  validateDayOfBirth,
  validateAddress,
  validateGender,
  validateName,
  validatePassword,
  validateChangePassword,
};
