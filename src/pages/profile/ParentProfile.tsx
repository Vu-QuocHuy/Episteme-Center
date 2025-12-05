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
  Switch,
  FormControlLabel,
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
import { updateParentAPI } from '../../services/parents';
import { validateUserUpdate } from '../../validations/commonValidation';
import { validateParentUpdate } from '../../validations/parentValidation';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog, VerifyEmailDialog } from '../../components/common';

interface UserUpdateData {
  name: string;
  email: string;
  dayOfBirth: string;
  phone: string;
  address: string;
  gender: string;
}

interface ParentUpdateData {
  canSeeTeacherInfo: boolean;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  dayOfBirth?: string;
  phone?: string;
  address?: string;
  gender?: string;
}

interface ParentUpdateErrors {
  canSeeTeacherInfo?: string;
}

const ParentProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);

  const [userFormData, setUserFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    dayOfBirth: user?.dayOfBirth ? new Date(user.dayOfBirth).toISOString().split('T')[0] : '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || '',
  });

  const [parentFormData, setParentFormData] = useState<ParentUpdateData>({
    canSeeTeacherInfo: user?.parent?.canSeeTeacherInfo ?? true,
  });

  const [userErrors, setUserErrors] = useState<UserUpdateErrors>({});
  const [parentErrors, setParentErrors] = useState<ParentUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        email: user.email || '',
        dayOfBirth: user?.dayOfBirth ? new Date(user.dayOfBirth).toISOString().split('T')[0] : '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
      });

      setParentFormData({
        canSeeTeacherInfo: user.parent?.canSeeTeacherInfo ?? true,
      });
    }
  }, [user]);

  const handleUserInputChange = (field: keyof UserUpdateData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (userErrors[field]) {
      setUserErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleParentInputChange = (field: keyof ParentUpdateData, value: boolean) => {
    setParentFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (parentErrors[field]) {
      setParentErrors(prev => ({
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

      // Validate user data
      const userValidationErrors = validateUserUpdate(userFormData);
      if (Object.keys(userValidationErrors).length > 0) {
        setUserErrors(userValidationErrors);
        return;
      }

      // Validate parent data
      const parentValidationErrors = validateParentUpdate(parentFormData);
      if (Object.keys(parentValidationErrors).length > 0) {
        setParentErrors(parentValidationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      // Update user data
      const userResponse = await updateUserAPI(user.id, userFormData);

      // Update parent data if user update is successful
      if (userResponse.data && user.parent?.id) {
        await updateParentAPI(user.parent.id, {
          // canSeeTeacherInfo: parentFormData.canSeeTeacherInfo, // Commented out as it doesn't exist in ParentData interface
        });
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        parent: {
          ...user.parent,
          // canSeeTeacherInfo: parentFormData.canSeeTeacherInfo, // Commented out as it doesn't exist in Parent interface
        } as any,
      });

      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserFormData({
      name: user?.name || '',
      email: user?.email || '',
      dayOfBirth: user?.dayOfBirth ? new Date(user.dayOfBirth).toISOString().split('T')[0] : '',
      phone: user?.phone || '',
      address: user?.address || '',
      gender: user?.gender || '',
    });

    setParentFormData({
      canSeeTeacherInfo: user?.parent?.canSeeTeacherInfo ?? true,
    });

    setUserErrors({});
    setParentErrors({});
    setIsEditing(false);
  };



  if (!user) {
    return (
      <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <CircularProgress />
      </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
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
                          Họ và tên
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.name}
                            onChange={(e) => handleUserInputChange('name', e.target.value)}
                            error={!!userErrors.name}
                            helperText={userErrors.name}
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
                          Ngày sinh
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            type="date"
                            value={userFormData.dayOfBirth}
                            onChange={(e) => handleUserInputChange('dayOfBirth', e.target.value)}
                            error={!!userErrors.dayOfBirth}
                            helperText={userErrors.dayOfBirth}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user?.dayOfBirth ? new Date(user.dayOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Địa chỉ
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.address}
                            onChange={(e) => handleUserInputChange('address', e.target.value)}
                            error={!!userErrors.address}
                            helperText={userErrors.address}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.address || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Trạng thái xác thực email
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
                          Email
                        </Typography>
                        <TextField
                          fullWidth
                          value={user.email}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Số điện thoại
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.phone}
                            onChange={(e) => handleUserInputChange('phone', e.target.value)}
                            error={!!userErrors.phone}
                            helperText={userErrors.phone}
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
                              value={userFormData.gender}
                              onChange={(e) => handleUserInputChange('gender', e.target.value)}
                              error={!!userErrors.gender}
                            >
                              <MenuItem value="male">Nam</MenuItem>
                              <MenuItem value="female">Nữ</MenuItem>
                              <MenuItem value="other">Khác</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {userFormData.gender === 'male' ? 'Nam' : userFormData.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

              </Grid>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setChangePasswordOpen(true)}
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
                      onClick={() => setVerifyEmailOpen(true)}
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

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <VerifyEmailDialog
        open={verifyEmailOpen}
        onClose={() => setVerifyEmailOpen(false)}
        userEmail={user?.email || ''}
        onSuccess={() => {
          console.log('Email verified successfully');
        }}
      />
    </DashboardLayout>
  );
};

export default ParentProfile;
