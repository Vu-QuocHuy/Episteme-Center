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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Parent } from '../../../types';
import { validateParent } from '../../../validations/parentValidation';

interface ParentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (parentData: Partial<Parent>) => Promise<void>;
  parent?: Parent | null;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  relationship: string;
  occupation: string;
  workplace: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  relationship?: string;
  occupation?: string;
  workplace?: string;
}

const ParentForm: React.FC<ParentFormProps> = ({
  open,
  onClose,
  onSubmit,
  parent,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    relationship: '',
    occupation: '',
    workplace: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [avatar, setAvatar] = useState<string>('');
  const [, setAvatarFile] = useState<File | null>(null);

  const relationships = [
    'father',
    'mother',
    'guardian',
    'grandfather',
    'grandmother',
    'uncle',
    'aunt'
  ];

  const relationshipLabels: { [key: string]: string } = {
    'father': 'Cha',
    'mother': 'Mẹ',
    'guardian': 'Người giám hộ',
    'grandfather': 'Ông',
    'grandmother': 'Bà',
    'uncle': 'Chú/Cậu',
    'aunt': 'Cô/Dì'
  };

  const occupations = [
    'Công nhân',
    'Nhân viên văn phòng',
    'Giáo viên',
    'Bác sĩ',
    'Kỹ sư',
    'Doanh nhân',
    'Nông dân',
    'Công chức',
    'Tự do',
    'Khác'
  ];

  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.userId.name || '',
        email: parent.userId.email || '',
        phone: parent.userId.phone || '',
        address: parent.userId.address || '',
        relationship: parent.relationship || '',
        occupation: parent.occupation || '',
        workplace: parent.workplace || '',
        isActive: parent.isActive ?? true
      });
      setAvatar(parent.userId.avatar || '');
    } else {
      resetForm();
    }
  }, [parent, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      relationship: '',
      occupation: '',
      workplace: '',
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
    const validationErrors = validateParent({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dayOfBirth: '', // This field is not in the form but required by validation
      address: formData.address,
      gender: '' // This field is not in the form but required by validation
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const parentData = {
        ...(parent?.id ? { id: parent.id } : {}),
        userId: {
          ...(parent?.userId?.id ? { id: parent.userId.id } : {}),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          avatar: avatar,
          role: 'parent' as const,
          ...(parent?.userId?.dayOfBirth ? { dayOfBirth: parent.userId.dayOfBirth } : {}),
          ...(parent?.userId?.gender ? { gender: parent.userId.gender } : {}),
          ...(parent?.userId?.username ? { username: parent.userId.username } : {})
        },
        relationship: formData.relationship,
        occupation: formData.occupation,
        workplace: formData.workplace,
        isActive: formData.isActive
      };

      await onSubmit(parentData as Partial<Parent>);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting parent form:', error);
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
            {parent ? 'Chỉnh sửa phụ huynh' : 'Thêm phụ huynh mới'}
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
              <FormControl fullWidth required error={!!errors.relationship}>
                <InputLabel>Mối quan hệ</InputLabel>
                <Select
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  label="Mối quan hệ"
                >
                  {relationships.map((relationship) => (
                    <MenuItem key={relationship} value={relationship}>
                      {relationshipLabels[relationship]}
                    </MenuItem>
                  ))}
                </Select>
                {errors.relationship && (
                  <Typography variant="caption" color="error" mt={0.5}>
                    {errors.relationship}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Work Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" mt={2}>
                Thông tin công việc
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nghề nghiệp</InputLabel>
                <Select
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  label="Nghề nghiệp"
                >
                  {occupations.map((occupation) => (
                    <MenuItem key={occupation} value={occupation}>
                      {occupation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nơi làm việc"
                value={formData.workplace}
                onChange={(e) => handleInputChange('workplace', e.target.value)}
                error={!!errors.workplace}
                helperText={errors.workplace}
                placeholder="Tên công ty, cơ quan..."
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
                  {formData.isActive ? 'Ẩn phụ huynh' : 'Kích hoạt phụ huynh'}
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
          {loading ? 'Đang lưu...' : (parent ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParentForm;
