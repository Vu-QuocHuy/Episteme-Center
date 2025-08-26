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
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI, updateStudentAPI } from '../../services/api';
import { validateUserUpdate } from '../../validations/commonValidation';
import { validateStudentUpdate } from '../../validations/studentValidation';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';

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

  const handleStudentInputChange = (field: keyof StudentUpdateData, value: string) => {
    setStudentFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if ((studentErrors as any)[field]) {
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

      // Validate user data
      const userValidationErrors = validateUserUpdate(userFormData);
      if (Object.keys(userValidationErrors).length > 0) {
        setUserErrors(userValidationErrors);
        return;
      }

      // Validate student data
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

      // Update student data if user update is successful
      if (userResponse.data && user.student?.id) {
        await updateStudentAPI(user.student.id, {
          dayOfBirth: studentFormData.dayOfBirth,
          // grade: Number(studentFormData.grade), // Commented out as it doesn't exist in StudentData interface
          // parentId: studentFormData.parentId, // Commented out as it doesn't exist in StudentData interface
        });
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        student: {
          ...user.student,
          dayOfBirth: studentFormData.dayOfBirth,
          // grade: Number(studentFormData.grade), // Commented out as it doesn't exist in Student interface
          // parentId: studentFormData.parentId, // Commented out as it doesn't exist in Student interface
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getGradeLabel = (grade: number) => {
    const gradeLabels: { [key: number]: string } = {
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
      <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <CircularProgress />
      </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
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
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar
                sx={{
                        width: 120,
                        height: 120,
                  bgcolor: 'primary.main',
                        fontSize: '3rem',
                        border: '4px solid white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                {getInitials(user.name)}
              </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    >
                      <CameraIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </Box>

                  {/* User Name */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                  {user.name}
                </Typography>

                  {/* User Email */}
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {user.email}
                  </Typography>

                  {/* Student Role and Grade */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Chip
                      label="Học sinh"
                    color="primary"
                    size="small"
                  />
                    <Chip
                      label={getGradeLabel(Number(studentFormData.grade))}
                      color="secondary"
                      size="small"
                    />
                </Box>
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
                          {formatDate(studentFormData.dayOfBirth)}
                        </Typography>
            </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Lớp
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getGradeLabel(Number(studentFormData.grade))}
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
                    {userFormData.gender === 'male' ? 'Nam' : userFormData.gender === 'female' ? 'Nữ' : 'Khác'}
                  </Typography>
                )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Vai trò
                        </Typography>
                        <Chip
                          label="Học sinh"
                          color="primary"
                          size="small"
                        />
                      </Box>
              </Grid>

                    {/* Address Field - Full Width */}
              <Grid item xs={12}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Địa chỉ
                  </Typography>
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.address || 'Chưa cập nhật'}
                          </Typography>
                )}
                      </Box>
            </Grid>

                    {/* Student Specific Fields - Full Width */}
                    {isEditing && (
                      <>
              <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Ngày sinh
                  </Typography>
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
                          </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Lớp
                  </Typography>
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
                          </Box>
                        </Grid>
                      </>
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

export default StudentProfile;
