import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Switch, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../../components/common/NotificationSnackbar';
import { commonStyles } from '../../../utils/styles';

interface AboutFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  features: AboutFeature[];
}

const AboutManagement: React.FC = () => {

  // Mock data - in real app, this would come from API
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    title: 'Về Trung tâm Anh ngữ',
    subtitle: 'Hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục',
    description: 'Trung tâm Anh ngữ được thành lập với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.',
    features: [
      {
        id: '1',
        title: 'Giảng viên chất lượng',
        description: '100% giảng viên có bằng cấp quốc tế',
        icon: 'school',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        title: 'Phương pháp hiện đại',
        description: 'Áp dụng công nghệ AI và phương pháp học tập tiên tiến',
        icon: 'people',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        title: 'Cam kết chất lượng',
        description: 'Đảm bảo kết quả học tập cho mọi học viên',
        icon: 'star',
        order: 3,
        isActive: true
      }
    ]
  });

  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<AboutFeature | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state for main content
  const [mainFormData, setMainFormData] = useState<Partial<AboutContent>>({
    title: aboutContent.title,
    subtitle: aboutContent.subtitle,
    description: aboutContent.description
  });

  // Form state for feature
  const [featureFormData, setFeatureFormData] = useState<Partial<AboutFeature>>({
    title: '',
    description: '',
    icon: 'school',
    order: 1,
    isActive: true
  });

  const handleSaveMainContent = () => {
    setAboutContent(prev => ({
      ...prev,
      ...mainFormData
    }));
    setNotification({
      open: true,
      message: 'Cập nhật thông tin chính thành công!',
      severity: 'success'
    });
  };

  const handleOpenFeatureDialog = (feature?: AboutFeature) => {
    if (feature) {
      setEditingFeature(feature);
      setFeatureFormData(feature);
    } else {
      setEditingFeature(null);
      setFeatureFormData({
        title: '',
        description: '',
        icon: 'school',
        order: aboutContent.features.length + 1,
        isActive: true
      });
    }
    setOpenFeatureDialog(true);
  };

  const handleCloseFeatureDialog = () => {
    setOpenFeatureDialog(false);
    setEditingFeature(null);
    setFeatureFormData({
      title: '',
      description: '',
      icon: 'school',
      order: 1,
      isActive: true
    });
  };

  const handleSaveFeature = () => {
    if (!featureFormData.title || !featureFormData.description) {
      setNotification({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error'
      });
      return;
    }

    if (editingFeature) {
      // Update existing feature
      setAboutContent(prev => ({
        ...prev,
        features: prev.features.map(feature =>
          feature.id === editingFeature.id ? { ...feature, ...featureFormData } : feature
        )
      }));
      setNotification({
        open: true,
        message: 'Cập nhật đặc điểm thành công!',
        severity: 'success'
      });
    } else {
      // Add new feature
      const newFeature: AboutFeature = {
        ...featureFormData as AboutFeature,
        id: Date.now().toString()
      };
      setAboutContent(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
      setNotification({
        open: true,
        message: 'Thêm đặc điểm mới thành công!',
        severity: 'success'
      });
    }
    handleCloseFeatureDialog();
  };

  const handleDeleteFeature = (id: string) => {
    setAboutContent(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature.id !== id)
    }));
    setNotification({
      open: true,
      message: 'Xóa đặc điểm thành công!',
      severity: 'success'
    });
  };

  const handleToggleFeatureVisibility = (id: string, isActive: boolean) => {
    setAboutContent(prev => ({
      ...prev,
      features: prev.features.map(feature =>
        feature.id === id ? { ...feature, isActive } : feature
      )
    }));
    setNotification({
      open: true,
      message: `Đã ${isActive ? 'hiện' : 'ẩn'} đặc điểm`,
      severity: 'success'
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const iconOptions = [
    { value: 'school', label: 'Trường học' },
    { value: 'people', label: 'Con người' },
    { value: 'star', label: 'Ngôi sao' },
    { value: 'trending', label: 'Xu hướng' },
    { value: 'book', label: 'Sách' },
    { value: 'award', label: 'Giải thưởng' }
  ];

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý Giới thiệu
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Chỉnh sửa thông tin về trung tâm và các đặc điểm nổi bật
          </Typography>

        <Grid container spacing={4}>
          {/* Main Content Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Thông tin chính
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Chỉnh sửa tiêu đề, mô tả và thông tin chính của section giới thiệu
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Tiêu đề chính"
                    value={mainFormData.title || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, title: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Tiêu đề phụ"
                    value={mainFormData.subtitle || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, subtitle: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Mô tả chi tiết"
                    value={mainFormData.description || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveMainContent}
                    fullWidth
                  >
                    Lưu thông tin chính
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Preview Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Xem trước
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Cách section sẽ hiển thị trên trang chủ
                </Typography>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
                    {mainFormData.title || 'Tiêu đề chính'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" paragraph textAlign="center">
                    {mainFormData.subtitle || 'Tiêu đề phụ'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {mainFormData.description || 'Mô tả chi tiết...'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Features Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Đặc điểm nổi bật
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFeatureDialog()}
            >
              Thêm đặc điểm
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Quản lý các đặc điểm nổi bật của trung tâm
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {aboutContent.features.map((feature) => (
            <Grid item xs={12} md={4} key={feature.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {feature.description}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={feature.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                        color={feature.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={`Icon: ${feature.icon}`} size="small" variant="outlined" />
                    <Chip label={`Thứ tự: ${feature.order}`} size="small" variant="outlined" />
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={feature.isActive}
                        onChange={(e) => handleToggleFeatureVisibility(feature.id, e.target.checked)}
                        size="small"
                      />
                    }
                    label=""
                  />

                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenFeatureDialog(feature)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteFeature(feature.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Empty State for Features */}
        {aboutContent.features.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có đặc điểm nào
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Hãy thêm đặc điểm đầu tiên để hiển thị trên trang chủ
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFeatureDialog()}
            >
              Thêm đặc điểm đầu tiên
            </Button>
          </Box>
        )}

        {/* Dialog for adding/editing feature */}
        <Dialog open={openFeatureDialog} onClose={handleCloseFeatureDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingFeature ? 'Chỉnh sửa đặc điểm' : 'Thêm đặc điểm mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề *"
                  value={featureFormData.title || ''}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, title: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả *"
                  value={featureFormData.description || ''}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Icon"
                  value={featureFormData.icon || 'school'}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, icon: e.target.value })}
                  margin="normal"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thứ tự"
                  type="number"
                  value={featureFormData.order || 1}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, order: parseInt(e.target.value) })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={featureFormData.isActive || false}
                      onChange={(e) => setFeatureFormData({ ...featureFormData, isActive: e.target.checked })}
                    />
                  }
                  label="Hiển thị đặc điểm"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFeatureDialog}>Hủy</Button>
            <Button onClick={handleSaveFeature} variant="contained">
              {editingFeature ? 'Cập nhật' : 'Thêm'}
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

export default AboutManagement;
