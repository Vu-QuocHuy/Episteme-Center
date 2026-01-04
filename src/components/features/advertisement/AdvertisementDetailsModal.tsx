import React from 'react';
import { Box, Typography, Chip, Card, CardMedia } from '@mui/material';
import { Campaign as CampaignIcon } from '@mui/icons-material';
import { Advertisement } from '../../../types';
import BaseDialog from '../../common/BaseDialog';
import { formatAdvertisementDate, getTypeText, getPositionText } from '../../../utils/advertisementHelpers';

interface AdvertisementDetailsModalProps {
  advertisement: Advertisement | null;
  open: boolean;
  onClose: () => void;
}

const AdvertisementDetailsModal: React.FC<AdvertisementDetailsModalProps> = ({
  advertisement,
  open,
  onClose
}) => {
  if (!advertisement) return null;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết quảng cáo"
      icon={<CampaignIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
    >
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
              <Typography variant="body1">{formatAdvertisementDate(advertisement.startDate || '')}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Ngày kết thúc</Typography>
              <Typography variant="body1">
                {advertisement.endDate ? formatAdvertisementDate(advertisement.endDate) : 'Không giới hạn'}
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
    </BaseDialog>
  );
};

export default AdvertisementDetailsModal;

