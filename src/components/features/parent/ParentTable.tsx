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
  People as PeopleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  FamilyRestroom as FamilyIcon,

} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Parent } from '../../../types';
import ParentChildrenManager from './ParentChildrenManager';

interface ParentTableProps {
  parents: Parent[];
  onEdit: (parent: Parent) => void;
  onDelete: (parentId: string) => void;
  onViewDetails: (parent: Parent) => void;
  onViewChildren: (parent: Parent) => void;
  onUpdateParent?: () => void;
  searchStudents?: (query: string) => Promise<any[]>;
  loading?: boolean;
}

interface ParentDetailsModalProps {
  parent: Parent | null;
  open: boolean;
  onClose: () => void;
}



const ParentTable: React.FC<ParentTableProps> = ({
  parents,
  onEdit,
  onDelete,
  onViewDetails,
  onViewChildren,
  onUpdateParent,
  searchStudents,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [childrenModalOpen, setChildrenModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, parent: Parent) => {
    setAnchorEl(event.currentTarget);
    setSelectedParent(parent);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedParent(null);
  };

  const handleViewDetails = () => {
    if (selectedParent) {
      onViewDetails(selectedParent);
      setDetailsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleViewChildren = () => {
    if (selectedParent) {
      onViewChildren(selectedParent);
      setChildrenModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedParent) {
      onEdit(selectedParent);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedParent) {
      setParentToDelete(selectedParent);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (parentToDelete) {
      try {
        await onDelete(parentToDelete.id || '');
        setSnackbar({
          open: true,
          message: 'Xóa phụ huynh thành công',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa phụ huynh',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setParentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setParentToDelete(null);
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



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (parents.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có phụ huynh nào</Typography>
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
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Phụ huynh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thông tin liên hệ</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thông tin công việc</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Con cái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Ngày đăng ký</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parents && Array.isArray(parents) && parents.map((parent) => (
              <TableRow key={parent.id} hover sx={{
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
                          {parent.students?.length || 0}
                        </Avatar>
                      }
                    >
                      <Avatar
                        src={parent.avatar || undefined}
                        alt={parent.name}
                        sx={{ width: 50, height: 50 }}
                      >
                        {parent.name.charAt(0)}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {parent.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {parent.gender === 'male' ? 'Nam' : parent.gender === 'female' ? 'Nữ' : 'Không xác định'} • {parent.students?.length || 0} con
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{parent.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{parent.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {parent.occupation || 'Không xác định'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {parent.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FamilyIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {parent.students?.length || 0} con
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(parent.isActive ?? false)}
                    color={getStatusColor(parent.isActive ?? false) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.createdAt ? formatDate(parent.createdAt) : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Thao tác">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, parent)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {(!parents || !Array.isArray(parents) || parents.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu phụ huynh
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
        <MenuItem onClick={handleViewChildren}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem con cái</ListItemText>
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

      {/* Parent Details Modal */}
      <ParentDetailsModal
        parent={selectedParent}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Parent Children Manager */}
      <ParentChildrenManager
        parent={selectedParent}
        open={childrenModalOpen}
        onClose={() => setChildrenModalOpen(false)}
        onUpdate={() => {
          setChildrenModalOpen(false);
          if (onUpdateParent) onUpdateParent();
        }}
        searchStudents={searchStudents || (() => Promise.resolve([]))}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa phụ huynh "{parentToDelete?.name}"?
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

// Parent Details Modal Component
const ParentDetailsModal: React.FC<ParentDetailsModalProps> = ({
  parent,
  open,
  onClose
}) => {
  if (!parent) return null;



  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={parent.avatar || undefined} alt={parent.name}>
            {parent.name.charAt(0)}
          </Avatar>
          <Typography variant="h6">Chi tiết phụ huynh</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} mt={2}>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Họ tên</Typography>
                <Typography variant="body1">{parent.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{parent.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{parent.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Địa chỉ</Typography>
                <Typography variant="body1">{parent.address}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Giới tính</Typography>
                <Typography variant="body1">{parent.gender === 'male' ? 'Nam' : parent.gender === 'female' ? 'Nữ' : 'Không xác định'}</Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin công việc</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Nghề nghiệp</Typography>
                <Typography variant="body1">{parent.occupation}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Nơi làm việc</Typography>
                <Typography variant="body1">{parent.workplace}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Số con</Typography>
                <Typography variant="body1">{parent.students?.length || 0} con</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={parent.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  color={parent.isActive ? 'success' : 'error'}
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



export default ParentTable;
