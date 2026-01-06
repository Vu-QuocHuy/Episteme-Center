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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '../../services/users';
import { updateTeacherAPI } from '../../services/teachers';
import { validateUserUpdate } from '../../validations/commonValidation';
import { validateTeacherUpdate } from '../../validations/teacherValidation';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog } from '../../components/common';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  dayOfBirth: string;
}

interface TeacherUpdateData {
  description: string;
  isActive: boolean;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  dayOfBirth?: string;
}

interface TeacherUpdateErrors {
  description?: string;
}

const TeacherProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [userFormData, setUserFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    dayOfBirth: user?.dayOfBirth || '',
  });

  const [teacherFormData, setTeacherFormData] = useState<TeacherUpdateData>({
    description: user?.teacher?.description || '',
    isActive: user?.teacher?.isActive ?? true,
  });

  const [userErrors, setUserErrors] = useState<UserUpdateErrors>({});
  const [teacherErrors, setTeacherErrors] = useState<TeacherUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth || '',
      });

      setTeacherFormData({
        description: user.teacher?.description || '',
        isActive: user.teacher?.isActive ?? true,
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

  const handleTeacherInputChange = (field: keyof TeacherUpdateData, value: string | boolean) => {
    setTeacherFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (teacherErrors[field as keyof TeacherUpdateErrors]) {
      setTeacherErrors(prev => ({
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

      // Validate teacher data
      const teacherValidationErrors = validateTeacherUpdate(teacherFormData);
      if (Object.keys(teacherValidationErrors).length > 0) {
        setTeacherErrors(teacherValidationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      // Update user data
      const userResponse = await updateUserAPI(user.id, userFormData);

      // Update teacher data if user update is successful
      if (userResponse.data && user.teacher?.id) {
        await updateTeacherAPI(user.teacher.id, {
          description: teacherFormData.description,
          isActive: teacherFormData.isActive,
        });
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        dayOfBirth: userFormData.dayOfBirth,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        teacher: {
          ...user.teacher,
          description: teacherFormData.description,
          isActive: teacherFormData.isActive,
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
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || '',
      dayOfBirth: user?.dayOfBirth || '',
    });

    setTeacherFormData({
      description: user?.teacher?.description || '',
      isActive: user?.teacher?.isActive ?? true,
    });

    setUserErrors({});
    setTeacherErrors({});
    setIsEditing(false);
  };



  if (!user) {
    return (
      <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
        <CircularProgress />
      </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
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
                            {userFormData.gender === 'male'
                              ? 'Nam'
                              : userFormData.gender === 'female'
                              ? 'Nữ'
                              : 'Khác'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Trạng thái hoạt động
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={teacherFormData.isActive}
                              onChange={(e) => handleTeacherInputChange('isActive', e.target.value === 'true')}
                            >
                              <MenuItem value="true">Đang hoạt động</MenuItem>
                              <MenuItem value="false">Tạm ngưng</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={teacherFormData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                            color={teacherFormData.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        )}
                      </Box>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Email
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.email}
                            onChange={(e) => handleUserInputChange('email', e.target.value)}
                            error={!!userErrors.email}
                            helperText={userErrors.email}
                            size="small"
                            type="email"
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.email}
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
                            {userFormData.dayOfBirth
                              ? new Date(userFormData.dayOfBirth).toLocaleDateString('vi-VN')
                              : 'Chưa cập nhật'}
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

                    </Grid>

                    {/* Teacher Specific Fields - Full Width */}
                    <Grid item xs={12}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Mô tả
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={teacherFormData.description}
                            onChange={(e) => handleTeacherInputChange('description', e.target.value)}
                            error={!!teacherErrors.description}
                            helperText={teacherErrors.description}
                            size="small"
                            placeholder="Mô tả về kinh nghiệm giảng dạy, chuyên môn..."
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.teacher?.description || 'Chưa cập nhật'}
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
    </DashboardLayout>
  );
};

export default TeacherProfile;
