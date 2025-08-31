import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Switch, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../../components/common/NotificationSnackbar';
import { getAllTeachersAPI } from '../../../services/api';
import { Teacher } from '../../../types';
import { commonStyles } from '../../../utils/styles';

interface FeaturedTeacher {
  id: string;
  teacherId: string;
  teacher: Teacher;
  order: number;
  isActive: boolean;
  customTitle?: string;
  customDescription?: string;
}

const FeaturedTeachersManagement: React.FC = () => {
  // State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [featuredTeachers, setFeaturedTeachers] = useState<FeaturedTeacher[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState<FeaturedTeacher | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState<Partial<FeaturedTeacher>>({
    teacherId: '',
    order: 1,
    isActive: true,
    customTitle: '',
    customDescription: ''
  });

  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getAllTeachersAPI({ page: 1, limit: 100 });
        if (response.data?.data?.result) {
          setTeachers(response.data.data.result);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          setTeachers(response.data.data);
        } else {
          setTeachers([]);
          console.warn('Unexpected API response structure:', response.data);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setTeachers([]);
        setNotification({
          open: true,
          message: 'Không thể tải danh sách giảng viên',
          severity: 'error'
        });
      }
    };

    fetchTeachers();
  }, []);

  const handleOpenDialog = (featured?: FeaturedTeacher) => {
    if (featured) {
      setEditingFeatured(featured);
      setFormData({
        teacherId: featured.teacherId,
        order: featured.order,
        isActive: featured.isActive,
        customTitle: featured.customTitle,
        customDescription: featured.customDescription
      });
    } else {
      setEditingFeatured(null);
      setFormData({
        teacherId: '',
        order: featuredTeachers.length + 1,
        isActive: true,
        customTitle: '',
        customDescription: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFeatured(null);
    setFormData({
      teacherId: '',
      order: 1,
      isActive: true,
      customTitle: '',
      customDescription: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.teacherId) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn giảng viên',
        severity: 'error'
      });
      return;
    }

    const selectedTeacher = (teachers || []).find(t => t.id === formData.teacherId);
    if (!selectedTeacher) {
      setNotification({
        open: true,
        message: 'Không tìm thấy giảng viên',
        severity: 'error'
      });
      return;
    }

    if (editingFeatured) {
      // Update existing featured teacher
      setFeaturedTeachers(prev => prev.map(featured =>
        featured.id === editingFeatured.id ? {
          ...featured,
          ...formData,
          teacher: selectedTeacher
        } : featured
      ));
      setNotification({
        open: true,
        message: 'Cập nhật giảng viên nổi bật thành công!',
        severity: 'success'
      });
    } else {
      // Add new featured teacher
      const newFeatured: FeaturedTeacher = {
        id: Date.now().toString(),
        teacherId: formData.teacherId,
        teacher: selectedTeacher,
        order: formData.order || 1,
        isActive: formData.isActive || true,
        customTitle: formData.customTitle,
        customDescription: formData.customDescription
      };
      setFeaturedTeachers(prev => [...prev, newFeatured]);
      setNotification({
        open: true,
        message: 'Thêm giảng viên nổi bật thành công!',
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDeleteFeatured = (id: string) => {
    setFeaturedTeachers(prev => prev.filter(featured => featured.id !== id));
    setNotification({
      open: true,
      message: 'Xóa giảng viên nổi bật thành công!',
      severity: 'success'
    });
  };

  const handleToggleVisibility = (id: string, isActive: boolean) => {
    setFeaturedTeachers(prev => prev.map(featured =>
      featured.id === id ? { ...featured, isActive } : featured
    ));
    setNotification({
      open: true,
      message: `Đã ${isActive ? 'hiện' : 'ẩn'} giảng viên nổi bật`,
      severity: 'success'
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Get available teachers (not already featured)
  const availableTeachers = (teachers || []).filter(teacher =>
    !featuredTeachers.some(featured => featured.teacherId === teacher.id)
  );

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý Giảng viên nổi bật
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Chọn và sắp xếp giảng viên hiển thị trong section nổi bật trên trang chủ
          </Typography>

          {/* Add Featured Teacher Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={availableTeachers.length === 0}
              sx={{ mb: 2 }}
            >
              Thêm giảng viên nổi bật
            </Button>
            {availableTeachers.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Tất cả giảng viên đã được thêm vào danh sách nổi bật
              </Typography>
            )}
          </Box>

          {/* Featured Teachers List */}
          <Grid container spacing={3}>
            {featuredTeachers.map((featured) => (
              <Grid item xs={12} md={6} key={featured.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar
                        src={featured.teacher.avatar || undefined}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {featured.customTitle || featured.teacher.name}
                          </Typography>
                          <Chip
                            label={featured.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                            color={featured.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph>
                          {featured.customDescription || featured.teacher.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={`Thứ tự: ${featured.order}`} size="small" variant="outlined" />
                          <Chip
                            label={featured.teacher.specializations?.join(', ') || 'Tiếng Anh'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          Email: {featured.teacher.email}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Box>
                      <IconButton
                        onClick={() => handleOpenDialog(featured)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteFeatured(featured.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <IconButton
                      onClick={() => handleToggleVisibility(featured.id, !featured.isActive)}
                      color={featured.isActive ? 'success' : 'default'}
                      size="small"
                    >
                      {featured.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {featuredTeachers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có giảng viên nổi bật nào
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Thêm giảng viên đầu tiên để hiển thị trong section nổi bật trên trang chủ
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={availableTeachers.length === 0}
              >
                Thêm giảng viên đầu tiên
              </Button>
            </Box>
          )}

          {/* Dialog for adding/editing featured teacher */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingFeatured ? 'Chỉnh sửa giảng viên nổi bật' : 'Thêm giảng viên nổi bật'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Chọn giảng viên *"
                    value={formData.teacherId || ''}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    margin="normal"
                    required
                  >
                    {availableTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.email}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề tùy chỉnh"
                    value={formData.customTitle || ''}
                    onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                    margin="normal"
                    placeholder="Để trống để sử dụng tên gốc"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả tùy chỉnh"
                    value={formData.customDescription || ''}
                    onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
                    margin="normal"
                    multiline
                    rows={3}
                    placeholder="Để trống để sử dụng mô tả gốc"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Thứ tự"
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive || false}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                    }
                    label="Hiển thị giảng viên nổi bật"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button onClick={handleSubmit} variant="contained">
                {editingFeatured ? 'Cập nhật' : 'Thêm'}
              </Button>
            </DialogActions>
          </Dialog>

          <NotificationSnackbar
            open={notification.open}
            message={notification.message}
            severity={notification.severity}
            onClose={handleNotificationClose}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default FeaturedTeachersManagement;
