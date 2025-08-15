import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  DragIndicator as DragIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import HomeContentForm from '../../components/features/home/HomeContentForm';
import { useHomeContentManagement } from '../../hooks/features/useHomeContentManagement';
import { HomeContent } from '../../types';

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
      id={`section-tabpanel-${index}`}
      aria-labelledby={`section-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const sectionConfig = [
  { value: 'hero', label: 'Hero Section', description: 'Phần banner chính của trang chủ' },
  { value: 'about', label: 'About Section', description: 'Giới thiệu về trung tâm' },
  { value: 'services', label: 'Services Section', description: 'Các dịch vụ cung cấp' },
  { value: 'features', label: 'Features Section', description: 'Tính năng nổi bật' },
  { value: 'testimonials', label: 'Testimonials Section', description: 'Đánh giá từ học viên' },
  { value: 'contact', label: 'Contact Section', description: 'Thông tin liên hệ' },
  { value: 'footer', label: 'Footer Section', description: 'Phần chân trang' }
];

const HomeContentManagement: React.FC = () => {
  const {
    homeContent,
    loading,
    error,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    sectionFilter,
    setSectionFilter,
    handlePageChange,
    resetFilters
  } = useHomeContentManagement();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<HomeContent | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewDialog, setPreviewDialog] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<HomeContent | null>(null);

  const handleOpenDialog = useCallback((content: HomeContent | null = null, section?: string): void => {
    setSelectedContent(content);
    if (section && !content) {
      // Pre-fill section when adding new content
      setSelectedContent({ section } as HomeContent);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback((): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedContent(null);
    }, 100);
  }, []);

  const handleSubmitContent = useCallback(async (contentData: any): Promise<void> => {
    console.log('Submitting content:', contentData);
    // TODO: Implement API call
    handleCloseDialog();
  }, [handleCloseDialog]);

  const handleEditContent = useCallback((content: HomeContent): void => {
    handleOpenDialog(content);
  }, [handleOpenDialog]);

  const handleDeleteContent = useCallback((content: HomeContent): void => {
    console.log('Deleting content:', content);
    // TODO: Implement delete API call
  }, []);

  const handleToggleActive = useCallback((content: HomeContent): void => {
    console.log('Toggling active status for:', content);
    // TODO: Implement toggle API call
  }, []);

  const handlePreviewContent = useCallback((content: HomeContent): void => {
    setPreviewContent(content);
    setPreviewDialog(true);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const section = sectionConfig[newValue]?.value;
    if (section) {
      setSectionFilter(section);
    }
  };

  const getContentBySection = (section: string) => {
    return homeContent.filter(item => item.section === section);
  };

  const renderContentCard = (content: HomeContent) => (
    <Card key={content.id} sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DragIcon sx={{ mr: 1, color: 'text.secondary', cursor: 'grab' }} />
              <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                {content.title || 'Không có tiêu đề'}
              </Typography>
              <Chip
                label={content.isActive ? 'Hiển thị' : 'Ẩn'}
                size="small"
                color={content.isActive ? 'success' : 'default'}
                variant={content.isActive ? 'filled' : 'outlined'}
              />
            </Box>

            {content.subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {content.subtitle}
              </Typography>
            )}

            {content.description && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {content.description.length > 100
                  ? `${content.description.substring(0, 100)}...`
                  : content.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip label={`Thứ tự: ${content.order}`} size="small" variant="outlined" />
              {content.imageUrl && (
                <Chip label="Có hình ảnh" size="small" variant="outlined" color="primary" />
              )}
              {content.buttonText && (
                <Chip label="Có nút bấm" size="small" variant="outlined" color="secondary" />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Xem trước">
          <IconButton size="small" onClick={() => handlePreviewContent(content)} color="info">
            <PreviewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chỉnh sửa">
          <IconButton size="small" onClick={() => handleEditContent(content)} color="primary">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={content.isActive ? 'Ẩn nội dung' : 'Hiển thị nội dung'}>
          <IconButton
            size="small"
            onClick={() => handleToggleActive(content)}
            color={content.isActive ? 'warning' : 'success'}
          >
            {content.isActive ? <HideIcon /> : <ViewIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton size="small" onClick={() => handleDeleteContent(content)} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Box>
              <Typography sx={commonStyles.pageTitle}>
                Quản lý nội dung trang chủ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tùy chỉnh và quản lý nội dung hiển thị trên trang chủ
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm nội dung
            </Button>
          </Box>

          {/* Search Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tiêu đề, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Section Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {sectionConfig.map((section, index) => (
                <Tab
                  key={section.value}
                  label={
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {section.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getContentBySection(section.value).length} mục
                      </Typography>
                    </Box>
                  }
                  sx={{ minHeight: 64, alignItems: 'flex-start', py: 1 }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Content by Section */}
          {sectionConfig.map((section, index) => (
            <TabPanel key={section.value} value={activeTab} index={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">
                    {section.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog(null, section.value)}
                  size="small"
                >
                  Thêm vào {section.label}
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {getContentBySection(section.value).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Chưa có nội dung nào trong {section.label}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(null, section.value)}
                  >
                    Thêm nội dung đầu tiên
                  </Button>
                </Box>
              ) : (
                <Box>
                  {getContentBySection(section.value)
                    .sort((a, b) => a.order - b.order)
                    .map(renderContentCard)}
                </Box>
              )}
            </TabPanel>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => handlePageChange(event as any, value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Content Form Dialog */}
      <HomeContentForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitContent}
        contentItem={selectedContent}
        loading={false}
      />

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Xem trước nội dung
        </DialogTitle>
        <DialogContent>
          {previewContent && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {previewContent.title}
              </Typography>
              {previewContent.subtitle && (
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {previewContent.subtitle}
                </Typography>
              )}
              {previewContent.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewContent.description}
                </Typography>
              )}
              {previewContent.content && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Nội dung chi tiết:</Typography>
                  <div dangerouslySetInnerHTML={{ __html: previewContent.content }} />
                </Box>
              )}
              {previewContent.imageUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Hình ảnh:</Typography>
                  <img
                    src={previewContent.imageUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
              {previewContent.buttonText && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary">
                    {previewContent.buttonText}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default HomeContentManagement;
