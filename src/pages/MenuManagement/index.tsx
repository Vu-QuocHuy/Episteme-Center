import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Grid,
  Paper,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,

  SubdirectoryArrowRight as SubMenuIcon,
} from '@mui/icons-material';
import {
  createMenuAPI,
  getAllMenusAPI,
  updateMenuAPI,
  deleteMenuAPI,
} from '../../services/menus';
import type { MenuData } from '../../services/menus';
import { MenuItem } from '../../types';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { commonStyles } from '../../utils/styles';
import ArticleManagement from '../admin/ArticleManagement';

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }>({
    title: '',
    slug: '',
    parentId: undefined,
    order: 1,
    isActive: true,
  });
  const [selectedParentMenu, setSelectedParentMenu] = useState<MenuItem | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    const charMap: { [key: string]: string } = {
      á: 'a', à: 'a', ả: 'a', ã: 'a', ạ: 'a',
      ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
      â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
      đ: 'd',
      é: 'e', è: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
      ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
      í: 'i', ì: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
      ó: 'o', ò: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
      ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
      ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
      ú: 'u', ù: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
      ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
      ý: 'y', ỳ: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
    };

    return title
      .toLowerCase()
      .replace(/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/g, (char) => charMap[char] || char)
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getAllMenusAPI();
      if (response.data?.data) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tải danh sách menu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create menu item
  const handleCreate = async () => {
    try {
      await createMenuAPI(formData);
      setNotification({
        open: true,
        message: 'Tạo menu thành công',
        severity: 'success',
      });
      handleCloseDialog();
      fetchMenuItems();
    } catch (error) {
      console.error('Error creating menu item:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tạo menu',
        severity: 'error',
      });
    }
  };

  // Update menu item
  const handleUpdate = async () => {
    if (!currentItem) return;

    try {
      await updateMenuAPI(currentItem.id, formData);
      setNotification({
        open: true,
        message: 'Cập nhật menu thành công',
        severity: 'success',
      });
      handleCloseDialog();
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi cập nhật menu',
        severity: 'error',
      });
    }
  };

  // Delete menu item
  const handleDelete = async (id: string) => {
    try {
      await deleteMenuAPI(id);
      setNotification({
        open: true,
        message: 'Xóa menu thành công',
        severity: 'success',
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi xóa menu',
        severity: 'error',
      });
    }
  };

  // Toggle visibility
  // Note: toggle visibility is currently unused in UI

  // Open dialog for create/edit
  const handleOpenDialog = (item?: MenuItem, parentMenu?: MenuItem) => {
    if (item) {
      // Chỉnh sửa menu hiện tại
      setCurrentItem(item);
      setSelectedParentMenu(null);
      setFormData({
        title: item.title,
        slug: item.slug || '',
        parentId: undefined, // Menu chính không có parentId
        order: item.order || 1,
        isActive: item.isActive,
      });
    } else {
      // Tạo menu mới
      setCurrentItem(null);
      setSelectedParentMenu(parentMenu || null);
      setFormData({
        title: '',
        slug: '',
        parentId: parentMenu?.id || undefined, // Set parentId nếu có parentMenu
        order: 1,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentItem(null);
    setSelectedParentMenu(null);
    setFormData({
      title: '',
      slug: '',
      parentId: undefined,
      order: 1,
      isActive: true,
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle form input changes
  const handleInputChange = (field: keyof MenuData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when title changes
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
    }
  };


  // Render menu items recursively
  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => (
      <Accordion key={item.id} sx={{ ml: level * 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {level > 0 && <SubMenuIcon color="action" />}
              <Typography variant="subtitle1">{item.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(undefined, item);
                }}
                title="Tạo submenu"
              >
                <AddIcon />
              </IconButton>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/layout-builder/${item.id}?mode=create`); // ✅ Sử dụng UUID thay vì slug
                }}
                title="Tạo Layout"
                sx={{ minWidth: 'auto', px: 1, py: 0.5, fontSize: '0.75rem' }}
              >
                Layout
              </Button>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(item);
                }}
                title="Sửa menu"
              >
                <EditIcon />
              </IconButton>

              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Bạn có chắc chắn muốn xóa menu này?')) {
                    handleDelete(item.id);
                  }
                }}
                title="Xóa menu"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ pl: 2 }}>
            {item.children && item.children.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Submenu:
                </Typography>
                {renderMenuItems(item.children, level + 1)}
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={commonStyles.pageHeader}>
        <Typography sx={commonStyles.pageTitle}>Quản lý Menu</Typography>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={commonStyles.primaryButton}
          >
            Thêm Menu
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Danh sách Menu" />
          <Tab label="Quản lý Bài viết" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        {menuItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có menu nào. Hãy tạo menu đầu tiên!
            </Typography>
          </Box>
        ) : (
          renderMenuItems(menuItems)
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem
            ? 'Sửa Menu'
            : selectedParentMenu
              ? `Thêm Submenu cho "${selectedParentMenu.title}"`
              : 'Thêm Menu Mới'
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  helperText="URL-friendly version của tiêu đề (không bắt buộc)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thứ tự hiển thị"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', Number(e.target.value))}
                  helperText="Số nhỏ hơn sẽ hiển thị trước"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Trạng thái hoạt động"
                />
              </Grid>
              {selectedParentMenu && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Menu cha"
                    value={selectedParentMenu.title}
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText="Menu cha (chỉ đọc)"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {currentItem
                    ? 'URL sẽ được tự động tạo từ tiêu đề. Bạn có thể chỉnh sửa nếu cần.'
                    : selectedParentMenu
                      ? `Tạo submenu cho "${selectedParentMenu.title}". URL sẽ được tự động tạo từ tiêu đề.`
                      : 'Tạo menu chính mới. Để tạo submenu, hãy sử dụng nút "Tạo submenu" từ menu cha.'
                  }
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={currentItem ? handleUpdate : handleCreate}
            variant="contained"
            disabled={!formData.title}
          >
            {currentItem ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
        </Box>
      )}

      {activeTab === 1 && (
        <ArticleManagement />
      )}

      <NotificationSnackbar
        open={notification.open}
        onClose={handleNotificationClose}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
};

export default MenuManagement;
