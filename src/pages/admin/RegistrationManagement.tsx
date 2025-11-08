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
  Pagination
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
                    <TableCell align="center" width={180}>Hành động</TableCell>
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
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="info" onClick={() => handleView(r.id)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!r.processed && (
                          <Tooltip title="Hoàn thành xử lý">
                            <IconButton size="small" color="success" onClick={() => handleMarkAsProcessed(r.id)}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: r.id })}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {viewDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Thông tin cá nhân */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Thông tin cá nhân
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {viewDialog.data.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <GenderIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Giới tính
                        </Typography>
                        <Typography variant="body1">
                          {viewDialog.data.gender === 'male' ? 'Nam' : viewDialog.data.gender === 'female' ? 'Nữ' : '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Thông tin liên hệ */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon /> Thông tin liên hệ
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <EmailIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {viewDialog.data.email || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">
                          {viewDialog.data.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <LocationIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1">
                          {viewDialog.data.address || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Thông tin đăng ký */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon /> Thông tin đăng ký
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <SchoolIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Lớp học
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {viewDialog.data.class?.name || 'Tư vấn chung'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Thời gian đăng ký
                        </Typography>
                        <Typography variant="body1">
                          {viewDialog.data.createdAt ? new Date(viewDialog.data.createdAt).toLocaleString('vi-VN') : '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <NotesIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Ghi chú
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {viewDialog.data.note || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <CheckIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Trạng thái xử lý
                        </Typography>
                        <Chip
                          size="medium"
                          label={viewDialog.data.processed ? 'Đã xử lý' : 'Chưa xử lý'}
                          color={viewDialog.data.processed ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          {viewDialog.data && !viewDialog.data.processed && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => {
                handleMarkAsProcessed(viewDialog.data!.id);
                setViewDialog({ open: false, data: null });
              }}
              sx={{ fontWeight: 600 }}
            >
              Đánh dấu đã xử lý
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => setViewDialog({ open: false, data: null })}
            sx={{ fontWeight: 600 }}
          >
            Đóng
          </Button>
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
