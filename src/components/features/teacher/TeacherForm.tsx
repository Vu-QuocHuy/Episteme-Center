import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  IconButton,
  Grid,
  Chip,
  Autocomplete
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Teacher } from '../../../types';
import { validateTeacher } from '../../../validations/teacherValidation';

interface TeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (teacherData: Partial<Teacher>) => Promise<void>;
  teacher?: Teacher | null;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: 'male' | 'female';
  dayOfBirth: string;
  password: string;
  specializations: string[];
  qualifications: string[];
  salaryPerLesson: string;
  description: string;
  isActive: boolean;
  // Legacy fields for backward compatibility
  specialization?: string;
  experience?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  dayOfBirth?: string;
  password?: string;
  specializations?: string;
  qualifications?: string;
  salaryPerLesson?: string;
  description?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onClose,
  onSubmit,
  teacher,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'male',
    dayOfBirth: '',
    password: '',
    specializations: [],
    qualifications: [],
    salaryPerLesson: '',
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [avatar, setAvatar] = useState<string>('');
  const [, setAvatarFile] = useState<File | null>(null);

  const specializations = [
    'Business English',
    'IELTS',
    'TOEIC',
    'Academic English',
    'Conversational English',
    'English for Kids',
    'Grammar',
    'Pronunciation',
    'Speaking',
    'Writing'
  ];

  const qualificationOptions = [
    'Bachelor of English',
    'Master of Education',
    'CELTA',
    'TESOL',
    'TEFL',
    'Cambridge TKT',
    'IELTS Teaching Certificate',
    'Business English Certificate',
    'Phonics Teaching Certificate'
  ];

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || teacher.userId?.name || '',
        email: teacher.email || teacher.userId?.email || '',
        phone: teacher.phone || teacher.userId?.phone || '',
        address: teacher.address || teacher.userId?.address || '',
        gender: teacher.gender || 'male',
        dayOfBirth: teacher.dayOfBirth ? new Date(teacher.dayOfBirth).toISOString().split('T')[0] : '',
        password: '', // Don't pre-fill password
        specializations: teacher.specializations || [],
        qualifications: teacher.qualifications || [],
        salaryPerLesson: teacher.salaryPerLesson?.toString() || '',
        description: teacher.description || '',
        isActive: teacher.isActive ?? true,
        // Legacy fields for compatibility
        specialization: teacher.specialization || (teacher.specializations?.[0] || ''),
        experience: teacher.experience?.toString() || ''
      });
      setAvatar(teacher.avatar || teacher.userId?.avatar || '');
    } else {
      resetForm();
    }
  }, [teacher, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gender: 'male',
      dayOfBirth: '',
      password: '',
      specializations: [],
      qualifications: [],
      salaryPerLesson: '',
      description: '',
      isActive: true,
      // Legacy fields
      specialization: '',
      experience: ''
    });
    setErrors({});
    setAvatar('');
    setAvatarFile(null);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = validateTeacher({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dayOfBirth: formData.dayOfBirth,
      address: formData.address,
      gender: formData.gender,
      qualifications: formData.qualifications.join(','),
      specialization: formData.specializations.join(',') || formData.specialization || '',
      description: formData.description
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const teacherData = {
        ...(teacher?.id ? { id: teacher.id } : {}),
        // New API structure - direct fields
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dayOfBirth: formData.dayOfBirth,
        password: formData.password || 'password123', // Default password for new teachers
        avatar: avatar || undefined,
        specializations: formData.specializations.length > 0 ? formData.specializations : [formData.specialization || ''].filter(Boolean),
        qualifications: formData.qualifications,
        salaryPerLesson: parseInt(formData.salaryPerLesson) || 0,
        description: formData.description,
        isActive: formData.isActive,

        // Legacy structure for backward compatibility
        userId: {
          ...(teacher?.userId?.id ? { id: teacher.userId.id } : {}),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          avatar: avatar,
          role: 'teacher' as const
        },
        specialization: formData.specializations[0] || formData.specialization || '',
        experience: parseInt(formData.experience || '0') || 0
      };

      await onSubmit(teacherData as any);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting teacher form:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {teacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mt={2}>
          {/* Avatar Section */}
          <Box display="flex" justifyContent="center" mb={3}>
            <Box position="relative">
              <Avatar
                src={avatar}
                alt={formData.name}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2rem',
                  border: `3px solid ${theme.palette.primary.main}`
                }}
              >
                {formData.name.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin cá nhân
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={formData.dayOfBirth}
                onChange={(e) => handleInputChange('dayOfBirth', e.target.value)}
                error={!!errors.dayOfBirth}
                helperText={errors.dayOfBirth}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Giới tính"
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {!teacher && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || 'Chỉ cần nhập khi tạo mới giáo viên'}
                  required={!teacher}
                />
              </Grid>
            )}

            {/* Professional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" mt={2}>
                Thông tin chuyên môn
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={specializations}
                value={formData.specializations}
                onChange={(_, value) => handleInputChange('specializations', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chuyên môn"
                    error={!!errors.specializations}
                    helperText={errors.specializations}
                    required
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={qualificationOptions}
                value={formData.qualifications}
                onChange={(_, value) => handleInputChange('qualifications', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Bằng cấp"
                    error={!!errors.qualifications}
                    helperText={errors.qualifications}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lương/Buổi (VND)"
                type="number"
                value={formData.salaryPerLesson}
                onChange={(e) => handleInputChange('salaryPerLesson', e.target.value)}
                error={!!errors.salaryPerLesson}
                helperText={errors.salaryPerLesson}
                required
                inputProps={{ min: 0, step: 10000 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số năm kinh nghiệm"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                helperText="Chỉ cho tương thích với hệ thống cũ"
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Mô tả về kinh nghiệm, thành tích, phương pháp giảng dạy..."
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={formData.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  color={formData.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleInputChange('isActive', !formData.isActive)}
                >
                  {formData.isActive ? 'Ẩn giáo viên' : 'Kích hoạt giáo viên'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
          variant="outlined"
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : (teacher ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherForm;
