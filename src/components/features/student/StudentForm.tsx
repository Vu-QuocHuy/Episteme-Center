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
  Paper
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Edit as EditIcon } from '@mui/icons-material';
import { Student } from '../../../types';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (studentData: Partial<Student>) => Promise<void>;
  student?: Student | null;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSubmit,
  student,
  loading = false
}) => {
  // Removed theme-based avatar UI for edit layout
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [classEdits, setClassEdits] = useState<Array<{ classId?: string; className: string; discountPercent: number; status: 'active' | 'completed'; }>>([]);
  // Removed avatar editing in this dialog

  // Removed levels/grades UI for this dialog per design

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || student.userId?.name || '',
        email: student.email || student.userId?.email || '',
        phone: student.phone || student.userId?.phone || '',
        address: student.address || student.userId?.address || '',
        dateOfBirth: student.dayOfBirth ? new Date(student.dayOfBirth).toISOString().split('T')[0] :
                     student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        gender: student.gender || 'male'
      });
      const mapped = (student.classes || []).map((cls: any, index: number) => ({
        classId: typeof cls.classId === 'object' ? cls.classId?.id : cls.classId,
        className: cls.classId?.name || cls.name || `${cls.classId?.grade || ''}.${cls.classId?.section || ''}` || `Lớp ${index + 1}`,
        discountPercent: Number(cls.discountPercent || cls.discount || 0),
        status: (cls.status as 'active' | 'completed') ?? 'active'
      }));
      setClassEdits(mapped);
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
      gender: 'male'
    });
    setErrors({});
    setClassEdits([]);
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

  const handleClassChange = (index: number, field: 'className' | 'discountPercent' | 'status', value: any) => {
    setClassEdits(prev => prev.map((item, i) => i === index ? { ...item, [field]: field === 'discountPercent' ? Number(value) : value } : item));
  };

  const validateForm = (): boolean => true;

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = student?.id
        ? {
            userData: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dayOfBirth: formData.dateOfBirth,
        gender: formData.gender,
              address: formData.address,
            },
            studentData: classEdits.map(edit => ({
              classId: edit.classId || edit.className,
              status: edit.status,
              discountPercent: edit.discountPercent || 0
            }))
          }
        : {
            email: formData.email,
            password: 'password123',
          name: formData.name,
            dayOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          address: formData.address,
            gender: formData.gender
      };

      await onSubmit(payload as any);
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
            {student ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Cập nhật thông tin học sinh
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
          <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
            {sectionTitle('Thông tin học sinh')}
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
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                required
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

            {/* End personal section */}
            </Grid>
            </Box>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
              {sectionTitle('Danh sách lớp đang học')}
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2}>
                  {classEdits.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Tên lớp"
                          value={item.className}
                          onChange={(e) => handleClassChange(idx, 'className', e.target.value)}
                        />
            </Grid>
                      <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                          label="Giảm giá (%)"
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => handleClassChange(idx, 'discountPercent', e.target.value)}
              />
            </Grid>
                      <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                          <InputLabel>Trạng thái</InputLabel>
                <Select
                            value={item.status}
                            label="Trạng thái"
                            onChange={(e) => handleClassChange(idx, 'status', e.target.value as any)}
                          >
                            <MenuItem value="active">Đang học</MenuItem>
                            <MenuItem value="completed">Đã hoàn thành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
                    </React.Fragment>
                  ))}
                  {classEdits.length === 0 && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">Học sinh chưa có lớp nào.</Typography>
                    </Grid>
                  )}
            </Grid>
              </Box>
            </Paper>
          </Box>
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
