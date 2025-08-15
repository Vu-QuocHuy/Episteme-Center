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
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI, updateTeacherAPI } from '../../services/api';
import { validateUserUpdate } from '../../validations/commonValidation';
import { validateTeacherUpdate } from '../../validations/teacherValidation';
import { commonStyles } from '../../utils/styles';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
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

  const [userFormData, setUserFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
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

      // Validate user form data
      const userValidationErrors = validateUserUpdate(userFormData);
      if (Object.keys(userValidationErrors).length > 0) {
        setUserErrors(userValidationErrors);
        return;
      }

      // Validate teacher form data
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

      if (!userResponse.data) {
        setError('Có lỗi xảy ra khi cập nhật thông tin người dùng');
        return;
      }

      // Update teacher data
      if (user.teacher?.id) {
        const teacherResponse = await updateTeacherAPI(user.teacher.id, teacherFormData);

        if (!teacherResponse.data) {
          setError('Có lỗi xảy ra khi cập nhật thông tin giáo viên');
          return;
        }
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        teacher: {
          ...user.teacher,
          ...teacherFormData,
          userId: user.teacher?.userId || user,
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
    });

    setTeacherFormData({
      description: user?.teacher?.description || '',
      isActive: user?.teacher?.isActive ?? true,
    });

    setUserErrors({});
    setTeacherErrors({});
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" color="text.secondary">
                    Giáo viên
                  </Typography>
                  <Chip
                    label={teacherFormData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                    color={teacherFormData.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
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

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin cá nhân
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    value={userFormData.name}
                    onChange={(e) => handleUserInputChange('name', e.target.value)}
                    error={!!userErrors.name}
                    helperText={userErrors.name}
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
                    value={userFormData.email}
                    onChange={(e) => handleUserInputChange('email', e.target.value)}
                    error={!!userErrors.email}
                    helperText={userErrors.email}
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
                    value={userFormData.phone}
                    onChange={(e) => handleUserInputChange('phone', e.target.value)}
                    error={!!userErrors.phone}
                    helperText={userErrors.phone}
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
                  <Typography variant="body1">
                    {userFormData.gender === 'male' ? 'Nam' : userFormData.gender === 'female' ? 'Nữ' : 'Khác'}
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
                    value={userFormData.address}
                    onChange={(e) => handleUserInputChange('address', e.target.value)}
                    error={!!userErrors.address}
                    helperText={userErrors.address}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{user.address || 'Chưa cập nhật'}</Typography>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin giáo viên
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Mô tả
                  </Typography>
                </Box>
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
                  <Typography variant="body1">
                    {user.teacher?.description || 'Chưa cập nhật'}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái
                  </Typography>
                </Box>
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
                  />
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

export default TeacherProfile;
