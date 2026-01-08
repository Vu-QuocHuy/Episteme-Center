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
  Alert,
  Snackbar,
  CardMedia,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Public as PublicIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Advertisement } from '../../../types';
import ConfirmDialog from '../../common/ConfirmDialog';
import AdvertisementDetailsModal from './AdvertisementDetailsModal';
import {
  formatAdvertisementDate,
  getTypeText,
  getTypeColor,
  getPositionText,
  getStatusColor,
  getStatusText,
} from '../../../utils/advertisementHelpers';

interface AdvertisementTableProps {
  advertisements: Advertisement[];
  onEdit: (advertisement: Advertisement) => void;
  onDelete: (advertisementId: string) => void;
  onViewDetails: (advertisement: Advertisement) => void;
  onToggleStatus: (advertisementId: string, isActive: boolean) => void;
  loading?: boolean;
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
                      {formatAdvertisementDate(advertisement.startDate || '')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {advertisement.endDate ? `Đến ${formatAdvertisementDate(advertisement.endDate)}` : 'Không giới hạn'}
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
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa quảng cáo "${advertisementToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmColor="error"
      />

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

export default AdvertisementTable;