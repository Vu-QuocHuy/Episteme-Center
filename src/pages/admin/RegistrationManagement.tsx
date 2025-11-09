import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Pagination,
  Divider,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Wc as GenderIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import {
  getAllRegistrationsAPI,
  getRegistrationByIdAPI,
  updateRegistrationAPI,
  deleteRegistrationAPI
} from '../../services/registrations';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import RegistrationFilters from '../../components/features/registration/RegistrationFilters';

interface RegistrationItem {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender?: 'male' | 'female';
  address?: string;
  note?: string;
  processed?: boolean;
  createdAt?: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
  };
}

const RegistrationManagement: React.FC = () => {
  const [rows, setRows] = useState<RegistrationItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter states
  const [nameFilter, setNameFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [processedFilter, setProcessedFilter] = useState<string>('');

  // Debounced filter states
  const [debouncedName, setDebouncedName] = useState<string>('');
  const [debouncedEmail, setDebouncedEmail] = useState<string>('');

  const [viewDialog, setViewDialog] = useState<{ open: boolean; data: RegistrationItem | null }>({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Debounce name filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(nameFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [nameFilter]);

  // Debounce email filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(emailFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [emailFilter]);

  const fetchData = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      // Build filters object - only add fields that have values
      const filterOptions: Record<string, any> = {};

      if (debouncedName && debouncedName.trim() !== '') {
        filterOptions.name = debouncedName.trim();
      }

      if (debouncedEmail && debouncedEmail.trim() !== '') {
        filterOptions.email = debouncedEmail.trim();
      }

      if (processedFilter && processedFilter !== '') {
        if (processedFilter === 'processed') {
          filterOptions.processed = true;
        } else if (processedFilter === 'pending') {
          filterOptions.processed = false;
        }
      }

      const params: any = {
        page: pageNum,
        limit: 10
      };

      // Only add filters if at least one filter is set
      if (Object.keys(filterOptions).length > 0) {
        params.filters = filterOptions;
        console.log('🔍 Applying filters:', filterOptions);
      } else {
        console.log('🔍 No filters applied - fetching all registrations');
      }

      console.log('🔍 Final API params:', params);
      const res = await getAllRegistrationsAPI(params);

      const responseData = res.data?.data || res.data;
      const list = responseData?.result || responseData || [];
      const meta = responseData?.meta;

      setRows(list);
      setPage(meta?.page || pageNum);
      setTotalPages(meta?.totalPages || 1);

      console.log('📊 Fetched registrations:', list.length, 'Total pages:', meta?.totalPages);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setNotification({ open: true, message: 'Lỗi khi tải dữ liệu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedName, debouncedEmail, processedFilter]);

  // Fetch data when filters or page change
  useEffect(() => {
    fetchData(page);
  }, [page, debouncedName, debouncedEmail, processedFilter, fetchData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedName, debouncedEmail, processedFilter]);

  const handleMarkAsProcessed = async (id: string) => {
    try {
      await updateRegistrationAPI(id, { processed: true });
      setNotification({ open: true, message: 'Đã đánh dấu hoàn thành xử lý', severity: 'success' });
      fetchData(page); // Reload current page
    } catch (error) {
      console.error('Error updating registration:', error);
      setNotification({ open: true, message: 'Cập nhật thất bại', severity: 'error' });
    }
  };

  const handleView = async (id: string) => {
    try {
      const res = await getRegistrationByIdAPI(id);
      const data = res.data?.data || res.data;
      setViewDialog({ open: true, data });
    } catch (error) {
      console.error('Error fetching registration details:', error);
      setNotification({ open: true, message: 'Không thể tải thông tin', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteRegistrationAPI(deleteDialog.id);
      setNotification({ open: true, message: 'Xóa thành công', severity: 'success' });
      setDeleteDialog({ open: false, id: null });
      fetchData(page); // Reload current page
    } catch (error) {
      console.error('Error deleting registration:', error);
      setNotification({ open: true, message: 'Xóa thất bại', severity: 'error' });
    }
  };

  const handlePageChange = (_event: any, value: number) => {
    setPage(value);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>Quản lý đăng ký tư vấn</Typography>
          </Box>

          {/* Filters */}
          <RegistrationFilters
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            emailFilter={emailFilter}
            setEmailFilter={setEmailFilter}
            processedFilter={processedFilter}
            setProcessedFilter={setProcessedFilter}
          />

          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell width={180}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography>Đang tải dữ liệu...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography>Không có dữ liệu</Typography>
                      </TableCell>
                    </TableRow>
                  ) : rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email || '-'}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>{r.class?.name || 'Tư vấn chung'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.processed ? 'Đã xử lý' : 'Chưa xử lý'} color={r.processed ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="info" onClick={() => handleView(r.id)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: r.id })}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!r.processed && (
                          <Tooltip title="Xác nhận xử lý">
                            <IconButton size="small" color="success" onClick={() => handleMarkAsProcessed(r.id)}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  size="large"
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* View Detail Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ViewIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>Chi tiết đăng ký tư vấn</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setViewDialog({ open: false, data: null })}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewDialog.data && (
            <Box>
              {/* Header Section with Avatar */}
              <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 3,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 3
              }}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: 32,
                  fontWeight: 700,
                  border: '4px solid rgba(255,255,255,0.3)'
                }}>
                  {viewDialog.data.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {viewDialog.data.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={viewDialog.data.processed ? 'Đã xử lý' : 'Chưa xử lý'}
                      sx={{
                        bgcolor: viewDialog.data.processed ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon sx={{ fontSize: 16 }} />
                      {viewDialog.data.createdAt ? new Date(viewDialog.data.createdAt).toLocaleString('vi-VN') : '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Content Sections */}
              <Box sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Thông tin cá nhân */}
                  <Paper elevation={2} sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(to right, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid #e3f2fd',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                      <PersonIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                        Thông tin cá nhân
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(103, 126, 234, 0.05)',
                          border: '1px solid rgba(103, 126, 234, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                            Họ và tên
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {viewDialog.data.name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(103, 126, 234, 0.05)',
                          border: '1px solid rgba(103, 126, 234, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <GenderIcon sx={{ fontSize: 16 }} />
                            Giới tính
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {viewDialog.data.gender === 'male' ? '👨 Nam' : viewDialog.data.gender === 'female' ? '👩 Nữ' : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Thông tin liên hệ */}
                  <Paper elevation={2} sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(to right, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid #e3f2fd',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                      <PhoneIcon sx={{ color: '#f50057', fontSize: 24 }} />
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#f50057' }}>
                        Thông tin liên hệ
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(245, 0, 87, 0.05)',
                          border: '1px solid rgba(245, 0, 87, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <EmailIcon sx={{ fontSize: 16 }} />
                            Email
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                            {viewDialog.data.email || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(245, 0, 87, 0.05)',
                          border: '1px solid rgba(245, 0, 87, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16 }} />
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            📞 {viewDialog.data.phone}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(245, 0, 87, 0.05)',
                          border: '1px solid rgba(245, 0, 87, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LocationIcon sx={{ fontSize: 16 }} />
                            Địa chỉ
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            📍 {viewDialog.data.address || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Thông tin đăng ký */}
                  <Paper elevation={2} sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(to right, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid #e3f2fd',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                      <SchoolIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#ff9800' }}>
                        Thông tin đăng ký
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(255, 152, 0, 0.05)',
                          border: '1px solid rgba(255, 152, 0, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <SchoolIcon sx={{ fontSize: 16 }} />
                            Lớp học
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            🎓 {viewDialog.data.class?.name || 'Tư vấn chung'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: viewDialog.data.processed
                            ? 'rgba(76, 175, 80, 0.1)'
                            : 'rgba(255, 152, 0, 0.1)',
                          border: viewDialog.data.processed
                            ? '2px solid rgba(76, 175, 80, 0.3)'
                            : '2px solid rgba(255, 152, 0, 0.3)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <CheckIcon sx={{ fontSize: 16 }} />
                            Trạng thái xử lý
                          </Typography>
                          <Chip
                            size="medium"
                            icon={viewDialog.data.processed ? <CheckIcon /> : undefined}
                            label={viewDialog.data.processed ? 'Đã xử lý' : 'Chưa xử lý'}
                            sx={{
                              bgcolor: viewDialog.data.processed ? '#4caf50' : '#ff9800',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              px: 1
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(33, 150, 243, 0.05)',
                          border: '1px solid rgba(33, 150, 243, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                            <NotesIcon sx={{ fontSize: 16 }} />
                            Ghi chú
                          </Typography>
                          <Paper elevation={0} sx={{
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: 1,
                            border: '1px dashed rgba(33, 150, 243, 0.2)',
                            minHeight: 60
                          }}>
                            <Typography variant="body1" sx={{
                              whiteSpace: 'pre-wrap',
                              fontStyle: viewDialog.data.note ? 'normal' : 'italic',
                              color: viewDialog.data.note ? 'text.primary' : 'text.secondary'
                            }}>
                              {viewDialog.data.note || 'Không có ghi chú'}
                            </Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: 3,
          py: 2.5,
          bgcolor: 'white',
          borderTop: '2px solid #e0e0e0',
          gap: 1.5,
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', gap: 1.5, flex: 1, justifyContent: 'flex-end' }}>
            {viewDialog.data && !viewDialog.data.processed && (
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckIcon />}
                onClick={() => {
                  handleMarkAsProcessed(viewDialog.data!.id);
                  setViewDialog({ open: false, data: null });
                }}
                sx={{
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                  }
                }}
              >
                ✓ Đánh dấu đã xử lý
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              onClick={() => setViewDialog({ open: false, data: null })}
              sx={{
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              Đóng
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>Xác nhận xóa</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa đăng ký này? Hành động này không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <NotificationSnackbar
        open={notification.open}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        message={notification.message}
        severity={notification.severity}
        title={notification.severity === 'success' ? 'Thành công' : 'Lỗi'}
        autoHideDuration={3000}
      />
    </DashboardLayout>
  );
};

export default RegistrationManagement;
