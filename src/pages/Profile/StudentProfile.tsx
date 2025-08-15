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
  Cake as CakeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI, updateStudentAPI } from '../../services/api';
import { validateUserUpdate } from '../../validations/commonValidation';
import { validateStudentUpdate } from '../../validations/studentValidation';
import { commonStyles } from '../../utils/styles';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
}

interface StudentUpdateData {
  dayOfBirth: string;
  grade: string;
  parentId: string | null;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
}

interface StudentUpdateErrors {
  dayOfBirth?: string;
  grade?: string;
}

const StudentProfile: React.FC = () => {
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

  const [studentFormData, setStudentFormData] = useState<StudentUpdateData>({
    dayOfBirth: user?.student?.dayOfBirth || '',
    grade: user?.student?.grade?.toString() || '1',
    parentId: user?.student?.parentId || null,
  });

  const [userErrors, setUserErrors] = useState<UserUpdateErrors>({});
  const [studentErrors, setStudentErrors] = useState<StudentUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
      });

      setStudentFormData({
        dayOfBirth: user.student?.dayOfBirth || '',
        grade: user?.student?.grade?.toString() || '1',
        parentId: user.student?.parentId || null,
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

  const handleStudentInputChange = (field: keyof StudentUpdateData, value: string | number | null) => {
    setStudentFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (studentErrors[field as keyof StudentUpdateErrors]) {
      setStudentErrors(prev => ({
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

      // Validate student form data
      const studentValidationErrors = validateStudentUpdate(studentFormData);
      if (Object.keys(studentValidationErrors).length > 0) {
        setStudentErrors(studentValidationErrors);
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

      // Update student data
      if (user.student?.id) {
        const studentDataForUpdate = {
          ...studentFormData,
          parentId: studentFormData.parentId || undefined
        };
        const studentResponse = await updateStudentAPI(user.student.id, studentDataForUpdate as any);

        if (!studentResponse.data) {
          setError('Có lỗi xảy ra khi cập nhật thông tin học sinh');
          return;
        }
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        student: {
          ...user.student,
          ...studentFormData,
          userId: user.student?.userId || user,
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

    setStudentFormData({
      dayOfBirth: user?.student?.dayOfBirth || '',
              grade: user?.student?.grade?.toString() || '1',
      parentId: user?.student?.parentId || null,
    });

    setUserErrors({});
    setStudentErrors({});
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGradeLabel = (grade: number) => {
    const gradeLabels: Record<number, string> = {
      1: 'Lớp 1',
      2: 'Lớp 2',
      3: 'Lớp 3',
      4: 'Lớp 4',
      5: 'Lớp 5',
      6: 'Lớp 6',
      7: 'Lớp 7',
      8: 'Lớp 8',
      9: 'Lớp 9',
      10: 'Lớp 10',
      11: 'Lớp 11',
      12: 'Lớp 12',
    };
    return gradeLabels[grade] || `Lớp ${grade}`;
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
                    Học sinh
                  </Typography>
                  <Chip
                    label={getGradeLabel(Number(studentFormData.grade))}
                    color="primary"
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
              Thông tin học sinh
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CakeIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Ngày sinh
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    type="date"
                    value={studentFormData.dayOfBirth}
                    onChange={(e) => handleStudentInputChange('dayOfBirth', e.target.value)}
                    error={!!studentErrors.dayOfBirth}
                    helperText={studentErrors.dayOfBirth}
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                ) : (
                  <Typography variant="body1">
                    {formatDate(studentFormData.dayOfBirth)}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Lớp
                  </Typography>
                </Box>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={studentFormData.grade}
                      onChange={(e) => handleStudentInputChange('grade', e.target.value)}
                      error={!!studentErrors.grade}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          Lớp {grade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body1">
                    {getGradeLabel(Number(studentFormData.grade))}
                  </Typography>
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

export default StudentProfile;
