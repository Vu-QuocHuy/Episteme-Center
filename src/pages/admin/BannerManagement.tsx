import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Button, Switch, FormControlLabel,
  Slider
} from '@mui/material';
// Removed preview imports
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { commonStyles } from '../../utils/styles';
// Removed preview components and advertisement API/types
import { useBannerConfig, PopupConfig } from '../../hooks/useBannerConfig';



const BannerManagement: React.FC = () => {
  // State
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Popup Configuration only
  const { popupConfig, savePopupConfig: savePopupConfigToStorage } = useBannerConfig();

  const handlePopupConfigChange = (field: keyof PopupConfig, value: any) => {
    const newConfig = {
      ...popupConfig,
      [field]: value
    };
    savePopupConfigToStorage(newConfig);
  };

  const handleSavePopupConfig = () => {
    savePopupConfigToStorage(popupConfig);
    setNotification({
      open: true,
      message: 'Cập nhật cấu hình popup thành công! Cấu hình sẽ được áp dụng ngay lập tức.',
      severity: 'success'
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Removed advertisement filters

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý Popup
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Cấu hình popup chào mừng trên trang chủ
          </Typography>

          {/* Content Container with max width */}
          <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
            <Grid container spacing={3}>
              {/* Popup Configuration */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Cấu hình Welcome Popup
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Điều chỉnh các thông số hiển thị của popup chào mừng
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      {/* Width */}
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Chiều rộng popup (px)</Typography>
                        <Slider
                          value={popupConfig.width}
                          onChange={(_e, value) => handlePopupConfigChange('width', value)}
                          min={300}
                          max={800}
                          step={50}
                          marks
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Hiện tại: {popupConfig.width}px
                        </Typography>
                      </Box>

                      {/* Height */}
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Chiều cao popup (px)</Typography>
                        <Slider
                          value={popupConfig.height}
                          onChange={(_e, value) => handlePopupConfigChange('height', value)}
                          min={300}
                          max={600}
                          step={50}
                          marks
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Hiện tại: {popupConfig.height}px
                        </Typography>
                      </Box>

                      {/* Show on First Visit */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={popupConfig.showOnFirstVisit}
                            onChange={(e) => handlePopupConfigChange('showOnFirstVisit', e.target.checked)}
                          />
                        }
                        label="Hiển thị khi lần đầu truy cập"
                        sx={{ mb: 2 }}
                      />

                      {/* Show Delay */}
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Độ trễ hiển thị (ms)</Typography>
                        <Slider
                          value={popupConfig.showDelay}
                          onChange={(_e, value) => handlePopupConfigChange('showDelay', value)}
                          min={0}
                          max={10000}
                          step={500}
                          marks
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Hiện tại: {popupConfig.showDelay}ms
                        </Typography>
                      </Box>

                      {/* Active Status */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={popupConfig.isActive}
                            onChange={(e) => handlePopupConfigChange('isActive', e.target.checked)}
                          />
                        }
                        label="Kích hoạt popup"
                        sx={{ mb: 3 }}
                      />

                      <Button
                        variant="contained"
                        onClick={handleSavePopupConfig}
                        fullWidth
                      >
                        Lưu cấu hình Popup
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>


            </Grid>
          </Box>

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

export default BannerManagement;
