import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '../../services/api';
import { validateUserUpdate } from '../../validations/commonValidation';
import { commonStyles } from '../../utils/styles';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
}

const AdminProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
  });

  const [errors, setErrors] = useState<UserUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate form data
      const validationErrors = validateUserUpdate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await updateUserAPI(user.id, formData);

      if (response.data) {
        // Update local user data
        updateUser({
          ...user,
          ...formData,
          gender: formData.gender as 'male' | 'female' | undefined,
        });

        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        setError('Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Box sx={commonStyles.pageContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={commonStyles.pageContainer}>
      <Box sx={commonStyles.contentWrapper}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Thông tin cá nhân
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: 3,
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản trị viên
                </Typography>
              </Box>
              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Họ và tên
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{user.name}</Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{user.email}</Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{user.phone}</Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Giới tính
                  </Typography>
                </Box>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      error={!!errors.gender}
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                      <MenuItem value="other">Khác</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body1">
                    {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Khác'}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={!!errors.address}
                    helperText={errors.address}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{user.address || 'Chưa cập nhật'}</Typography>
                )}
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminProfile;
