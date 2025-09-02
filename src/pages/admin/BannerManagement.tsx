import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Button, Switch, FormControlLabel,
  Tabs, Tab, Slider
} from '@mui/material';
// Removed preview imports
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { commonStyles } from '../../utils/styles';
// Removed preview components and advertisement API/types
import { useBannerConfig, BannerConfig, PopupConfig } from '../../hooks/useBannerConfig';



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`banner-tabpanel-${index}`}
      aria-labelledby={`banner-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const BannerManagement: React.FC = () => {
  // State
  const [tabValue, setTabValue] = useState(0);
  // Preview-related states removed
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Banner Configuration
  const { bannerConfig, popupConfig, saveBannerConfig: saveBannerConfigToStorage, savePopupConfig: savePopupConfigToStorage } = useBannerConfig();

  // Removed advertisements fetching

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBannerConfigChange = (field: keyof BannerConfig, value: any) => {
    const newConfig = {
      ...bannerConfig,
      [field]: value
    };
    saveBannerConfigToStorage(newConfig);
  };

  const handlePopupConfigChange = (field: keyof PopupConfig, value: any) => {
    const newConfig = {
      ...popupConfig,
      [field]: value
    };
    savePopupConfigToStorage(newConfig);
  };

  const handleSaveBannerConfig = () => {
    saveBannerConfigToStorage(bannerConfig);
    setNotification({
      open: true,
      message: 'Cập nhật cấu hình banner thành công! Cấu hình sẽ được áp dụng ngay lập tức.',
      severity: 'success'
    });
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
              Quản lý Banner & Popup
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Cấu hình banner quảng cáo và popup chào mừng trên trang chủ
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="banner management tabs">
              <Tab label="Banner Slider" />
              <Tab label="Welcome Popup" />
            </Tabs>
          </Box>

          {/* Content Container with max width */}
          <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>

          {/* Banner Slider Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Banner Configuration */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Cấu hình Banner Slider
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Điều chỉnh các thông số hiển thị của banner
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      {/* Height */}
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Chiều cao banner (px)</Typography>
                        <Slider
                          value={bannerConfig.height}
                          onChange={(_e, value) => handleBannerConfigChange('height', value)}
                          min={300}
                          max={800}
                          step={10}
                          marks
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Hiện tại: {bannerConfig.height}px
                        </Typography>
                      </Box>

                      {/* Auto Play */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bannerConfig.autoPlay}
                            onChange={(e) => handleBannerConfigChange('autoPlay', e.target.checked)}
                          />
                        }
                        label="Tự động chuyển slide"
                        sx={{ mb: 2 }}
                      />

                      {/* Interval */}
                      {bannerConfig.autoPlay && (
                        <Box sx={{ mb: 3 }}>
                          <Typography gutterBottom>Thời gian chuyển slide (ms)</Typography>
                          <Slider
                            value={bannerConfig.interval}
                            onChange={(_e, value) => handleBannerConfigChange('interval', value)}
                            min={3000}
                            max={15000}
                            step={500}
                            marks
                            valueLabelDisplay="auto"
                          />
                          <Typography variant="body2" color="text.secondary">
                            Hiện tại: {bannerConfig.interval}ms
                          </Typography>
                        </Box>
                      )}

                      {/* Max Slides */}
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Số lượng quảng cáo tối đa</Typography>
                        <Slider
                          value={bannerConfig.maxSlides}
                          onChange={(_e, value) => handleBannerConfigChange('maxSlides', value)}
                          min={1}
                          max={10}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Hiện tại: {bannerConfig.maxSlides} quảng cáo
                        </Typography>
                      </Box>

                      {/* Show Arrows */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bannerConfig.showArrows}
                            onChange={(e) => handleBannerConfigChange('showArrows', e.target.checked)}
                          />
                        }
                        label="Hiển thị nút điều hướng"
                        sx={{ mb: 2 }}
                      />

                      {/* Show Dots */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bannerConfig.showDots}
                            onChange={(e) => handleBannerConfigChange('showDots', e.target.checked)}
                          />
                        }
                        label="Hiển thị dots indicator"
                        sx={{ mb: 2 }}
                      />

                      {/* Active Status */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bannerConfig.isActive}
                            onChange={(e) => handleBannerConfigChange('isActive', e.target.checked)}
                          />
                        }
                        label="Kích hoạt banner"
                        sx={{ mb: 3 }}
                      />

                      <Button
                        variant="contained"
                        onClick={handleSaveBannerConfig}
                        fullWidth
                      >
                        Lưu cấu hình Banner
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>


            </Grid>
          </TabPanel>

          {/* Welcome Popup Tab */}
          <TabPanel value={tabValue} index={1}>
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
          </TabPanel>


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
