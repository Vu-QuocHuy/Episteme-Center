import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  ListItemIcon,
  ListItemText,
  Avatar,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Class } from '../../../types';
import { getClassByIdAPI } from '../../../services/api';

interface ClassTableProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (classId: string) => void;
  onViewDetails: (classItem: Class) => void;
  onViewStudents: (classItem: Class) => void;
  onViewSchedule: (classItem: Class) => void;
  loading?: boolean;
}

interface ClassDetailsModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

interface ClassStudentsModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

interface ClassScheduleModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  onEdit,
  onDelete,
  onViewStudents,
  onViewSchedule,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const openDetailsWithData = (data: any) => {
    // Normalize response structure: prefer data.data if exists
    const classData = data?.data?.data ?? data?.data ?? data;
    setSelectedClass(classData as Class);
    setDetailsModalOpen(true);
  };

  const fetchAndOpenDetails = async (classItem: Class) => {
    try {
      const res = await getClassByIdAPI(classItem.id);
      openDetailsWithData(res);
    } catch (e) {
      // Fallback: show existing item if fetch fails
      setSelectedClass(classItem);
      setDetailsModalOpen(true);
    }
  };

  const handleViewDetails = () => {
    if (selectedClass) {
      fetchAndOpenDetails(selectedClass);
    }
    handleMenuClose();
  };

  const handleViewStudents = () => {
    if (selectedClass) {
      onViewStudents(selectedClass);
      setStudentsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleViewSchedule = () => {
    if (selectedClass) {
      onViewSchedule(selectedClass);
      setScheduleModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedClass) {
      onEdit(selectedClass);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedClass) {
      setClassToDelete(selectedClass);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (classToDelete) {
      try {
        await onDelete(classToDelete.id);
        setSnackbar({
          open: true,
          message: 'Xóa lớp học thành công',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa lớp học',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'active': 'success',
      'inactive': 'error',
      'pending': 'warning',
      'completed': 'secondary',
      'closed': 'error',
      'cancelled': 'error'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Đang hoạt động',
      'inactive': 'Không hoạt động',
      'pending': 'Chờ khai giảng',
      'completed': 'Đã kết thúc',
      'closed': 'Đã đóng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getDaysOfWeekText = (days: string[]): string => {
    const dayNames: { [key: string]: string } = {
      '0': 'CN',
      '1': 'T2',
      '2': 'T3',
      '3': 'T4',
      '4': 'T5',
      '5': 'T6',
      '6': 'T7'
    };
    return days.map(day => dayNames[day] || day).join(', ');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Typography color="text.secondary" variant="h6">
          {loading ? 'Đang tải...' : 'Không có lớp học nào'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Tên lớp</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giáo viên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Năm học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Học phí mỗi buổi</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lịch học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Phòng học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id} hover>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {classItem.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {classItem.teacher?.email || classItem.teacher?.userId?.email || ''}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {classItem.year}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {classItem.feePerLesson?.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {classItem.schedule?.days_of_week?.length > 0
                        ? getDaysOfWeekText(classItem.schedule.days_of_week)
                        : 'Chưa có lịch'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {classItem.schedule?.time_slots
                        ? `${classItem.schedule.time_slots.start_time} - ${classItem.schedule.time_slots.end_time}`
                        : 'Chưa có thời gian'
                      }
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {classItem.room}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(classItem.status) === 'error' ? '#d32f2f' : '#1976d2',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: getStatusColor(classItem.status) === 'error' ? '#c62828' : '#1565c0'
                      }
                    }}
                  >
                    {getStatusText(classItem.status)}
                  </Button>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => fetchAndOpenDetails(classItem)}
                      sx={{ color: 'grey.600' }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(classItem)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewStudents}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem học sinh</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewSchedule}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem lịch học</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Class Details Modal */}
      <ClassDetailsModal
        classItem={selectedClass}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Class Students Modal */}
      <ClassStudentsModal
        classItem={selectedClass}
        open={studentsModalOpen}
        onClose={() => setStudentsModalOpen(false)}
      />

      {/* Class Schedule Modal */}
      <ClassScheduleModal
        classItem={selectedClass}
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa lớp học "{classToDelete?.name}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Class Details Modal Component
const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (num?: number) => {
    return (num ?? 0).toLocaleString('vi-VN') + ' VND';
  };

  const getStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Đang hoạt động',
      'inactive': 'Không hoạt động',
      'pending': 'Chờ khai giảng',
      'completed': 'Đã kết thúc',
      'closed': 'Đã đóng',
      'cancelled': 'Đã hủy',
    };
    return status ? (statusMap[status] || status) : 'Không xác định';
  };

  const getDayLabel = (d: string) => {
    const map: Record<string, string> = { '0': 'CN', '1': 'T2', '2': 'T3', '3': 'T4', '4': 'T5', '5': 'T6', '6': 'T7' };
    return map[d] || d;
  };

  const daysText = (classItem.schedule?.days_of_week || []).map(getDayLabel).join(', ');
  const timeRange = classItem.schedule?.time_slots
    ? `${classItem.schedule?.time_slots.start_time} - ${classItem.schedule?.time_slots.end_time}`
    : 'Chưa có thời gian';
  const studentCount = classItem.students?.length ?? 0;
  const maxStudents = classItem.max_student ?? classItem.maxStudents ?? 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        px: 3,
        py: 2.5,
        borderBottom: 'none'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={700}>Chi tiết lớp học</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Thông tin chi tiết về lớp học và học sinh</Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)' }}>
            <ViewIcon htmlColor="#fff" />
          </Avatar>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: 'transparent', pt: 3 }}>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
          {/* Thông tin cơ bản */}
          <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thông tin cơ bản</Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tên lớp</Typography>
                  <Typography variant="body1" fontWeight={600}>{classItem.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Giáo viên phụ trách</Typography>
                  <Typography variant="body1">
                    {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}{classItem.teacher?.email || classItem.teacher?.userId?.email ? ` (${classItem.teacher?.email || classItem.teacher?.userId?.email})` : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Năm học</Typography>
                  <Typography variant="body1">{classItem.year || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Khối</Typography>
                  <Typography variant="body1">{classItem.grade ? `Khối ${classItem.grade}` : '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Phòng học</Typography>
                  <Typography variant="body1">{classItem.room || '-'}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Thống kê lớp học */}
          <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thống kê lớp học</Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Số lượng học sinh</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">{studentCount}/{maxStudents || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Tối đa {maxStudents || 0} học sinh</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Học phí mỗi buổi</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#6a1b9a' }}>{formatCurrency(classItem.feePerLesson)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Thời gian học</Typography>
                  <Typography variant="body1">{daysText || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">{timeRange}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Trạng thái lớp học */}
        <Box sx={{ mt: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: classItem.status === 'closed' ? 'error.main' : 'primary.main', backgroundColor: '#fff' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Trạng thái lớp học</Typography>
            <Chip label={getStatusText(classItem.status)} color={classItem.status === 'closed' ? 'error' : 'success'} sx={{ fontWeight: 700 }} />
          </Paper>
        </Box>

        {/* Lịch học chi tiết */}
        <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Lịch học chi tiết</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#fb8c00' }}>
                <Typography variant="subtitle2" color="text.secondary">Ngày bắt đầu</Typography>
                <Typography variant="h6" sx={{ color: '#fb8c00', fontWeight: 800 }}>{formatDate(classItem.schedule?.start_date)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#43a047' }}>
                <Typography variant="subtitle2" color="text.secondary">Ngày kết thúc</Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 800 }}>{formatDate(classItem.schedule?.end_date)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#64b5f6' }}>
                <Typography variant="subtitle2" color="text.secondary">Thời gian</Typography>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 800 }}>{timeRange}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#ce93d8' }}>
                <Typography variant="subtitle2" color="text.secondary">Ngày trong tuần</Typography>
                <Typography variant="h6" sx={{ color: '#7b1fa2', fontWeight: 800 }}>{daysText || '-'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Mô tả */}
        <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Mô tả lớp học</Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{classItem.description || 'Không có mô tả'}</Typography>
          </Paper>
        </Box>

        {/* Danh sách học sinh */}
        <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Danh sách học sinh ({studentCount})</Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              {(classItem.students || []).map((s: any, idx: number) => (
                <Grid item xs={12} sm={6} md={4} key={s.student?.id || s.id || idx}>
                  <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f3f4f6' }} variant="outlined">
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {idx + 1}. {s.student?.name || s?.name || s?.userId?.name || 'Không tên'}
                    </Typography>
                    {s.discountPercent && (
                      <Typography variant="caption" color="text.secondary">
                        Giảm giá: {s.discountPercent}%
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
              {studentCount === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Chưa có học sinh</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Class Students Modal Component
const ClassStudentsModal: React.FC<ClassStudentsModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <GroupIcon />
          <Typography variant="h6">Học sinh lớp {classItem.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="body1" color="text.secondary">
            Danh sách học sinh trong lớp này sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Class Schedule Modal Component
const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <ScheduleIcon />
          <Typography variant="h6">Lịch học lớp {classItem.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="body1" color="text.secondary">
            Lịch học chi tiết của lớp này sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassTable;
