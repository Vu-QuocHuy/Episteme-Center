import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
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
  Link as LinkIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { Switch, FormControlLabel } from '@mui/material';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useMenuManagement } from '../../hooks/features/useMenuManagement';
import { MenuItem as MenuItemType } from '../../types';

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
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const menuCategories = [
  { value: 'internal', label: 'Menu nội bộ', icon: '🏠', description: 'Menu liên kết đến các section trong trang' },
  { value: 'external', label: 'Menu bên ngoài', icon: '🌐', description: 'Menu liên kết đến trang web khác' },
  { value: 'all', label: 'Tất cả menu', icon: '📋', description: 'Xem tất cả menu items' }
];

const MenuManagement: React.FC = () => {
  const {
    menuItems,
    error,
    searchQuery,
    setSearchQuery,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemActive
  } = useMenuManagement();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewDialog, setPreviewDialog] = useState<boolean>(false);
  const [previewMenuItem, setPreviewMenuItem] = useState<MenuItemType | null>(null);

  const handleOpenDialog = useCallback((menuItem: MenuItemType | null = null, category?: string): void => {
    setSelectedMenuItem(menuItem);
    if (category && !menuItem) {
      // Pre-fill category when adding new menu item
      setSelectedMenuItem({
        label: '',
        sectionId: '',
        order: 1,
        isActive: true,
        isExternal: category === 'external',
        externalUrl: ''
      } as MenuItemType);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback((): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedMenuItem(null);
    }, 100);
  }, []);

  const handleSubmitMenuItem = useCallback(async (menuData: any): Promise<void> => {
    try {
      if (selectedMenuItem) {
        await updateMenuItem(selectedMenuItem.id, menuData);
      } else {
        await createMenuItem(menuData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting menu item:', error);
    }
  }, [selectedMenuItem, updateMenuItem, createMenuItem, handleCloseDialog]);

  const handleEditMenuItem = useCallback((menuItem: MenuItemType): void => {
    handleOpenDialog(menuItem);
  }, [handleOpenDialog]);

  const handleDeleteMenuItem = useCallback(async (menuItem: MenuItemType): Promise<void> => {
    try {
      await deleteMenuItem(menuItem.id);
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  }, [deleteMenuItem]);

  const handleToggleActive = useCallback(async (menuItem: MenuItemType): Promise<void> => {
    try {
      await toggleMenuItemActive(menuItem.id);
    } catch (error) {
      console.error('Error toggling menu item active:', error);
    }
  }, [toggleMenuItemActive]);

  const handlePreviewMenuItem = useCallback((menuItem: MenuItemType): void => {
    setPreviewMenuItem(menuItem);
    setPreviewDialog(true);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getMenuItemsByCategory = (category: string) => {
    switch (category) {
      case 'internal':
        return menuItems.filter(item => !item.isExternal);
      case 'external':
        return menuItems.filter(item => item.isExternal);
      default:
        return menuItems;
    }
  };

  const renderMenuItemCard = (menuItem: MenuItemType) => (
    <Card key={menuItem.id} sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DragIcon sx={{ mr: 1, color: 'text.secondary', cursor: 'grab' }} />
              <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                {menuItem.label}
              </Typography>
              <Chip
                label={menuItem.isActive ? 'Hiển thị' : 'Ẩn'}
                size="small"
                color={menuItem.isActive ? 'success' : 'default'}
                variant={menuItem.isActive ? 'filled' : 'outlined'}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {menuItem.isExternal ? 'Liên kết ngoài' : 'Liên kết nội bộ'}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {menuItem.isExternal
                ? `URL: ${menuItem.externalUrl}`
                : `Section: ${menuItem.sectionId || 'Không có'}`
              }
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip label={`Thứ tự: ${menuItem.order}`} size="small" variant="outlined" />
              <Chip
                label={menuItem.isExternal ? 'External' : 'Internal'}
                size="small"
                variant="outlined"
                color={menuItem.isExternal ? 'warning' : 'primary'}
                icon={menuItem.isExternal ? <LanguageIcon /> : <LinkIcon />}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Xem trước">
          <IconButton size="small" onClick={() => handlePreviewMenuItem(menuItem)} color="info">
            <PreviewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chỉnh sửa">
          <IconButton size="small" onClick={() => handleEditMenuItem(menuItem)} color="primary">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={menuItem.isActive ? 'Ẩn menu' : 'Hiển thị menu'}>
          <IconButton
            size="small"
            onClick={() => handleToggleActive(menuItem)}
            color={menuItem.isActive ? 'warning' : 'success'}
          >
            {menuItem.isActive ? <HideIcon /> : <ViewIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton size="small" onClick={() => handleDeleteMenuItem(menuItem)} color="error">
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
                Quản lý menu trang chủ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tùy chỉnh và quản lý các mục menu trên header
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm menu item
            </Button>
          </Box>

          {/* Search Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên menu, section..."
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

          {/* Category Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {menuCategories.map((category) => (
                <Tab
                  key={category.value}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{category.icon}</span>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {category.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getMenuItemsByCategory(category.value).length} mục
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ minHeight: 64, alignItems: 'flex-start', py: 1 }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Menu Items by Category */}
          {menuCategories.map((category, index) => (
            <TabPanel key={category.value} value={activeTab} index={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.icon} {category.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog(null, category.value)}
                  size="small"
                >
                  Thêm vào {category.label}
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {getMenuItemsByCategory(category.value).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Chưa có menu item nào trong {category.label}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(null, category.value)}
                  >
                    Thêm menu item đầu tiên
                  </Button>
                </Box>
              ) : (
                <Box>
                  {getMenuItemsByCategory(category.value)
                    .sort((a, b) => a.order - b.order)
                    .map(renderMenuItemCard)}
                </Box>
              )}
            </TabPanel>
          ))}
        </Box>
      </Box>

      {/* Menu Item Form Dialog */}
      <MenuFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitMenuItem}
        menuItem={selectedMenuItem}
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
          Xem trước menu item
        </DialogTitle>
        <DialogContent>
          {previewMenuItem && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {previewMenuItem.label}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Loại:</strong> {previewMenuItem.isExternal ? 'Liên kết ngoài' : 'Liên kết nội bộ'}
                </Typography>
                <Typography variant="body1">
                  <strong>Thứ tự:</strong> {previewMenuItem.order}
                </Typography>
                <Typography variant="body1">
                  <strong>Trạng thái:</strong> {previewMenuItem.isActive ? 'Hiển thị' : 'Ẩn'}
                </Typography>
              </Box>

              {previewMenuItem.isExternal ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>URL bên ngoài:</Typography>
                  <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-all' }}>
                    {previewMenuItem.externalUrl}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>Section ID:</Typography>
                  <Typography variant="body2" color="primary">
                    {previewMenuItem.sectionId || 'Không có'}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Preview trên header:</Typography>
                <Button variant="text" sx={{ color: 'primary.main' }}>
                  {previewMenuItem.label}
                </Button>
              </Box>
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

// Menu Form Dialog Component
interface MenuFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  menuItem?: MenuItemType | null;
  loading?: boolean;
}

const MenuFormDialog: React.FC<MenuFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  menuItem,
  loading: _loading = false
}) => {
  const [formData, setFormData] = useState({
    label: '',
    sectionId: '',
    order: 1,
    isActive: true,
    isExternal: false,
    externalUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (menuItem) {
      setFormData({
        label: menuItem.label,
        sectionId: menuItem.sectionId,
        order: menuItem.order,
        isActive: menuItem.isActive,
        isExternal: menuItem.isExternal || false,
        externalUrl: menuItem.externalUrl || ''
      });
    } else {
      setFormData({
        label: '',
        sectionId: '',
        order: 1,
        isActive: true,
        isExternal: false,
        externalUrl: ''
      });
    }
    setErrors({});
  }, [menuItem, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Tên menu là bắt buộc';
    }

    if (!formData.isExternal && !formData.sectionId.trim()) {
      newErrors.sectionId = 'Section ID là bắt buộc cho menu nội bộ';
    }

    if (formData.isExternal && !formData.externalUrl.trim()) {
      newErrors.externalUrl = 'URL là bắt buộc cho menu bên ngoài';
    }

    if (formData.order < 1) {
      newErrors.order = 'Thứ tự phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {menuItem ? 'Chỉnh sửa menu item' : 'Thêm menu item mới'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên menu"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                error={!!errors.label}
                helperText={errors.label}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thứ tự hiển thị"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                error={!!errors.order}
                helperText={errors.order}
              />
            </Grid>



            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isExternal}
                    onChange={(e) => handleInputChange('isExternal', e.target.checked)}
                    color="primary"
                  />
                }
                label="Menu liên kết bên ngoài"
              />
            </Grid>

            {formData.isExternal ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL bên ngoài"
                  value={formData.externalUrl}
                  onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                  error={!!errors.externalUrl}
                  helperText={errors.externalUrl || 'Ví dụ: https://example.com'}
                  placeholder="https://example.com"
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Section ID"
                  value={formData.sectionId}
                  onChange={(e) => handleInputChange('sectionId', e.target.value)}
                  error={!!errors.sectionId}
                  helperText={errors.sectionId || 'ID của section trong trang (ví dụ: hero-section)'}
                  placeholder="hero-section"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    color="primary"
                  />
                }
                label="Hiển thị menu này"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="contained">
            {menuItem ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MenuManagement;
