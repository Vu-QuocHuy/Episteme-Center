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
  Avatar,
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Class } from '../../../types';

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
  onViewDetails,
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, classItem: Class) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(classItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const handleViewDetails = () => {
    if (selectedClass) {
      onViewDetails(selectedClass);
      setDetailsModalOpen(true);
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

  const getStudentCount = (classItem: Class) => {
    return classItem.students?.length || 0;
  };

  const getCapacityPercentage = (classItem: Class) => {
    const current = getStudentCount(classItem);
    const max = classItem.max_student || classItem.maxStudents || 0;
    return max > 0 ? (current / max) * 100 : 0;
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

  // Debug classes data
  console.log('🎓 ClassTable render - classes:', classes, 'loading:', loading);

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
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lớp học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giáo viên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thông tin học tập</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Học sinh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lịch học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {classItem.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lớp {classItem.grade}.{classItem.section} - {classItem.year}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Phòng: {classItem.room}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={classItem.teacher?.avatar || classItem.teacher?.userId?.avatar}
                      alt={classItem.teacher?.name || classItem.teacher?.userId?.name}
                      sx={{ width: 32, height: 32 }}
                    >
                      {(classItem.teacher?.name || classItem.teacher?.userId?.name || 'C')?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {classItem.feePerLesson?.toLocaleString('vi-VN')}₫/buổi
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                      {classItem.description || 'Không có mô tả'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {getStudentCount(classItem)}/{classItem.max_student || classItem.maxStudents || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getCapacityPercentage(classItem)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
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
                    <Typography variant="caption" display="block" color="text.secondary">
                      {classItem.schedule?.start_date && classItem.schedule?.end_date
                        ? `${new Date(classItem.schedule.start_date).toLocaleDateString('vi-VN')} - ${new Date(classItem.schedule.end_date).toLocaleDateString('vi-VN')}`
                        : ''
                      }
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(classItem.status)}
                    color={getStatusColor(classItem.status) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Thao tác">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, classItem)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
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
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewStudents}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Đang hoạt động',
      'inactive': 'Không hoạt động',
      'pending': 'Chờ khai giảng',
      'completed': 'Đã kết thúc'
    };
    return statusMap[status] || status;
  };

  const getLevelColor = (level: string) => {
    const levelColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'Beginner': 'success',
      'Intermediate': 'warning',
      'Advanced': 'error',
      'Elementary': 'primary',
      'Pre-Intermediate': 'secondary'
    };
    return levelColors[level] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <SchoolIcon />
          </Avatar>
          <Typography variant="h6">Chi tiết lớp học</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} mt={2}>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin cơ bản</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tên lớp</Typography>
                <Typography variant="body1">{classItem.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
                <Typography variant="body1">{classItem.description || 'Không có mô tả'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trình độ</Typography>
                <Chip label={classItem.level || 'Không xác định'} color={getLevelColor(classItem.level || '') as any} size="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={getStatusText(classItem.status)}
                  color={classItem.status === 'active' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin chi tiết</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Giáo viên</Typography>
                <Typography variant="body1">
                  {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Số học sinh</Typography>
                <Typography variant="body1">
                  {classItem.students?.length || 0}/{classItem.maxStudents || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Ngày tạo</Typography>
                <Typography variant="body1">{classItem.createdAt ? formatDate(classItem.createdAt) : 'Không xác định'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Ngày cập nhật</Typography>
                <Typography variant="body1">{classItem.updatedAt ? formatDate(classItem.updatedAt) : 'Không xác định'}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
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
          <PeopleIcon />
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
