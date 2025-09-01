import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import NotificationSnackbar from '../../../components/common/NotificationSnackbar';
import { commonStyles } from '../../../utils/styles';
import FeedbackHome from '../../../components/features/homepage/FeedbackHome';
import {
  createFeedbackAPI,
  getFeedbacksAPI,
  updateFeedbackAPI,
  deleteFeedbackAPI,
  uploadFileAPI,
  deleteFileAPI
} from '../../../services/api';
import { Feedback, CreateFeedbackRequest } from '../../../types';

const TestimonialsManagement: React.FC = () => {

  // State
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState<CreateFeedbackRequest & { image?: File }>({
    name: '',
    description: '',
    imageUrl: '',
    publicId: '',
    socialUrl: ''
  });

  // Image upload state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedPublicId, setUploadedPublicId] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [originalPublicId, setOriginalPublicId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch feedbacks
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await getFeedbacksAPI({ page: 1, limit: 100 });
      if (response.data?.data?.result) {
        setFeedbacks(response.data.data.result);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setNotification({
        open: true,
        message: 'Không thể tải danh sách đánh giá',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feedback?: Feedback) => {
    if (feedback) {
      setEditingFeedback(feedback);
      setFormData({
        name: feedback.name,
        description: feedback.description,
        imageUrl: feedback.imageUrl || '',
        publicId: feedback.publicId || '',
        socialUrl: feedback.socialUrl || ''
      });
      setUploadedImageUrl(feedback.imageUrl || '');
      setUploadedPublicId(feedback.publicId || '');
      setOriginalPublicId(feedback.publicId || '');
    } else {
      setEditingFeedback(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        publicId: '',
        socialUrl: ''
      });
      setUploadedImageUrl('');
      setUploadedPublicId('');
      setOriginalPublicId('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFeedback(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      publicId: '',
      socialUrl: ''
    });
    setUploadedImageUrl('');
    setUploadedPublicId('');
    setOriginalPublicId('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      setNotification({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error'
      });
      return;
    }

    try {
            // Nếu đã upload khi chọn ảnh thì dùng luôn; nếu chưa, và có file mới, upload tại đây
      let imageUrl: string | undefined = uploadedImageUrl || editingFeedback?.imageUrl;
      let publicId: string | undefined = uploadedPublicId || editingFeedback?.publicId;

      if (!uploadedImageUrl && formData.image) {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(formData.image);
        imageUrl = uploadRes.data.data.url;
        publicId = uploadRes.data.data.public_id;
        setImageUploading(false);
      }

      // Đảm bảo nếu có imageUrl thì phải có publicId
      if (imageUrl && !publicId) {
        setNotification({
          open: true,
          message: 'Lỗi: Thiếu publicId cho ảnh',
          severity: 'error'
        });
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        imageUrl: imageUrl || undefined,
        publicId: publicId || undefined,
        socialUrl: formData.socialUrl || undefined
      };

      // Debug log để kiểm tra payload
      console.log('Submit Data:', submitData);

      if (editingFeedback) {
        // Update existing feedback
        await updateFeedbackAPI(editingFeedback.id, submitData);

        // If a new image was uploaded in this session, delete old file when it changes
        if (
          (uploadedPublicId && originalPublicId && uploadedPublicId !== originalPublicId) ||
          (uploadedImageUrl && editingFeedback.imageUrl && uploadedImageUrl !== editingFeedback.imageUrl && originalPublicId)
        ) {
          try {
            await deleteFileAPI(originalPublicId);
          } catch (_e) {
            // swallow error - not critical for UX
          }
        }

        setNotification({
          open: true,
          message: 'Cập nhật đánh giá thành công!',
          severity: 'success'
        });
      } else {
        // Create new feedback
        await createFeedbackAPI(submitData);
        setNotification({
          open: true,
          message: 'Thêm đánh giá thành công!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchFeedbacks();
    } catch (error) {
      console.error('Error saving feedback:', error);
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi lưu đánh giá',
        severity: 'error'
      });
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        // Find the feedback to get its publicId before deleting
        const feedbackToDelete = feedbacks.find(f => f.id === id);

        // Delete the feedback first
        await deleteFeedbackAPI(id);

        // If feedback had an image, delete the file
        if (feedbackToDelete?.publicId) {
          try {
            await deleteFileAPI(feedbackToDelete.publicId);
          } catch (_e) {
            // swallow error - not critical for UX
          }
        }

        setNotification({
          open: true,
          message: 'Xóa đánh giá thành công!',
          severity: 'success'
        });
        fetchFeedbacks();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        setNotification({
          open: true,
          message: 'Có lỗi xảy ra khi xóa đánh giá',
          severity: 'error'
        });
      }
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Image upload handler (like AdvertisementManagement)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] || undefined;
    setFormData({ ...formData, image: file });
    if (file) {
      try {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(file);
        console.log('Upload Response:', uploadRes.data);
        setUploadedImageUrl(uploadRes.data.data.url);
        setUploadedPublicId(uploadRes.data.data.public_id);
      } catch (_err) {
        setNotification({
          open: true,
          message: 'Tải ảnh thất bại, vui lòng thử lại',
          severity: 'error'
        });
        setUploadedImageUrl('');
        setUploadedPublicId('');
      } finally {
        setImageUploading(false);
      }
    } else {
      setUploadedImageUrl('');
      setUploadedPublicId('');
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý Đánh giá học viên
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Quản lý feedback và đánh giá từ học viên
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="feedback management tabs">
              <Tab label="Quản lý đánh giá" />
              <Tab label="Xem trước giao diện" />
            </Tabs>
          </Box>

          {/* Add Feedback Button - only show in management tab */}
          {activeTab === 0 && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mb: 2 }}
              >
                Thêm đánh giá mới
              </Button>
            </Box>
          )}

          {/* Tab Content */}
          {activeTab === 0 && (
            <>
              {/* Feedbacks List */}
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography>Đang tải danh sách đánh giá...</Typography>
                </Box>
              ) : (
                <Card>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Nội dung</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feedbacks.map((feedback) => (
                          <TableRow key={feedback.id} hover>
                            <TableCell>
                              <Avatar
                                src={feedback.imageUrl}
                                sx={{ width: 50, height: 50 }}
                              >
                                {feedback.name?.charAt(0)?.toUpperCase()}
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {feedback.name}
                              </Typography>
                              {feedback.socialUrl && (
                                <Chip
                                  label="Có link mạng xã hội"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  maxWidth: 300,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {feedback.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {feedback.createdAt
                                  ? new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'N/A'
                                }
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  onClick={() => handleOpenDialog(feedback)}
                                  color="primary"
                                  size="small"
                                  title="Chỉnh sửa"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDeleteFeedback(feedback.id)}
                                  color="error"
                                  size="small"
                                  title="Xóa"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}

              {/* Empty State */}
              {!loading && feedbacks.length === 0 && (
                <Card>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <StarIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Chưa có đánh giá nào
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Hãy thêm đánh giá đầu tiên từ học viên
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenDialog()}
                      startIcon={<AddIcon />}
                    >
                      Thêm đánh giá đầu tiên
                    </Button>
                  </Box>
                </Card>
              )}
            </>
          )}

          {/* Preview Tab */}
          {activeTab === 1 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Xem trước giao diện feedback trên trang chủ
              </Typography>
              <Box sx={{
                width: '100%',
                maxWidth: '1200px',
                mx: 'auto',
                overflow: 'hidden'
              }}>
                <FeedbackHome />
              </Box>
            </Box>
          )}

          {/* Dialog for adding/editing feedback */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingFeedback ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên học viên *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nội dung đánh giá *"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: '2px dashed #667eea',
                      borderRadius: 2,
                      minHeight: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f2fd 100%)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#764ba2',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 100%)'
                      }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/webp"
                      hidden
                      onChange={handleFileChange}
                    />
                    {formData.image ? (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '360px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: 8
                        }}
                      />
                    ) : editingFeedback && editingFeedback.imageUrl ? (
                      <img
                        src={editingFeedback.imageUrl}
                        alt="current"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '360px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: 8
                        }}
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center', color: '#667eea' }}>
                        <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" color="inherit" sx={{ fontWeight: 600 }}>
                          Tải ảnh đại diện
                        </Typography>
                        <Typography variant="caption" color="inherit">
                          (PNG, JPG, JPEG, WEBP)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Link mạng xã hội"
                    value={formData.socialUrl}
                    onChange={(e) => setFormData({ ...formData, socialUrl: e.target.value })}
                    margin="normal"
                    placeholder="https://facebook.com/username"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!formData.name || !formData.description || imageUploading}
              >
                {editingFeedback ? 'Cập nhật' : 'Thêm'}
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

export default TestimonialsManagement;
