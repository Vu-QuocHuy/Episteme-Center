import { useState, useCallback } from 'react';
import { createTeacherAPI, updateTeacherAPI } from '../../services/api';
import { Teacher, UseFormReturn, FormErrors } from '../../types';
import { validateTeacher } from '../../validations/teacherValidation';

export const useTeacherForm = (): UseFormReturn<Teacher> => {
  const [form, setForm] = useState<Teacher>({
    id: '',
    userId: {
      id: '',
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      role: 'teacher',
    },
    isActive: true,
    description: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;

    setForm(prev => ({
      ...prev,
      ...(name.includes('.')
        ? {
            userId: {
              ...prev.userId,
              [name.split('.')[1]]: type === 'checkbox' ? checked : value,
            },
          }
        : {
            [name]: type === 'checkbox' ? checked : value,
          }
      ),
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [formErrors]);

  const setFormData = useCallback((data?: Teacher): void => {
    if (data) {
      setForm(data);
    } else {
      setForm({
        id: '',
        userId: {
          id: '',
          name: '',
          email: '',
          phone: '',
          gender: 'male',
          role: 'teacher',
        },
        isActive: true,
        description: '',
      });
    }
    setFormErrors({});
    setFormError('');
  }, []);

  const resetForm = useCallback((): void => {
    setForm({
      id: '',
      userId: {
        id: '',
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        role: 'teacher',
      },
      isActive: true,
      description: '',
    });
    setFormErrors({});
    setFormError('');
  }, []);

  const handleSubmit = useCallback(async (
    data?: Teacher,
    onSuccess?: () => void
  ): Promise<{ success: boolean; message?: string }> => {
    const teacherData = data || form;

    // Validate form
    const teacherFormData = {
      name: teacherData.userId?.name || '',
      email: teacherData.userId?.email || '',
      phone: teacherData.userId?.phone || '',
      dayOfBirth: teacherData.userId?.dayOfBirth || '',
      address: teacherData.userId?.address || '',
      gender: teacherData.userId?.gender || '',
      description: teacherData.description || '',
      salaryPerLesson: 0,
      qualifications: '',
      specialization: teacherData.specialization || ''
    };
    const errors = validateTeacher(teacherFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors as any);
      return { success: false, message: 'Vui lòng kiểm tra lại thông tin' };
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (teacherData.id) {
        // Update existing teacher
        await updateTeacherAPI(teacherData.id, teacherData);
      } else {
        // Create new teacher
        const createData = {
          name: teacherData.userId?.name || '',
          email: teacherData.userId?.email || '',
          phone: teacherData.userId?.phone || '',
          dayOfBirth: teacherData.userId?.dayOfBirth || '',
          address: teacherData.userId?.address || '',
          gender: teacherData.userId?.gender || '',
          description: teacherData.description || '',
          specialization: teacherData.specialization || ''
        };
        await createTeacherAPI(createData as any);
      }

      onSuccess?.();
      return { success: true, message: 'Lưu giáo viên thành công!' };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo viên';
      setFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFormLoading(false);
    }
  }, [form]);

  return {
    form,
    formErrors,
    formLoading,
    formError,
    loading: formLoading,
    error: formError,
    handleChange,
    setFormData,
    resetForm,
    handleSubmit,
  };
};
