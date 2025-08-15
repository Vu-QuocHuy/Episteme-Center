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
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Student, Parent } from '../../../types';
import { validateStudent } from '../../../validations/studentValidation';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (studentData: Partial<Student>) => Promise<void>;
  student?: Student | null;
  parents?: Parent[];
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  level: string;
  schoolName: string;
  grade: string;
  parentId: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  level?: string;
  schoolName?: string;
  grade?: string;
  parentId?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSubmit,
  student,
  parents = [],
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    level: '',
    schoolName: '',
    grade: '',
    parentId: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [avatar, setAvatar] = useState<string>('');
  const [, setAvatarFile] = useState<File | null>(null);

  const levels = [
    'Beginner',
    'Elementary',
    'Pre-Intermediate',
    'Intermediate',
    'Upper-Intermediate',
    'Advanced'
  ];

  const grades = [
    'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
    'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
    'Lớp 10', 'Lớp 11', 'Lớp 12',
    'Đại học', 'Cao đẳng', 'Khác'
  ];

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || student.userId?.name || '',
        email: student.email || student.userId?.email || '',
        phone: student.phone || student.userId?.phone || '',
        address: student.address || student.userId?.address || '',
        dateOfBirth: student.dayOfBirth ? new Date(student.dayOfBirth).toISOString().split('T')[0] :
                     student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        gender: student.gender || 'male',
        level: student.level || '',
        schoolName: student.schoolName || '',
        grade: student.grade?.toString() || '',
        parentId: student.parentId || '',
        isActive: student.isActive ?? true
      });
      setAvatar(student.avatar || student.userId?.avatar || '');
    } else {
      resetForm();
    }
  }, [student, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'male',
      level: '',
      schoolName: '',
      grade: '',
      parentId: '',
      isActive: true
    });
    setErrors({});
    setAvatar('');
    setAvatarFile(null);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
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
    const validationErrors = validateStudent({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dayOfBirth: formData.dateOfBirth,
      address: formData.address,
      gender: formData.gender
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const studentData = {
        ...(student?.id ? { id: student.id } : {}),
        // New API structure - direct fields
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dayOfBirth: formData.dateOfBirth,
        avatar: avatar || undefined,
        gender: formData.gender,
        password: 'password123', // Default password for new students
        level: formData.level,
        schoolName: formData.schoolName,
        grade: parseInt(formData.grade) || undefined,
        parentId: formData.parentId || undefined,
        isActive: formData.isActive,

        // Legacy structure for backward compatibility
        userId: {
          ...(student?.userId?.id ? { id: student.userId.id } : {}),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          avatar: avatar,
          role: 'student' as const
        },
        dateOfBirth: formData.dateOfBirth
      };

      await onSubmit(studentData as any);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting student form:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
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
            {student ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
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
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth || (formData.dateOfBirth ? `${calculateAge(formData.dateOfBirth)} tuổi` : '')}
                required
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
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
                {errors.gender && (
                  <Typography variant="caption" color="error" mt={0.5}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Academic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" mt={2}>
                Thông tin học tập
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.level}>
                <InputLabel>Trình độ tiếng Anh</InputLabel>
                <Select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  label="Trình độ tiếng Anh"
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                {errors.level && (
                  <Typography variant="caption" color="error" mt={0.5}>
                    {errors.level}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên trường học"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                error={!!errors.schoolName}
                helperText={errors.schoolName}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Lớp hiện tại</InputLabel>
                <Select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  label="Lớp hiện tại"
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Phụ huynh</InputLabel>
                <Select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange('parentId', e.target.value)}
                  label="Phụ huynh"
                >
                  <MenuItem value="">
                    <em>Không có phụ huynh</em>
                  </MenuItem>
                  {parents.map((parent) => (
                    <MenuItem key={parent.id} value={parent.id}>
                      {parent.name || parent.userId?.name} - {parent.phone || parent.userId?.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={formData.isActive ? 'Đang học' : 'Đã nghỉ học'}
                  color={formData.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleInputChange('isActive', !formData.isActive)}
                >
                  {formData.isActive ? 'Đánh dấu nghỉ học' : 'Kích hoạt học sinh'}
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
          {loading ? 'Đang lưu...' : (student ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentForm;
