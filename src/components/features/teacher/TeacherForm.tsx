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
  Grid,
  Paper,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Teacher } from '../../../types';

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
  salary: string;
  workExperience: string;
  specializations: string[];
  qualifications: string[];
  description: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  dayOfBirth?: string;
  salary?: string;
  workExperience?: string;
  specializations?: string;
  qualifications?: string;
  description?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onClose,
  onSubmit,
  teacher,
  loading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'male',
    dayOfBirth: '',
    salary: '',
    workExperience: '',
    specializations: [],
    qualifications: [],
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || teacher.userId?.name || '',
        email: teacher.email || teacher.userId?.email || '',
        phone: teacher.phone || teacher.userId?.phone || '',
        address: teacher.address || teacher.userId?.address || '',
        gender: teacher.gender || teacher.userId?.gender || 'male',
        dayOfBirth: teacher.dayOfBirth ? new Date(teacher.dayOfBirth).toISOString().split('T')[0] : 
                    teacher.userId?.dayOfBirth ? new Date(teacher.userId.dayOfBirth).toISOString().split('T')[0] : '',
        salary: teacher.salary?.toString() || '',
        workExperience: teacher.workExperience?.toString() || '',
        specializations: teacher.specializations || [],
        qualifications: teacher.qualifications || [],
        description: teacher.description || '',
        isActive: teacher.isActive ?? true
      });
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
      salary: '',
      workExperience: '',
      specializations: [],
      qualifications: [],
      description: '',
      isActive: true
    });
    setErrors({});
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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Họ và tên là bắt buộc';
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
    if (!formData.dayOfBirth) newErrors.dayOfBirth = 'Ngày sinh là bắt buộc';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const teacherData = {
        ...(teacher ? { id: teacher.id } : {}),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dayOfBirth: formData.dayOfBirth,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        workExperience: formData.workExperience ? parseInt(formData.workExperience) : undefined,
        specializations: formData.specializations,
        qualifications: formData.qualifications,
        description: formData.description,
        isActive: formData.isActive
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

  const sectionTitle = (title: string) => (
    <Typography variant="h6" gutterBottom sx={{
      color: '#2c3e50',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 2
    }}>
      <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
      {title}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {teacher ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Cập nhật thông tin giáo viên
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <EditIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* Thông tin cơ bản */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            border: '1px solid #e0e6ed',
            mb: 3
          }}>
            {sectionTitle('Thông tin giáo viên')}
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Grid container spacing={3}>
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
                    label="Ngày sinh"
                    type="date"
                    value={formData.dayOfBirth}
                    onChange={(e) => handleInputChange('dayOfBirth', e.target.value)}
                    error={!!errors.dayOfBirth}
                    helperText={errors.dayOfBirth}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                      label="Giới tính"
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                    </Select>
                  </FormControl>
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
              </Grid>
            </Box>
          </Paper>

          {/* Thông tin chuyên môn */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            border: '1px solid #e0e6ed'
          }}>
            {sectionTitle('Thông tin chuyên môn')}
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lương/buổi (VND)"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    error={!!errors.salary}
                    helperText={errors.salary}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Kinh nghiệm làm việc (năm)"
                    type="number"
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    error={!!errors.workExperience}
                    helperText={errors.workExperience}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.qualifications}
                    onChange={(_, newValue) => handleInputChange('qualifications', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bằng cấp (phân tách bởi dấu phẩy)"
                        error={!!errors.qualifications}
                        helperText={errors.qualifications || "Nhấn Enter để thêm bằng cấp"}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.specializations}
                    onChange={(_, newValue) => handleInputChange('specializations', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chuyên môn (phân tách bởi dấu phẩy)"
                        error={!!errors.specializations}
                        helperText={errors.specializations || "Nhấn Enter để thêm chuyên môn"}
                      />
                    )}
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Trạng thái hoạt động"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #e0e6ed',
        backgroundColor: '#f8f9fa',
        gap: 2
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={loading}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={loading}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          {loading ? 'Đang lưu...' : (teacher ? 'Cập nhật' : 'Tạo mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherForm;
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
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
  salary: string;
  workExperience: string;
  specializations: string[];
  qualifications: string[];
  description: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  dayOfBirth?: string;
  salary?: string;
  workExperience?: string;
  specializations?: string;
  qualifications?: string;
  description?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onClose,
  onSubmit,
  teacher,
  loading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'male',
    dayOfBirth: '',
    salary: '',
    workExperience: '',
    specializations: [],
    qualifications: [],
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});



  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || teacher.userId?.name || '',
        email: teacher.email || teacher.userId?.email || '',
        phone: teacher.phone || teacher.userId?.phone || '',
        address: teacher.address || teacher.userId?.address || '',
        gender: teacher.gender || teacher.userId?.gender || 'male',
        dayOfBirth: teacher.dayOfBirth ? new Date(teacher.dayOfBirth).toISOString().split('T')[0] : 
                    teacher.userId?.dayOfBirth ? new Date(teacher.userId.dayOfBirth).toISOString().split('T')[0] : '',
        salary: teacher.salary?.toString() || '',
        workExperience: teacher.workExperience?.toString() || '',
        specializations: teacher.specializations || [],
        qualifications: teacher.qualifications || [],
        description: teacher.description || '',
        isActive: teacher.isActive ?? true
      });
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
      salary: '',
      workExperience: '',
      specializations: [],
      qualifications: [],
      description: '',
      isActive: true
    });
    setErrors({});
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

  const sectionTitle = (title: string) => (
    <Typography variant="h6" gutterBottom sx={{
      color: '#2c3e50',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 2
    }}>
      <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
      {title}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {teacher ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Cập nhật thông tin giáo viên
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <EditIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* Thông tin cơ bản */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            border: '1px solid #e0e6ed',
            mb: 3
          }}>
            {sectionTitle('Thông tin giáo viên')}
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Grid container spacing={3}>
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
              <TextField
                fullWidth
                label="Chuyên môn"
                value={formData.specializations.join(', ')}
                onChange={(e) => {
                  const specializations = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  handleInputChange('specializations', specializations);
                }}
                error={!!errors.specializations}
                helperText={errors.specializations || 'Nhập các chuyên môn, phân cách bằng dấu phẩy'}
                placeholder="Ví dụ: IELTS, Speaking, Grammar"
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bằng cấp"
                value={formData.qualifications.join(', ')}
                onChange={(e) => {
                  const qualifications = e.target.value.split(',').map(q => q.trim()).filter(q => q);
                  handleInputChange('qualifications', qualifications);
                }}
                error={!!errors.qualifications}
                helperText={errors.qualifications || 'Nhập các bằng cấp, phân cách bằng dấu phẩy'}
                placeholder="Ví dụ: Bachelor of Education, TESOL, CELTA"
                multiline
                rows={3}
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
