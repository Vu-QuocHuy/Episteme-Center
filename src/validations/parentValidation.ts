import { validateEmail, validatePhone, validateDayOfBirth, validateAddress, validateGender, validateName, validateChangePassword } from './commonValidation';

export interface ParentFormData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  address: string;
  gender: string;
}

export interface ParentUpdateData {
  canSeeTeacherInfo: boolean;
}

export interface ParentValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: string;
}

export interface ParentUpdateErrors {
  canSeeTeacherInfo?: string;
}

// Có thể mở rộng thêm nếu cần validate riêng cho parent

// Validate toàn bộ form phụ huynh
export function validateParent(form: ParentFormData): ParentValidationErrors {
  const errors: ParentValidationErrors = {};
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
  return errors;
}

// Validate parent update
export function validateParentUpdate(data: ParentUpdateData): ParentUpdateErrors {
  const errors: ParentUpdateErrors = {};

  if (typeof data.canSeeTeacherInfo !== 'boolean') {
    errors.canSeeTeacherInfo = 'Trạng thái xem thông tin giáo viên không hợp lệ';
  }

  return errors;
}

export { validateChangePassword };
