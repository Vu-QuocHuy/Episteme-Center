import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Switch, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, IconButton, Chip, useTheme,
  Divider, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../../components/common/NotificationSnackbar';
import { commonStyles } from '../../../utils/styles';

interface FooterLink {
  id: string;
  title: string;
  url: string;
  order: number;
  isActive: boolean;
}

interface FooterContent {
  companyName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  copyright: string;
  socialLinks: FooterLink[];
  quickLinks: FooterLink[];
}

const FooterManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const [footerContent, setFooterContent] = useState<FooterContent>({
    companyName: 'Trung tâm Anh ngữ ABC',
    description: 'Chuyên đào tạo tiếng Anh chất lượng cao với đội ngũ giảng viên giàu kinh nghiệm.',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0123 456 789',
    email: 'info@abcenter.edu.vn',
    copyright: '© 2024 Trung tâm Anh ngữ ABC. Tất cả quyền được bảo lưu.',
    socialLinks: [
      {
        id: '1',
        title: 'Facebook',
        url: 'https://facebook.com/abcenter',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        title: 'YouTube',
        url: 'https://youtube.com/abcenter',
        order: 2,
        isActive: true
      }
    ],
    quickLinks: [
      {
        id: '1',
        title: 'Về chúng tôi',
        url: '/about',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        title: 'Khóa học',
        url: '/courses',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        title: 'Liên hệ',
        url: '/contact',
        order: 3,
        isActive: true
      }
    ]
  });

  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [linkType, setLinkType] = useState<'social' | 'quick'>('social');
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
  const [mainFormData, setMainFormData] = useState<Partial<FooterContent>>({
    companyName: footerContent.companyName,
    description: footerContent.description,
    address: footerContent.address,
    phone: footerContent.phone,
    email: footerContent.email,
    copyright: footerContent.copyright
  });

  // Form state for link
  const [linkFormData, setLinkFormData] = useState<Partial<FooterLink>>({
    title: '',
    url: '',
    order: 1,
    isActive: true
  });

  const handleSaveMainContent = () => {
    setFooterContent(prev => ({
      ...prev,
      ...mainFormData
    }));
    setNotification({
      open: true,
      message: 'Cập nhật thông tin footer thành công!',
      severity: 'success'
    });
  };

  const handleOpenLinkDialog = (link?: FooterLink, type: 'social' | 'quick' = 'social') => {
    setLinkType(type);
    if (link) {
      setEditingLink(link);
      setLinkFormData(link);
    } else {
      setEditingLink(null);
      setLinkFormData({
        title: '',
        url: '',
        order: (type === 'social' ? footerContent.socialLinks : footerContent.quickLinks).length + 1,
        isActive: true
      });
    }
    setOpenLinkDialog(true);
  };

  const handleCloseLinkDialog = () => {
    setOpenLinkDialog(false);
    setEditingLink(null);
    setLinkFormData({
      title: '',
      url: '',
      order: 1,
      isActive: true
    });
  };

  const handleSaveLink = () => {
    if (!linkFormData.title || !linkFormData.url) {
      setNotification({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error'
      });
      return;
    }

    if (editingLink) {
      // Update existing link
      if (linkType === 'social') {
        setFooterContent(prev => ({
          ...prev,
          socialLinks: prev.socialLinks.map(link =>
            link.id === editingLink.id ? { ...link, ...linkFormData } : link
          )
        }));
      } else {
        setFooterContent(prev => ({
          ...prev,
          quickLinks: prev.quickLinks.map(link =>
            link.id === editingLink.id ? { ...link, ...linkFormData } : link
          )
        }));
      }
      setNotification({
        open: true,
        message: 'Cập nhật link thành công!',
        severity: 'success'
      });
    } else {
      // Add new link
      const newLink: FooterLink = {
        id: Date.now().toString(),
        ...linkFormData as FooterLink
      };

      if (linkType === 'social') {
        setFooterContent(prev => ({
          ...prev,
          socialLinks: [...prev.socialLinks, newLink]
        }));
      } else {
        setFooterContent(prev => ({
          ...prev,
          quickLinks: [...prev.quickLinks, newLink]
        }));
      }
      setNotification({
        open: true,
        message: 'Thêm link mới thành công!',
        severity: 'success'
      });
    }
    handleCloseLinkDialog();
  };

  const handleDeleteLink = (id: string, type: 'social' | 'quick') => {
    if (type === 'social') {
      setFooterContent(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.filter(link => link.id !== id)
      }));
    } else {
      setFooterContent(prev => ({
        ...prev,
        quickLinks: prev.quickLinks.filter(link => link.id !== id)
      }));
    }
    setNotification({
      open: true,
      message: 'Xóa link thành công!',
      severity: 'success'
    });
  };

  const handleToggleLinkVisibility = (id: string, isActive: boolean, type: 'social' | 'quick') => {
    if (type === 'social') {
      setFooterContent(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.map(link =>
          link.id === id ? { ...link, isActive } : link
        )
      }));
    } else {
      setFooterContent(prev => ({
        ...prev,
        quickLinks: prev.quickLinks.map(link =>
          link.id === id ? { ...link, isActive } : link
        )
      }));
    }
    setNotification({
      open: true,
      message: `Đã ${isActive ? 'hiện' : 'ẩn'} link`,
      severity: 'success'
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={commonStyles.pageHeader}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate('/admin/homepage')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography sx={commonStyles.pageTitle}>
                Quản lý Footer
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Chỉnh sửa thông tin footer và các link liên kết
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
                  Chỉnh sửa thông tin công ty và liên hệ
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Tên công ty"
                    value={mainFormData.companyName || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, companyName: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Mô tả"
                    value={mainFormData.description || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={mainFormData.address || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, address: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={mainFormData.phone || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, phone: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={mainFormData.email || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, email: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Copyright"
                    value={mainFormData.copyright || ''}
                    onChange={(e) => setMainFormData({ ...mainFormData, copyright: e.target.value })}
                    margin="normal"
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
                  Xem trước Footer
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Cách footer sẽ hiển thị trên trang web
                </Typography>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {mainFormData.companyName || 'Tên công ty'}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {mainFormData.description || 'Mô tả công ty...'}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">📍 {mainFormData.address || 'Địa chỉ'}</Typography>
                    <Typography variant="body2">📞 {mainFormData.phone || 'Số điện thoại'}</Typography>
                    <Typography variant="body2">✉️ {mainFormData.email || 'Email'}</Typography>
                  </Box>

                  <Divider sx={{ bgcolor: 'grey.700', my: 2 }} />

                  <Typography variant="caption" color="grey.400">
                    {mainFormData.copyright || 'Copyright text...'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Social Links Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Social Media Links
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenLinkDialog(undefined, 'social')}
            >
              Thêm social link
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Quản lý các link mạng xã hội
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {footerContent.socialLinks.map((link) => (
            <Grid item xs={12} sm={6} md={4} key={link.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {link.title}
                    </Typography>
                    <Chip
                      label={link.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                      color={link.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {link.url}
                  </Typography>
                  <Chip label={`Thứ tự: ${link.order}`} size="small" variant="outlined" />
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={link.isActive}
                        onChange={(e) => handleToggleLinkVisibility(link.id, e.target.checked, 'social')}
                        size="small"
                      />
                    }
                    label=""
                  />
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenLinkDialog(link, 'social')}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteLink(link.id, 'social')}
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

        {/* Quick Links Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Quick Links
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenLinkDialog(undefined, 'quick')}
            >
              Thêm quick link
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Quản lý các link nhanh trong footer
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {footerContent.quickLinks.map((link) => (
            <Grid item xs={12} sm={6} md={4} key={link.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {link.title}
                    </Typography>
                    <Chip
                      label={link.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                      color={link.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {link.url}
                  </Typography>
                  <Chip label={`Thứ tự: ${link.order}`} size="small" variant="outlined" />
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={link.isActive}
                        onChange={(e) => handleToggleLinkVisibility(link.id, e.target.checked, 'quick')}
                        size="small"
                      />
                    }
                    label=""
                  />
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenLinkDialog(link, 'quick')}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteLink(link.id, 'quick')}
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

        {/* Dialog for adding/editing link */}
        <Dialog open={openLinkDialog} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingLink ? 'Chỉnh sửa link' : `Thêm ${linkType === 'social' ? 'social' : 'quick'} link`}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề *"
                  value={linkFormData.title || ''}
                  onChange={(e) => setLinkFormData({ ...linkFormData, title: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL *"
                  value={linkFormData.url || ''}
                  onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                  margin="normal"
                  required
                  placeholder={linkType === 'social' ? 'https://facebook.com/...' : '/about'}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thứ tự"
                  type="number"
                  value={linkFormData.order || 1}
                  onChange={(e) => setLinkFormData({ ...linkFormData, order: parseInt(e.target.value) })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={linkFormData.isActive || false}
                      onChange={(e) => setLinkFormData({ ...linkFormData, isActive: e.target.checked })}
                    />
                  }
                  label="Hiển thị link"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLinkDialog}>Hủy</Button>
            <Button onClick={handleSaveLink} variant="contained">
              {editingLink ? 'Cập nhật' : 'Thêm'}
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

export default FooterManagement;
