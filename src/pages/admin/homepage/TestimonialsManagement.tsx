import React from 'react';
import {
  Box, Typography, Button, useTheme, IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { commonStyles } from '../../../utils/styles';

const TestimonialsManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={commonStyles.pageHeader}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate('/admin/homepage')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography sx={commonStyles.pageTitle}>
                Quản lý Đánh giá học viên
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Quản lý feedback và đánh giá từ học viên
          </Typography>

          {/* Coming Soon */}
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <StarIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Tính năng đang phát triển
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Trang quản lý đánh giá học viên sẽ sớm được hoàn thiện
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/admin/homepage')}
              startIcon={<ArrowBackIcon />}
            >
              Quay lại
            </Button>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TestimonialsManagement;
