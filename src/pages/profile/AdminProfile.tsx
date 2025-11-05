import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '../../services/users';
import { validateUserUpdate } from '../../validations/commonValidation';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { AvatarUpload } from '../../components/common';

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



  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (!user) {
    return (
      <DashboardLayout role="admin">
        <Box sx={commonStyles.pageContainer}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Trang cá nhân
            </Typography>
          </Box>

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

          <Grid container spacing={3}>
            {/* Left Panel - Profile Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: 'fit-content',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'visible'
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  {/* Profile Picture */}
                  <Box sx={{ mb: 3 }}>
                    <AvatarUpload
                      currentAvatar={user.avatar}
                      userName={user.name}
                      size={200}
                      onAvatarUpdate={(newAvatarUrl) => {
                        // Avatar will be updated through the context
                        console.log('Avatar updated:', newAvatarUrl);
                      }}
                    />
                  </Box>

                  {/* User Name */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                    {user.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Panel - Profile Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.email}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(user.dayOfBirth || '')}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.address || 'Chưa cập nhật'}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Trạng thái email
                        </Typography>
                        <Chip
                          label="Chưa xác thực"
                          color="warning"
                          size="small"
                          icon={<VerifiedUserIcon />}
                        />
                      </Box>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Họ và tên
                        </Typography>
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Số điện thoại
                        </Typography>
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.phone || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Giới tính
                        </Typography>
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Vai trò
                        </Typography>
                        <Chip
                          label="Quản trị viên"
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </Grid>

                    {/* Address Field - Full Width */}
                    {isEditing && (
                      <Grid item xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Địa chỉ
                          </Typography>
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
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          borderColor: '#2563eb',
                          bgcolor: '#eff6ff'
                        }
                      }}
                    >
                      Đổi mật khẩu
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<VerifiedUserIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          borderColor: '#2563eb',
                          bgcolor: '#eff6ff'
                        }
                      }}
                    >
                      Xác thực email
                    </Button>

                    {!isEditing ? (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          bgcolor: '#3b82f6',
                          '&:hover': {
                            bgcolor: '#2563eb'
                          }
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            borderColor: '#64748b',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#475569',
                              bgcolor: '#f1f5f9'
                            }
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSave}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            bgcolor: '#3b82f6',
                            '&:hover': {
                              bgcolor: '#2563eb'
                            }
                          }}
                        >
                          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdminProfile;
