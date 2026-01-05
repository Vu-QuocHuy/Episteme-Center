import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useFooterSettings, FooterSettings as FooterSettingsType } from '../../hooks/useFooterSettings';
import { commonStyles } from '../../utils/styles';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { updateFooterSettingsAPI, createFooterSettingsAPI } from '../../services/footer-settings';

const FooterSettings: React.FC = () => {
  const { footerSettings, loading, hasData } = useFooterSettings();
  const [settings, setSettings] = useState<FooterSettingsType>(footerSettings);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Sync settings with footerSettings when it changes (loaded from API)
  useEffect(() => {
    if (!loading && footerSettings) {
      setSettings(footerSettings);
    }
  }, [footerSettings, loading]);

  const handleChange = (field: keyof FooterSettingsType) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = event.target.value;

    // Nếu là mapEmbedUrl và user paste toàn bộ thẻ iframe, tự động extract URL
    if (field === 'mapEmbedUrl' && value.includes('<iframe')) {
      const srcMatch = value.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        value = srcMatch[1];
        setSnackbar({
          open: true,
          message: 'Đã tự động trích xuất URL từ thẻ iframe!',
          severity: 'success'
        });
      }
    }

    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!settings.companyName || !settings.email || !settings.phone || !settings.address) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
          severity: 'warning'
        });
        return;
      }

      // Validate Google Maps URL if provided
      if (settings.mapEmbedUrl && !settings.mapEmbedUrl.includes('google.com/maps/embed')) {
        setSnackbar({
          open: true,
          message: 'URL Google Maps không hợp lệ! Vui lòng sử dụng URL Embed (phải chứa "google.com/maps/embed")',
          severity: 'error'
        });
        return;
      }

      setSaving(true);
      
      // Sử dụng POST nếu chưa có data, PATCH nếu đã có
      try {
        if (hasData) {
      await updateFooterSettingsAPI(settings);
        } else {
          await createFooterSettingsAPI(settings);
        }
      } catch (error: any) {
        // Nếu update fail vì chưa có data, thử create
        if (hasData && (error?.response?.status === 400 || error?.response?.status === 404)) {
          await createFooterSettingsAPI(settings);
        } else {
          throw error;
        }
      }

      setSnackbar({
        open: true,
        message: 'Cập nhật thành công! Cấu hình sẽ được áp dụng ngay lập tức.',
        severity: 'success'
      });
      
      // Reload page after 1 second to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving footer settings:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi lưu cài đặt',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={commonStyles.pageContainer}>
          <Box sx={commonStyles.contentContainer}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress />
            </Box>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Cài đặt Footer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cấu hình thông tin liên hệ và mạng xã hội hiển thị ở footer
            </Typography>
          </Box>

          {/* Form Section */}
          <Paper sx={{ p: 4, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên trung tâm"
                value={settings.companyName}
                onChange={handleChange('companyName')}
                required
                helperText="Tên hiển thị trong footer"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={settings.email}
                onChange={handleChange('email')}
                required
                helperText="Email liên hệ"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={settings.phone}
                onChange={handleChange('phone')}
                required
                helperText="Số điện thoại liên hệ"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={settings.address}
                onChange={handleChange('address')}
                required
                helperText="Địa chỉ trung tâm"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={settings.description}
                onChange={handleChange('description')}
                helperText="Mô tả ngắn về trung tâm (tùy chọn)"
              />
            </Grid>

            {/* Social Media */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Mạng xã hội (Tùy chọn)
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Facebook URL"
                value={settings.facebookUrl}
                onChange={handleChange('facebookUrl')}
                placeholder="https://facebook.com/..."
                helperText="Link trang Facebook"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="YouTube URL"
                value={settings.youtubeUrl}
                onChange={handleChange('youtubeUrl')}
                placeholder="https://youtube.com/..."
                helperText="Link kênh YouTube"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zalo URL"
                value={settings.zaloUrl}
                onChange={handleChange('zaloUrl')}
                placeholder="https://zalo.me/..."
                helperText="Link Zalo"
              />
            </Grid>

            {/* Google Map Section */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Google Map
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Google Maps Embed URL"
                value={settings.mapEmbedUrl}
                onChange={handleChange('mapEmbedUrl')}
                placeholder="Paste toàn bộ thẻ <iframe>...</iframe> hoặc chỉ URL"
                multiline
                rows={3}
                error={settings.mapEmbedUrl ? !settings.mapEmbedUrl.includes('google.com/maps/embed') : false}
                helperText={
                  settings.mapEmbedUrl && !settings.mapEmbedUrl.includes('google.com/maps/embed')
                    ? '⚠️ URL không hợp lệ! Phải là URL Embed (chứa "google.com/maps/embed")'
                    : 'Paste toàn bộ thẻ iframe từ Google Maps, hệ thống sẽ tự động trích xuất URL'
                }
              />
            </Grid>

            {/* Hướng dẫn */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #ddd' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📍 Cách lấy Google Maps Embed:
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0, fontSize: '0.875rem' }}>
                  <li>Vào <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontWeight: 600 }}>Google Maps</a></li>
                  <li>Tìm địa chỉ → Click "Share" → Tab "Embed a map"</li>
                  <li>Copy toàn bộ thẻ <code>&lt;iframe&gt;...&lt;/iframe&gt;</code></li>
                  <li>Paste vào ô phía trên</li>
                </Box>
              </Paper>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={commonStyles.primaryButton}
                  size="large"
                >
                  {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Notification Snackbar */}
        <NotificationSnackbar
          open={snackbar.open}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          message={snackbar.message}
          severity={snackbar.severity}
          autoHideDuration={4000}
        />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default FooterSettings;
