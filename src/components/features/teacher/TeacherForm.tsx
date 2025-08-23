import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Edit as EditIcon } from '@mui/icons-material';
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
  salary?: string;
  workExperience?: string;
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
  dayOfBirth?: string;
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
        name: teacher.name || (teacher as any)?.userId?.name || '',
        email: teacher.email || (teacher as any)?.userId?.email || '',
        phone: teacher.phone || (teacher as any)?.userId?.phone || '',
        address: teacher.address || (teacher as any)?.userId?.address || '',
        gender: (teacher.gender as 'male' | 'female') || ((teacher as any)?.userId?.gender as 'male' | 'female') || 'male',
        dayOfBirth: teacher.dayOfBirth
          ? new Date(teacher.dayOfBirth as any).toISOString().split('T')[0]
          : (teacher as any)?.userId?.dayOfBirth
          ? new Date((teacher as any).userId.dayOfBirth).toISOString().split('T')[0]
          : '',
        salary: (teacher as any)?.salary ? String((teacher as any).salary) : '',
        workExperience: (teacher as any)?.workExperience ? String((teacher as any).workExperience) : '',
        specializations: (teacher as any)?.specializations || [],
        qualifications: (teacher as any)?.qualifications || [],
        description: (teacher as any)?.description || '',
        isActive: (teacher as any)?.isActive ?? true
      });
    } else if (!open) {
      // Reset only when dialog closes to keep inputs while open
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = 'Họ và tên là bắt buộc';
    if (!formData.email.trim()) next.email = 'Email là bắt buộc';
    if (!formData.phone.trim()) next.phone = 'Số điện thoại là bắt buộc';
    if (!formData.address.trim()) next.address = 'Địa chỉ là bắt buộc';
    if (!formData.dayOfBirth) next.dayOfBirth = 'Ngày sinh là bắt buộc';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const teacherData: Partial<Teacher> = {
        ...(teacher ? { id: teacher.id } : {}),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender as any,
        dayOfBirth: formData.dayOfBirth as any,
        description: formData.description,
        isActive: formData.isActive,
        // Optional numeric fields if provided
        ...(formData.salary ? { salary: parseFloat(formData.salary) as any } : {}),
        ...(formData.workExperience ? { workExperience: parseInt(formData.workExperience) as any } : {}),
        specializations: formData.specializations as any,
        qualifications: formData.qualifications as any
      };

      await onSubmit(teacherData);
      resetForm();
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting teacher form:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const sectionTitle = (title: string) => (
    <Typography
      variant="h6"
      gutterBottom
      sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
    >
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
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {teacher ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Cập nhật thông tin giáo viên
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EditIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed', mb: 3 }}>
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
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Giới tính"
                      onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
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

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e6ed', backgroundColor: '#f8f9fa', gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={loading}
          sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
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

