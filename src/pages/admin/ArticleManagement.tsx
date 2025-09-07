import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getAllMenusAPI, getAllArticlesAPI, updateArticleAPI, deleteArticleAPI } from '../../services/api';
import { MenuItem as MenuItemType } from '../../types';

interface Article {
  id: string;
  title: string;
  content: string;
  menuId: string;
  order?: number;
  isActive?: boolean;
  file?: string;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

const ArticleManagement: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await getAllMenusAPI();
      if (response.data?.data) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tải danh sách menu',
        severity: 'error'
      });
    }
  };

  // Fetch articles for selected menu
  const fetchArticles = async (menuId: string) => {
    if (!menuId) return;

    try {
      setLoading(true);
      const response = await getAllArticlesAPI({
        page: 1,
        limit: 100,
        filters: { menuId }
      });
      const articlesList = response.data?.data?.result || [];

      // Sort by order, then by createdAt
      const sortedArticles = articlesList.sort((a: any, b: any) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      setArticles(sortedArticles as Article[]);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tải danh sách bài viết',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newArticles = Array.from(articles);
    const [reorderedItem] = newArticles.splice(result.source.index, 1);
    newArticles.splice(result.destination.index, 0, reorderedItem);

    // Update order for all articles
    const updatedArticles = newArticles.map((article, index) => ({
      ...article,
      order: index + 1
    }));

    setArticles(updatedArticles);

    // Update order in backend
    try {
      for (let i = 0; i < updatedArticles.length; i++) {
        await updateArticleAPI(updatedArticles[i].id, { order: i + 1 });
      }
      setNotification({
        open: true,
        message: 'Cập nhật thứ tự thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi cập nhật thứ tự',
        severity: 'error'
      });
      // Revert on error
      fetchArticles(selectedMenu);
    }
  };

  // Handle delete article
  const handleDelete = async () => {
    if (!articleToDelete) return;

    try {
      await deleteArticleAPI(articleToDelete.id);
      setNotification({
        open: true,
        message: 'Xóa bài viết thành công!',
        severity: 'success'
      });
      fetchArticles(selectedMenu);
    } catch (error) {
      console.error('Error deleting article:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi xóa bài viết',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (article: Article) => {
    try {
      await updateArticleAPI(article.id, { isActive: !article.isActive });
      setNotification({
        open: true,
        message: 'Cập nhật trạng thái thành công!',
        severity: 'success'
      });
      fetchArticles(selectedMenu);
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi cập nhật trạng thái',
        severity: 'error'
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Render menu options recursively to include submenus
  const renderMenuOptions = (items: MenuItemType[], level: number = 0): React.ReactNode[] => {
    const options: React.ReactNode[] = [];

    items.forEach(item => {
      // Add parent menu
      options.push(
        <MenuItem key={item.id} value={item.id} sx={{ pl: level * 2 }}>
          {level > 0 && '└─ '}
          {item.title}
        </MenuItem>
      );

      // Add children recursively
      if (item.children && item.children.length > 0) {
        options.push(...renderMenuOptions(item.children, level + 1));
      }
    });

    return options;
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      fetchArticles(selectedMenu);
    }
  }, [selectedMenu]);

  const selectedMenuTitle = menuItems.find(menu => menu.id === selectedMenu)?.title || '';

  return (
    <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Quản lý Bài viết
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/menu')}
            >
              Tạo Bài viết Mới
            </Button>
          </Box>

          {/* Menu Selector */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Chọn Menu</InputLabel>
              <Select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                label="Chọn Menu"
              >
                {renderMenuOptions(menuItems)}
              </Select>
            </FormControl>
          </Paper>

          {selectedMenu && (
            <>
              {/* Article List - Full Width */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Danh sách Bài viết - {selectedMenuTitle}
                  </Typography>
                  <Chip
                    label={`${articles.length} bài viết`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                  {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography>Đang tải...</Typography>
                    </Box>
                  ) : articles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        Chưa có bài viết nào cho menu này
                      </Typography>
                    </Box>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="articles">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {articles.map((article, index) => (
                              <Draggable key={article.id} draggableId={article.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{
                                      mb: 2,
                                      p: 2,
                                      opacity: snapshot.isDragging ? 0.8 : 1,
                                      transform: snapshot.isDragging ? 'rotate(5deg)' : 'none'
                                    }}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <div {...provided.dragHandleProps}>
                                          <DragIcon color="action" />
                                        </div>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="h6" gutterBottom>
                                            {article.title}
                                          </Typography>
                                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <Chip
                                              label={`Thứ tự: ${article.order}`}
                                              size="small"
                                              color="primary"
                                              variant="outlined"
                                            />
                                            <Chip
                                              label={article.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                              size="small"
                                              color={article.isActive ? 'success' : 'default'}
                                              variant={article.isActive ? 'filled' : 'outlined'}
                                            />
                                          </Box>
                                          <Typography variant="body2" color="text.secondary">
                                            Tạo: {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                    <CardActions>
                                      <Button
                                        size="small"
                                        startIcon={<ViewIcon />}
                                        onClick={() => {
                                          setSelectedArticle(article);
                                          setPreviewOpen(true);
                                        }}
                                      >
                                        Xem trước
                                      </Button>
                                      <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => navigate(`/admin/layout-builder/${article.id}?mode=edit`)}
                                      >
                                        Chỉnh sửa
                                      </Button>
                                      <Button
                                        size="small"
                                        color={article.isActive ? 'warning' : 'success'}
                                        onClick={() => handleToggleActive(article)}
                                      >
                                        {article.isActive ? 'Ẩn' : 'Hiện'}
                                      </Button>
                                      <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => {
                                          setArticleToDelete(article);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        Xóa
                                      </Button>
                                    </CardActions>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                )}
              </Paper>

              {/* Preview Panel - Below Article List */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Xem trước Trang
                </Typography>
                <Box sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                  minHeight: '400px',
                  maxHeight: '600px',
                  overflow: 'auto'
                }}>
                  {articles.length > 0 ? (
                    <div dangerouslySetInnerHTML={{
                      __html: articles.find(a => a.isActive)?.content || articles[0].content
                    }} />
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                      Chưa có bài viết nào
                    </Typography>
                  )}
                </Box>
              </Paper>
            </>
          )}

          {/* Preview Dialog */}
          <Dialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Xem trước: {selectedArticle?.title}
            </DialogTitle>
            <DialogContent>
              {selectedArticle && (
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewOpen(false)}>Đóng</Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogContent>
              <Typography>
                Bạn có chắc chắn muốn xóa bài viết "{articleToDelete?.title}"?
                Hành động này không thể hoàn tác.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Xóa
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleNotificationClose}
          >
            <Alert
              onClose={handleNotificationClose}
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
    </Box>
  );
};

export default ArticleManagement;
