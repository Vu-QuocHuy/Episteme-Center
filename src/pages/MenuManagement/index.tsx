import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Grid,
  MenuItem as MuiMenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  SubdirectoryArrowRight as SubMenuIcon,
} from '@mui/icons-material';
import {
  createMenuAPI,
  getAllMenusAPI,
  updateMenuAPI,
  deleteMenuAPI,
  toggleMenuVisibilityAPI,
  MenuData,
} from '../../services/api';
import { MenuItem } from '../../types';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MenuData>({
    title: '',
    slug: '',
    parentId: undefined,
    order: 1,
    isActive: true,
  });
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
  const handleToggleVisibility = async (id: string, isActive: boolean) => {
    try {
      await toggleMenuVisibilityAPI(id, !isActive);
      setNotification({
        open: true,
        message: 'Cập nhật trạng thái thành công',
        severity: 'success',
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling menu visibility:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi cập nhật trạng thái',
        severity: 'error',
      });
    }
  };

  // Open dialog for create/edit
  const handleOpenDialog = (item?: MenuItem, parent?: string) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        title: item.title,
        slug: item.slug,
        parentId: item.parentId,
        order: item.order,
        isActive: item.isActive,
      });
    } else {
      setCurrentItem(null);
      setFormData({
        title: '',
        slug: '',
        parentId: parent || undefined,
        order: 1,
        isActive: true,
      });
    }
    setParentId(parent || null);
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentItem(null);
    setParentId(null);
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

  // Get available parent options
  const getParentOptions = () => {
    return menuItems.filter(item => item.id !== currentItem?.id);
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
              <Chip
                label={item.isActive ? 'Hiện' : 'Ẩn'}
                color={item.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(null, item.id);
                }}
                title="Tạo submenu"
              >
                <AddIcon />
              </IconButton>
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
              <Switch
                checked={item.isActive}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(item.id, item.isActive);
                }}
                size="small"
              />
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
            <Typography variant="body2" color="text.secondary">
              <strong>Slug:</strong> {item.slug}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Thứ tự:</strong> {item.order}
            </Typography>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý Menu
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Menu
        </Button>
      </Box>



      <Card>
        <CardContent>
          {menuItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Chưa có menu nào. Hãy tạo menu đầu tiên!
              </Typography>
            </Box>
          ) : (
            renderMenuItems(menuItems)
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem ? 'Sửa Menu' : parentId ? 'Tạo Submenu' : 'Thêm Menu'}
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
                  required
                  helperText="URL-friendly version của tiêu đề"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Menu cha</InputLabel>
                  <Select
                    value={formData.parentId || ''}
                    onChange={(e) => handleInputChange('parentId', e.target.value || undefined)}
                    label="Menu cha"
                  >
                    <MuiMenuItem value="">
                      <em>Không có (Menu chính)</em>
                    </MuiMenuItem>
                    {getParentOptions().map((item) => (
                      <MuiMenuItem key={item.id} value={item.id}>
                        {item.title}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thứ tự"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Hiển thị"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={currentItem ? handleUpdate : handleCreate}
            variant="contained"
            disabled={!formData.title || !formData.slug}
          >
            {currentItem ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        onClose={handleNotificationClose}
        message={notification.message}
        severity={notification.severity}
      />
    </Container>
  );
};

export default MenuManagement;
