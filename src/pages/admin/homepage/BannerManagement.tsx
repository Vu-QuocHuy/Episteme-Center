import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Switch, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, IconButton, Chip, useTheme,
  Tabs, Tab, Divider, Slider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../../components/common/NotificationSnackbar';
import { commonStyles } from '../../../utils/styles';
import AdvertisementSlider from '../../../components/advertisement/AdvertisementSlider';
import WelcomeAdPopup from '../../../components/advertisement/WelcomeAdPopup';
import { getAdvertisementsAPI } from '../../../services/api';
import { Advertisement } from '../../../types';
import { useBannerConfig, BannerConfig, PopupConfig } from '../../../hooks/useBannerConfig';



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
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showPopupPreview, setShowPopupPreview] = useState(false);
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

  // Fetch advertisements
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const response = await getAdvertisementsAPI({ page: 1, limit: 100 });
        if (response.data?.data?.result) {
          setAdvertisements(response.data.data.result);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setNotification({
          open: true,
          message: 'Không thể tải danh sách quảng cáo',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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

  // Filter active advertisements
  const activeAdvertisements = advertisements.filter(ad => ad.isActive);

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
                Quản lý Banner & Popup
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Cấu hình banner quảng cáo và popup chào mừng trên trang chủ
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="banner management tabs">
              <Tab label="Banner Slider" />
              <Tab label="Welcome Popup" />
              <Tab label="Xem trước" />
            </Tabs>
          </Box>

          {/* Banner Slider Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
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
                          onChange={(e, value) => handleBannerConfigChange('height', value)}
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
                            onChange={(e, value) => handleBannerConfigChange('interval', value)}
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
                          onChange={(e, value) => handleBannerConfigChange('maxSlides', value)}
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

              {/* Banner Preview */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Xem trước Banner
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Cách banner sẽ hiển thị trên trang chủ
                    </Typography>

                    <Box sx={{ mt: 3, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                      {bannerConfig.isActive && activeAdvertisements.length > 0 ? (
                        <Box sx={{ height: bannerConfig.height }}>
                          <AdvertisementSlider
                            ads={activeAdvertisements.slice(0, bannerConfig.maxSlides)}
                            autoPlay={bannerConfig.autoPlay}
                            interval={bannerConfig.interval}
                            showArrows={bannerConfig.showArrows}
                            showDots={bannerConfig.showDots}
                            height={bannerConfig.height}
                          />
                        </Box>
                      ) : (
                        <Box sx={{
                          height: bannerConfig.height,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}>
                          <Typography color="text.secondary">
                            {activeAdvertisements.length === 0
                              ? 'Chưa có quảng cáo nào'
                              : 'Banner đã bị tắt'
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Số quảng cáo hiện có: {activeAdvertisements.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Số quảng cáo sẽ hiển thị: {Math.min(activeAdvertisements.length, bannerConfig.maxSlides)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Welcome Popup Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              {/* Popup Configuration */}
              <Grid item xs={12} md={6}>
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
                          onChange={(e, value) => handlePopupConfigChange('width', value)}
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
                          onChange={(e, value) => handlePopupConfigChange('height', value)}
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
                          onChange={(e, value) => handlePopupConfigChange('showDelay', value)}
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

              {/* Popup Preview */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Xem trước Popup
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Cách popup sẽ hiển thị
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      {popupConfig.isActive && activeAdvertisements.length > 0 ? (
                        <Box sx={{
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          overflow: 'hidden',
                          width: popupConfig.width,
                          height: popupConfig.height,
                          position: 'relative'
                        }}>
                          <WelcomeAdPopup
                            open={showPopupPreview}
                            onClose={() => setShowPopupPreview(false)}
                            ads={activeAdvertisements}
                            width={popupConfig.width}
                            height={popupConfig.height}
                          />
                          <Box sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100'
                          }}>
                            <Button
                              variant="outlined"
                              onClick={() => setShowPopupPreview(true)}
                            >
                              Xem popup
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          width: popupConfig.width,
                          height: popupConfig.height,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}>
                          <Typography color="text.secondary">
                            {activeAdvertisements.length === 0
                              ? 'Chưa có quảng cáo nào'
                              : 'Popup đã bị tắt'
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Kích thước: {popupConfig.width} x {popupConfig.height}px
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Độ trễ: {popupConfig.showDelay}ms
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Xem trước tổng thể
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Mô phỏng cách banner và popup sẽ hiển thị trên trang chủ
                </Typography>

                <Box sx={{ mt: 3 }}>
                  {/* Banner Preview */}
                  {bannerConfig.isActive && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Banner Slider
                      </Typography>
                      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ height: bannerConfig.height }}>
                          <AdvertisementSlider
                            ads={activeAdvertisements.slice(0, bannerConfig.maxSlides)}
                            autoPlay={bannerConfig.autoPlay}
                            interval={bannerConfig.interval}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Popup Preview */}
                  {popupConfig.isActive && activeAdvertisements.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Welcome Popup
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => setShowPopupPreview(true)}
                        startIcon={<PreviewIcon />}
                      >
                        Hiển thị popup
                      </Button>
                    </Box>
                  )}

                  <WelcomeAdPopup
                    open={showPopupPreview}
                    onClose={() => setShowPopupPreview(false)}
                    ads={activeAdvertisements}
                    width={popupConfig.width}
                    height={popupConfig.height}
                  />
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

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
