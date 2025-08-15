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
  Card,
  CardMedia,

} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Campaign as CampaignIcon,

  Public as PublicIcon,
  VisibilityOff as VisibilityOffIcon,

} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Advertisement } from '../../../types';

interface AdvertisementTableProps {
  advertisements: Advertisement[];
  onEdit: (advertisement: Advertisement) => void;
  onDelete: (advertisementId: string) => void;
  onViewDetails: (advertisement: Advertisement) => void;
  onToggleStatus: (advertisementId: string, isActive: boolean) => void;
  loading?: boolean;
}

interface AdvertisementDetailsModalProps {
  advertisement: Advertisement | null;
  open: boolean;
  onClose: () => void;
}

const AdvertisementTable: React.FC<AdvertisementTableProps> = ({
  advertisements,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleStatus,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [advertisementToDelete, setAdvertisementToDelete] = useState<Advertisement | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, advertisement: Advertisement) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdvertisement(advertisement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAdvertisement(null);
  };

  const handleViewDetails = () => {
    if (selectedAdvertisement) {
      onViewDetails(selectedAdvertisement);
      setDetailsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedAdvertisement) {
      onEdit(selectedAdvertisement);
    }
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    if (selectedAdvertisement) {
      onToggleStatus(selectedAdvertisement.id || '', !selectedAdvertisement.isActive);
      setSnackbar({
        open: true,
        message: selectedAdvertisement.isActive
          ? 'Đã ẩn quảng cáo'
          : 'Đã hiển thị quảng cáo',
        severity: 'success'
      });
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedAdvertisement) {
      setAdvertisementToDelete(selectedAdvertisement);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (advertisementToDelete) {
      try {
        await onDelete(advertisementToDelete.id || '');
        setSnackbar({
          open: true,
          message: 'Xóa quảng cáo thành công',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa quảng cáo',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setAdvertisementToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAdvertisementToDelete(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Đang hiển thị' : 'Đã ẩn';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'banner': 'primary',
      'popup': 'secondary',
      'slider': 'success',
      'sidebar': 'warning',
      'notification': 'error'
    };
    return typeColors[type] || 'default';
  };

  const getTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'banner': 'Banner',
      'popup': 'Popup',
      'slider': 'Slider',
      'sidebar': 'Sidebar',
      'notification': 'Thông báo'
    };
    return typeMap[type] || type;
  };

  const getPositionText = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'top': 'Đầu trang',
      'bottom': 'Cuối trang',
      'left': 'Bên trái',
      'right': 'Bên phải',
      'center': 'Giữa trang',
      'homepage': 'Trang chủ',
      'sidebar': 'Thanh bên'
    };
    return positionMap[position] || position;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (advertisements.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có quảng cáo nào</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quảng cáo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thông tin</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vị trí & Loại</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thời gian</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {advertisements.map((advertisement) => (
              <TableRow key={advertisement.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[200]
                      }}
                    >
                      {advertisement.imageUrl ? (
                        <CardMedia
                          component="img"
                          image={advertisement.imageUrl}
                          alt={advertisement.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <ImageIcon />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {advertisement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {advertisement.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {advertisement.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {advertisement.linkUrl ? 'Có link' : 'Không có link'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={getTypeText(advertisement.type || '')}
                      color={getTypeColor(advertisement.type || '') as any}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                      {getPositionText(advertisement.position || '')}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(advertisement.startDate || '')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {advertisement.endDate ? `Đến ${formatDate(advertisement.endDate)}` : 'Không giới hạn'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(advertisement.isActive ?? false)}
                    color={getStatusColor(advertisement.isActive ?? false) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Thao tác">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, advertisement)}
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
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {selectedAdvertisement?.isActive ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <PublicIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedAdvertisement?.isActive ? 'Ẩn quảng cáo' : 'Hiển thị quảng cáo'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Advertisement Details Modal */}
      <AdvertisementDetailsModal
        advertisement={selectedAdvertisement}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa quảng cáo "{advertisementToDelete?.title}"?
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

// Advertisement Details Modal Component
const AdvertisementDetailsModal: React.FC<AdvertisementDetailsModalProps> = ({
  advertisement,
  open,
  onClose
}) => {
  if (!advertisement) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'banner': 'Banner',
      'popup': 'Popup',
      'slider': 'Slider',
      'sidebar': 'Sidebar',
      'notification': 'Thông báo'
    };
    return typeMap[type] || type;
  };

  const getPositionText = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'top': 'Đầu trang',
      'bottom': 'Cuối trang',
      'left': 'Bên trái',
      'right': 'Bên phải',
      'center': 'Giữa trang',
      'homepage': 'Trang chủ',
      'sidebar': 'Thanh bên'
    };
    return positionMap[position] || position;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <CampaignIcon />
          <Typography variant="h6">Chi tiết quảng cáo</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} mt={2}>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin cơ bản</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tiêu đề</Typography>
                <Typography variant="body1">{advertisement.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
                <Typography variant="body1">{advertisement.description}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Link</Typography>
                <Typography variant="body1">
                  {advertisement.linkUrl || 'Không có link'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={advertisement.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                  color={advertisement.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>Thông tin hiển thị</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Loại</Typography>
                <Typography variant="body1">{getTypeText(advertisement.type || '')}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Vị trí</Typography>
                <Typography variant="body1">{getPositionText(advertisement.position || '')}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Ngày bắt đầu</Typography>
                <Typography variant="body1">{formatDate(advertisement.startDate || '')}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Ngày kết thúc</Typography>
                <Typography variant="body1">
                  {advertisement.endDate ? formatDate(advertisement.endDate) : 'Không giới hạn'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {advertisement.imageUrl && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Hình ảnh</Typography>
            <Card sx={{ maxWidth: 400 }}>
              <CardMedia
                component="img"
                image={advertisement.imageUrl}
                alt={advertisement.title}
                sx={{ height: 200, objectFit: 'cover' }}
              />
            </Card>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvertisementTable;
