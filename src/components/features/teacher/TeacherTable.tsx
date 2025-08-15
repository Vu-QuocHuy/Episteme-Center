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
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Teacher } from '../../../types';

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
  onViewDetails: (teacher: Teacher) => void;
  onViewClasses: (teacher: Teacher) => void;
  loading?: boolean;
}

interface TeacherDetailsModalProps {
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
}

interface TeacherClassesModalProps {
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  onEdit,
  onDelete,
  onViewDetails,
  onViewClasses,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [classesModalOpen, setClassesModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, teacher: Teacher) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeacher(teacher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeacher(null);
  };

  const handleViewDetails = () => {
    if (selectedTeacher) {
      onViewDetails(selectedTeacher);
      setDetailsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleViewClasses = () => {
    if (selectedTeacher) {
      onViewClasses(selectedTeacher);
      setClassesModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedTeacher) {
      onEdit(selectedTeacher);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedTeacher) {
      setTeacherToDelete(selectedTeacher);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (teacherToDelete) {
      try {
        await onDelete(teacherToDelete.id);
        setSnackbar({
          open: true,
          message: 'Xóa giáo viên thành công',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa giáo viên',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Đang hoạt động' : 'Không hoạt động';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getAverageRating = (teacher: Teacher) => {
    if (!teacher.rating) return '0';
    return teacher.rating.toFixed(1);
  };

  const renderRatingStars = (rating: number) => {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            sx={{
              fontSize: 16,
              color: star <= rating ? theme.palette.warning.main : theme.palette.grey[300]
            }}
          />
        ))}
        <Typography variant="caption" color="text.secondary">
          ({rating})
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (teachers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có giáo viên nào</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          backgroundColor: 'white',
          '& .MuiTableBody-root .MuiTableCell-root': {
            color: 'black !important'
          },
          '& .MuiTableBody-root .MuiTypography-root': {
            color: 'inherit !important'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giáo viên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thông tin liên hệ</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Chuyên môn</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Đánh giá</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lương/Buổi</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers && Array.isArray(teachers) && teachers.map((teacher) => (
              <TableRow key={teacher.id} hover sx={{
                '& .MuiTableCell-root': { color: '#000000 !important' },
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                  color: '#000000 !important'
                }
              }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={teacher.avatar || teacher.userId?.avatar || undefined}
                      alt={teacher.name || teacher.userId?.name}
                      sx={{ width: 50, height: 50 }}
                    >
                      {(teacher.name || teacher.userId?.name || '').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teacher.name || teacher.userId?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {teacher.gender === 'male' ? 'Nam' : teacher.gender === 'female' ? 'Nữ' : 'Không xác định'} • {teacher.classes?.length || 0} lớp
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{teacher.email || teacher.userId?.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{teacher.phone || teacher.userId?.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {teacher.specializations?.length > 0 ? teacher.specializations.join(', ') : teacher.specialization || 'Không xác định'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {teacher.qualifications?.length > 0 ? `${teacher.qualifications.length} bằng cấp` : teacher.experience ? `${teacher.experience} năm kinh nghiệm` : 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {renderRatingStars(parseFloat(getAverageRating(teacher)))}
                    <Typography variant="caption" color="text.secondary">
                      {teacher.rating ? '1' : '0'} đánh giá
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {teacher.salaryPerLesson?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Chưa cập nhật'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(teacher.isActive)}
                    color={getStatusColor(teacher.isActive) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.createdAt ? formatDate(teacher.createdAt) : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Thao tác">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, teacher)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {(!teachers || !Array.isArray(teachers) || teachers.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu giáo viên
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
        <MenuItem onClick={handleViewClasses}>
          <ListItemIcon>
            <SchoolIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem lớp học</ListItemText>
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

      {/* Teacher Details Modal */}
      <TeacherDetailsModal
        teacher={selectedTeacher}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Teacher Classes Modal */}
      <TeacherClassesModal
        teacher={selectedTeacher}
        open={classesModalOpen}
        onClose={() => setClassesModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa giáo viên "{teacherToDelete?.name || (teacherToDelete?.userId ? teacherToDelete.userId.name : '')}"?
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

// Teacher Details Modal Component
const TeacherDetailsModal: React.FC<TeacherDetailsModalProps> = ({
  teacher,
  open,
  onClose
}) => {
  if (!teacher) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={teacher.avatar || teacher.userId?.avatar || undefined} alt={teacher.name || teacher.userId?.name}>
            {(teacher.name || teacher.userId?.name || '').charAt(0)}
          </Avatar>
          <Typography variant="h6">Chi tiết giáo viên</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} mt={2}>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Họ tên</Typography>
                <Typography variant="body1">{teacher.name || teacher.userId?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{teacher.email || teacher.userId?.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{teacher.phone || teacher.userId?.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Địa chỉ</Typography>
                <Typography variant="body1">{teacher.address || teacher.userId?.address}</Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin chuyên môn</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Chuyên môn</Typography>
                <Typography variant="body1">
                  {teacher.specializations?.length > 0 ? teacher.specializations.join(', ') : teacher.specialization || 'Không xác định'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Bằng cấp</Typography>
                <Typography variant="body1">
                  {teacher.qualifications?.length > 0 ? teacher.qualifications.join(', ') : 'Chưa cập nhật'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Lương/Buổi</Typography>
                <Typography variant="body1">
                  {teacher.salaryPerLesson?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Chưa cập nhật'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Kinh nghiệm</Typography>
                <Typography variant="body1">{teacher.experience ? `${teacher.experience} năm` : 'Chưa cập nhật'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
                <Typography variant="body1">{teacher.description || 'Không có mô tả'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={teacher.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  color={teacher.isActive ? 'success' : 'error'}
                  size="small"
                />
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

// Teacher Classes Modal Component
const TeacherClassesModal: React.FC<TeacherClassesModalProps> = ({
  teacher,
  open,
  onClose
}) => {
  if (!teacher) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <SchoolIcon />
          <Typography variant="h6">Lớp học của {teacher.name || teacher.userId?.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="body1" color="text.secondary">
            Danh sách các lớp học mà giáo viên này đang phụ trách sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherTable;
