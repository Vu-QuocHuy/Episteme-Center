import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, useTheme
} from '@mui/material';
import {
  Web as WebIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { commonStyles } from '../../../utils/styles';

const HomepageManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Sub-sections configuration
  const subSections = [
    {
      id: 'banner',
      title: 'Quản lý Banner',
      description: 'Quản lý banner quảng cáo và slider',
      icon: <WebIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      path: '/admin/homepage/banner',
      features: ['Thêm/sửa banner', 'Sắp xếp thứ tự', 'Tùy chỉnh hiệu ứng']
    },
    {
      id: 'about',
      title: 'Quản lý Giới thiệu',
      description: 'Chỉnh sửa thông tin về trung tâm',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
      path: '/admin/homepage/about',
      features: ['Tiêu đề & mô tả', 'Đặc điểm nổi bật', 'Thông tin liên hệ']
    },
    {
      id: 'featured-teachers',
      title: 'Quản lý Giảng viên nổi bật',
      description: 'Chọn và sắp xếp giảng viên hiển thị',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
      path: '/admin/homepage/featured-teachers',
      features: ['Chọn giảng viên', 'Sắp xếp thứ tự', 'Thông tin hiển thị']
    },
    {
      id: 'testimonials',
      title: 'Quản lý Đánh giá',
      description: 'Quản lý feedback từ học viên',
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      path: '/admin/homepage/testimonials',
      features: ['Thêm/sửa đánh giá', 'Quản lý rating', 'Hiển thị avatar']
    },
    {
      id: 'footer',
      title: 'Quản lý Footer',
      description: 'Chỉnh sửa thông tin footer trang web',
      icon: <WebIcon sx={{ fontSize: 40 }} />,
      color: 'grey.600',
      path: '/admin/homepage/footer',
      features: ['Thông tin liên hệ', 'Social media links', 'Copyright text']
    }
  ];

  const handleNavigateToSection = (path: string) => {
    navigate(path);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý trang chủ
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Quản lý nội dung và cấu hình cho các section trên trang chủ
          </Typography>

        <Grid container spacing={3}>
          {subSections.map((section) => (
            <Grid item xs={12} sm={6} md={4} key={section.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: section.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {section.icon}
                  </Box>

                  <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                    {section.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {section.description}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {section.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{
                          mr: 0.5,
                          mb: 0.5,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleNavigateToSection(section.path)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: section.color,
                      '&:hover': {
                        bgcolor: section.color,
                        opacity: 0.9
                      }
                    }}
                  >
                    Quản lý
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Thống kê nhanh
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sections
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  4
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang hoạt động
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  1
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tạm ẩn
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="grey.600" fontWeight="bold">
                  5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sections
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default HomepageManagement;
