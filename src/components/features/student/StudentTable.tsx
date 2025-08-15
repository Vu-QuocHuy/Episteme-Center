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
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,

} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Student } from '../../../types';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onViewDetails: (student: Student) => void;
  onViewClasses: (student: Student) => void;
  loading?: boolean;
}

interface StudentDetailsModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

interface StudentClassesModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
  onViewDetails,
  onViewClasses,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [classesModalOpen, setClassesModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: Student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleViewDetails = () => {
    if (selectedStudent) {
      onViewDetails(selectedStudent);
      setDetailsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleViewClasses = () => {
    if (selectedStudent) {
      onViewClasses(selectedStudent);
      setClassesModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedStudent) {
      onEdit(selectedStudent);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedStudent) {
      setStudentToDelete(selectedStudent);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        await onDelete(studentToDelete.id);
        setSnackbar({
          open: true,
          message: 'Xóa học sinh thành công',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa học sinh',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Đang học' : 'Đã nghỉ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có học sinh nào</Typography>
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
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Học sinh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thông tin liên hệ</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thông tin học tập</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Phụ huynh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Ngày đăng ký</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students && Array.isArray(students) && students.map((student) => (
                            <TableRow key={student.id} hover sx={{
                '& .MuiTableCell-root': { color: '#000000 !important' },
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                  color: '#000000 !important'
                }
              }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: '0.75rem',
                            bgcolor: theme.palette.secondary.main
                          }}
                        >
                          {student.parentId ? 'P' : 'N'}
                        </Avatar>
                      }
                    >
                      <Avatar
                        src={student.avatar || student.userId?.avatar}
                        alt={student.name || student.userId?.name}
                        sx={{ width: 50, height: 50 }}
                      >
                        {(student.name || student.userId?.name || '').charAt(0)}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {student.name || student.userId?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.dayOfBirth ? calculateAge(student.dayOfBirth) : (student.dateOfBirth ? calculateAge(student.dateOfBirth) : 0)} tuổi
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{student.email || student.userId?.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{student.phone || student.userId?.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={student.level || 'Không xác định'}
                      color={getLevelColor(student.level || '') as any}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                      {student.schoolName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {student.parentId ? 'Có phụ huynh' : 'Không có phụ huynh'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(student.isActive ?? true)}
                    color={getStatusColor(student.isActive ?? true) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.createdAt ? formatDate(student.createdAt) : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Thao tác">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, student)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {(!students || !Array.isArray(students) || students.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu học sinh
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

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Student Classes Modal */}
      <StudentClassesModal
        student={selectedStudent}
        open={classesModalOpen}
        onClose={() => setClassesModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa học sinh "{studentToDelete?.name || studentToDelete?.userId?.name}"?
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

// Student Details Modal Component
const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  open,
  onClose
}) => {
  if (!student) return null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={student.avatar || student.userId?.avatar} alt={student.name || student.userId?.name}>
            {(student.name || student.userId?.name || '').charAt(0)}
          </Avatar>
          <Typography variant="h6">Chi tiết học sinh</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} mt={2}>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Họ tên</Typography>
                <Typography variant="body1">{student.name || student.userId?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{student.email || student.userId?.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{student.phone || student.userId?.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Địa chỉ</Typography>
                <Typography variant="body1">{student.address || student.userId?.address}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Ngày sinh</Typography>
                <Typography variant="body1">
                  {student.dayOfBirth ? formatDate(student.dayOfBirth) : (student.dateOfBirth ? formatDate(student.dateOfBirth) : 'Không xác định')} ({student.dayOfBirth ? calculateAge(student.dayOfBirth) : (student.dateOfBirth ? calculateAge(student.dateOfBirth) : 0)} tuổi)
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin học tập</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trình độ</Typography>
                <Chip label={student.level} color="primary" size="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trường học</Typography>
                <Typography variant="body1">{student.schoolName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Lớp</Typography>
                <Typography variant="body1">{student.grade}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Phụ huynh</Typography>
                <Typography variant="body1">
                  {student.parentId ? 'Có phụ huynh' : 'Không có phụ huynh'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={student.isActive ? 'Đang học' : 'Đã nghỉ'}
                  color={student.isActive ? 'success' : 'error'}
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

// Student Classes Modal Component
const StudentClassesModal: React.FC<StudentClassesModalProps> = ({
  student,
  open,
  onClose
}) => {
  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <SchoolIcon />
          <Typography variant="h6">Lớp học của {student.name || student.userId?.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="body1" color="text.secondary">
            Danh sách các lớp học mà học sinh này đang tham gia sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentTable;
