import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Pagination,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import {
  getAdvertisementsAPI,
  createAdvertisementAPI,
  updateAdvertisementAPI,
  deleteAdvertisementAPI,
  getAdvertisementByIdAPI,
} from '../../services/advertisements';
import { uploadFileAPI, deleteFileAPI } from '../../services/files';
import { getAllClassesAPI } from '../../services/classes';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
// Optional: add your own validations if needed

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'banner' | 'popup' | 'notification';
  priority: number;
  publicId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  class?: {
    id: string;
    name: string;
    grade: number;
    section: number;
    year: number;
    status: string;
  } | null;
}

interface FormData {
  title: string;
  description: string;
  image: File | null;
  type: 'banner' | 'popup' | 'notification';
  priority: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface FormErrors {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
}

const AdvertisementManagement: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image: null,
    type: 'banner',
    priority: 1
  });
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | undefined>(undefined);
  const [originalPublicId, setOriginalPublicId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string>('');
  // isActive is driven by backend; not required in form
  const [classSearch, setClassSearch] = useState<string>('');
  const [classOptions, setClassOptions] = useState<Array<{ id: string; name: string; grade?: number; section?: number; year?: number }>>([]);
  const [classLoading, setClassLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Lấy danh sách quảng cáo từ API
  useEffect(() => {
    fetchAdvertisements();
  }, [page]);

  const fetchAdvertisements = async (): Promise<void> => {
    try {
      const res = await getAdvertisementsAPI({ page, limit });
      const list = res.data?.data?.result || [];
      setAdvertisements(
        list.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          type: (item.type as 'banner' | 'popup' | 'notification') || 'banner',
          priority: Number(item.priority) ?? 0,
          publicId: item.publicId || (item as any).public_id || (item as any).imagePublicId || (item as any).image_public_id,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          class: item.class ? {
            id: item.class.id,
            name: item.class.name,
            grade: item.class.grade,
            section: item.class.section,
            year: item.class.year,
            status: item.class.status,
          } : null,
        }))
      );
      setTotalPages(res.data?.data?.meta?.totalPages || 1);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách quảng cáo',
        severity: 'error'
      });
      setAdvertisements([]);
    }
  };

  const handleOpenDialog = (ad: Advertisement | null = null): void => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        image: null,
        type: ad.type || 'banner',
        priority: ad.priority || 1
      });
      setUploadedImageUrl(ad.imageUrl);
      setUploadedPublicId(undefined);
      setOriginalPublicId(ad.publicId);
      setImageUploading(false);
      setClassId(ad.class?.id || '');
      setClassSearch(ad.class?.name || '');
      (async () => {
        try {
          const detail = await getAdvertisementByIdAPI(ad.id);
          const data = (detail as any)?.data?.data;
          if (data) {
            setOriginalPublicId(
              data.publicId || (data as any).public_id || (data as any).imagePublicId || (data as any).image_public_id
            );
          }
        } catch (_e) {}
      })();
    } else {
      setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        image: null,
        type: 'banner',
        priority: 1
      });
      setUploadedImageUrl(undefined);
      setUploadedPublicId(undefined);
      setOriginalPublicId(undefined);
      setImageUploading(false);
      setClassId('');
      setClassSearch('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingAd(null);
  };

  // Fetch class options with debounce only when dialog open and user types a query
  useEffect(() => {
    let active = true;
    const query = classSearch?.trim();
    if (!openDialog || !query) {
      // Do not call API on page load or when no search query
      return;
    }
    const handler = setTimeout(async () => {
      try {
        setClassLoading(true);
        const res = await getAllClassesAPI({ page: 1, limit: 10, name: query });
        const list = res.data?.data?.result || res.data?.data || res.data || [];
        const options = (list || []).map((c: any) => ({ id: c.id, name: c.name, grade: c.grade, section: c.section, year: c.year }));
        if (active) setClassOptions(options);
      } catch (_err) {
        if (active) setClassOptions([]);
      } finally {
        if (active) setClassLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(handler); };
  }, [classSearch, openDialog]);

  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
    if (file) {
      try {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(file);
        setUploadedImageUrl(uploadRes.data.data.url);
        setUploadedPublicId(uploadRes.data.data.public_id);
      } catch (_err) {
        setSnackbar({ open: true, message: 'Tải ảnh thất bại, vui lòng thử lại', severity: 'error' });
        setUploadedImageUrl(undefined);
        setUploadedPublicId(undefined);
      } finally {
        setImageUploading(false);
      }
    } else {
      setUploadedImageUrl(undefined);
      setUploadedPublicId(undefined);
    }
  };

  const handleSaveAd = async (): Promise<void> => {
    // Validate tối giản
    const errors: FormErrors = {};
    if (!formData.title) errors.title = 'Tiêu đề là bắt buộc';
    if (!formData.description) errors.description = 'Mô tả là bắt buộc';
    if (!formData.priority || formData.priority < 0) errors.priority = 'Độ ưu tiên không hợp lệ';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      // Nếu đã upload khi chọn ảnh thì dùng luôn; nếu chưa, và có file mới, upload tại đây
      let imageUrl: string | undefined = uploadedImageUrl ?? editingAd?.imageUrl;
      let publicId: string | undefined = uploadedPublicId;
      if (!uploadedImageUrl && formData.image) {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(formData.image);
        imageUrl = uploadRes.data.data.url;
        publicId = uploadRes.data.data.public_id;
        setImageUploading(false);
      }

      if (editingAd) {
        const previousPublicId = originalPublicId;
        await updateAdvertisementAPI(editingAd.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          imageUrl,
          publicId,
          type: formData.type,
          classId: classId || undefined,
        });
        // If a new image was uploaded in this session, delete old file when it changes
        if (previousPublicId && uploadedPublicId && uploadedPublicId !== previousPublicId) {
          try {
            await deleteFileAPI(previousPublicId);
            console.log('Old file deleted successfully:', previousPublicId);
          } catch (fileError) {
            console.error('Error deleting old file:', fileError);
            // Don't show error to user if file deletion fails
          }
        }
        setSnackbar({ open: true, message: 'Cập nhật quảng cáo thành công!', severity: 'success' });
      } else {
        await createAdvertisementAPI({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          imageUrl: imageUrl || '',
          publicId: publicId || '',
          classId: classId || '',
          type: formData.type,
        });
        setSnackbar({ open: true, message: 'Tạo quảng cáo thành công!', severity: 'success' });
      }
      fetchAdvertisements();
      handleCloseDialog();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi khi lưu quảng cáo!',
        severity: 'error'
      });
    }
  };

  const handleDeleteAd = async (id: string): Promise<void> => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quảng cáo này?')) {
      try {
        // Find the advertisement to get its publicId
        const advertisement = advertisements.find(ad => ad.id === id);

        // Delete the advertisement first
        await deleteAdvertisementAPI(id);

        // If advertisement has publicId, delete the file
        if (advertisement?.publicId) {
          try {
            await deleteFileAPI(advertisement.publicId);
            console.log('File deleted successfully:', advertisement.publicId);
          } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Don't show error to user if file deletion fails, as advertisement is already deleted
          }
        }

        setSnackbar({ open: true, message: 'Xóa quảng cáo thành công!', severity: 'success' });
        fetchAdvertisements();
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || 'Có lỗi khi xóa quảng cáo!',
          severity: 'error'
        });
      }
    }
  };

  const getDisplayTypeLabel = (displayType: string): string => {
    switch (displayType) {
      case 'banner': return 'Banner';
      case 'popup': return 'Popup';
      case 'notification': return 'Notification';
      default: return 'Banner';
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Quản lý Quảng cáo
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Tạo quảng cáo mới
            </Button>
          </Box>

          {/* Advertisements Table */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hình ảnh</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Kiểu hiển thị</TableCell>
                      <TableCell>Độ ưu tiên</TableCell>
                      <TableCell>Lớp</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {advertisements.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <Avatar
                            src={ad.imageUrl}
                            alt={ad.title}
                            variant="rounded"
                            sx={{ width: 60, height: 40 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {ad.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {ad.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getDisplayTypeLabel(ad.type)}
                        </TableCell>
                        <TableCell>
                          {ad.priority}
                        </TableCell>
                        <TableCell>
                          {ad.class ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{ad.class.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Lớp: {ad.class.grade}.{ad.class.section} • Năm: {ad.class.year}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              px: 1.25,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              color: ad.isActive ? '#2e7d32' : '#c62828',
                              border: `1px solid ${ad.isActive ? '#2e7d32' : '#c62828'}`,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {ad.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(ad)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAd(ad.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
              </Box>
            </CardContent>
          </Card>

          {/* Create/Edit Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 3,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {editingAd ? 'Chỉnh sửa quảng cáo' : 'Tạo quảng cáo mới'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingAd ? 'Cập nhật thông tin quảng cáo' : 'Tạo quảng cáo mới cho hệ thống'}
                </Typography>
              </Box>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {editingAd ? (
                  <EditIcon sx={{ fontSize: 28, color: 'white' }} />
                ) : (
                  <AddIcon sx={{ fontSize: 28, color: 'white' }} />
                )}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 4 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed'
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Thông tin quảng cáo
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Tiêu đề *"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.title}
                          helperText={formErrors.title}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mô tả *"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.description}
                          helperText={formErrors.description}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Kiểu hiển thị"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'banner' | 'popup' | 'notification' })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.type}
                          helperText={formErrors.type}
                        >
                          <MenuItem value="banner">Banner</MenuItem>
                          <MenuItem value="popup">Popup</MenuItem>
                          <MenuItem value="notification">Notification</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Độ ưu tiên *"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                          inputProps={{ min: 1 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.priority}
                          helperText={formErrors.priority}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          loading={classLoading}
                          options={classOptions}
                          getOptionLabel={(o) => o?.name || ''}
                          value={classOptions.find((c) => c.id === classId) || null}
                          onChange={(_, val) => setClassId(val?.id || '')}
                          inputValue={classSearch}
                          onInputChange={(_, val) => setClassSearch(val)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Chọn lớp"
                              placeholder="Tìm kiếm lớp theo tên"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {classLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      {/* Trạng thái hoạt động do backend quản lý, không cần trong form tạo/sửa */}
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            border: '2px dashed #667eea',
                            borderRadius: 0,
                            minHeight: 300,
                            minWidth: '100%',
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
                                maxWidth: '736px',
                                maxHeight: '552px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                borderRadius: 0
                              }}
                            />
                          ) : editingAd && editingAd.imageUrl ? (
                            <img
                              src={editingAd.imageUrl}
                              alt="current"
                              style={{
                                maxWidth: '736px',
                                maxHeight: '552px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                borderRadius: 0
                              }}
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center', color: '#667eea' }}>
                              <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                              <Typography variant="body2" color="inherit" sx={{ fontWeight: 600 }}>
                                Tải ảnh quảng cáo
                              </Typography>
                              <Typography variant="caption" color="inherit">
                                (PNG, JPG, JPEG, WEBP)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  border: '2px solid #667eea',
                  color: '#667eea',
                  '&:hover': {
                    background: '#667eea',
                    color: 'white',
                  }
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveAd}
                variant="contained"
                disabled={!formData.title || !formData.description || imageUploading}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a6fd8' },
                  '&:disabled': {
                    background: '#ccc',
                  }
                }}
              >
                {editingAd ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogActions>
          </Dialog>

          <NotificationSnackbar
            open={snackbar.open}
            onClose={handleCloseNotification}
            message={snackbar.message}
            severity={snackbar.severity}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdvertisementManagement;
