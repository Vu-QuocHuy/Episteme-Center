import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  School,
  Star,
  People,
  EmojiEvents,
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import utilities and constants
import { COLORS, GRADIENTS } from '../utils/colors';
import { USER_ROLES, ROLE_LABELS, APP_NAME } from '../constants';
import { getRoleColor } from '../utils/helpers';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        navigate('/admin/dashboard');
        break;
      case USER_ROLES.TEACHER:
        navigate('/teacher/dashboard');
        break;
      case USER_ROLES.STUDENT:
        navigate('/student/dashboard');
        break;
      case USER_ROLES.PARENT:
        navigate('/parent/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const getRoleLabel = (role?: string) => {
    return role ? (ROLE_LABELS as Record<string, string>)[role] || role : '';
  };

  const features = [
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: 'Giảng viên chất lượng',
      description: 'Đội ngũ giáo viên có kinh nghiệm, được đào tạo bài bản'
    },
    {
      icon: <Star sx={{ fontSize: 40 }} />,
      title: 'Phương pháp hiện đại',
      description: 'Áp dụng công nghệ giáo dục tiên tiến trong giảng dạy'
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Lớp học nhỏ',
      description: 'Tối đa 15 học viên/lớp đảm bảo chất lượng'
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      title: 'Cam kết kết quả',
      description: 'Cam kết đầu ra rõ ràng, hỗ trợ học lại miễn phí'
    }
  ];

  const stats = [
    { number: '500+', label: 'Học viên' },
    { number: '50+', label: 'Giáo viên' },
    { number: '10+', label: 'Năm kinh nghiệm' },
    { number: '95%', label: 'Hài lòng' }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" component="div" color="primary" fontWeight="bold">
              {APP_NAME}
            </Typography>
          </Box>

          {/* Hiển thị khác nhau tùy trạng thái đăng nhập */}
          {user ? (
            <>
              <Button
                variant="contained"
                startIcon={<DashboardIcon />}
                onClick={handleDashboardClick}
                sx={{
                  mr: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Dashboard
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* User info - hidden on mobile */}
                <Box sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <Typography variant="subtitle2" sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.2
                  }}>
                    {user.name || 'User'}
                  </Typography>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    sx={{
                      bgcolor: `${getRoleColor(user.role)}15`,
                      color: getRoleColor(user.role),
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 20,
                      mt: 0.5
                    }}
                  />
                </Box>

                {/* Avatar button */}
                <Button
                  onClick={handleMenu}
                  sx={{
                    minWidth: 'auto',
                    p: 0,
                    borderRadius: '50%',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar sx={{
                    bgcolor: getRoleColor(user.role),
                    color: '#FFFFFF',
                    width: 40,
                    height: 40,
                    fontWeight: 600,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </Button>
              </Box>

              {/* Enhanced Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    minWidth: 280,
                    mt: 1.5,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: 3,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    overflow: 'visible',
                  }
                }}
              >
                {/* User info in menu */}
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography variant="h6" sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                    {user.name || 'User'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getRoleColor(user.role)
                    }} />
                    <Typography variant="body2" sx={{
                      color: 'text.secondary',
                      fontWeight: 500
                    }}>
                      {getRoleLabel(user.role)}
                    </Typography>
                  </Box>
                </Box>

                <MenuItem
                  onClick={handleClose}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: `${getRoleColor(user.role)}15`,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <AccountCircle sx={{
                    mr: 2,
                    color: 'text.secondary',
                    fontSize: 20
                  }} />
                  Thông tin cá nhân
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      color: 'error.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Logout sx={{
                    mr: 2,
                    color: 'text.secondary',
                    fontSize: 20
                  }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLoginClick}
              sx={{ borderRadius: 2 }}
            >
              Đăng nhập hệ thống
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{
        background: GRADIENTS.primary,
        color: 'white',
        py: 10
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
              🏫 English Center Management
            </Typography>

            {user ? (
              <Box>
                <Typography variant="h4" sx={{ mb: 2, opacity: 0.9 }}>
                  Chào mừng trở lại, {user.name}! 👋
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                  Vai trò: {getRoleLabel(user.role)}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleDashboardClick}
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  🚀 Truy cập Dashboard
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Hệ thống quản lý trung tâm tiếng Anh hiện đại và chuyên nghiệp
                </Typography>
                <Typography variant="h6" sx={{ mb: 6, opacity: 0.8 }}>
                  Dành cho quản trị viên, giáo viên, học sinh và phụ huynh
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoginClick}
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  🚀 Truy cập hệ thống
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
            🌟 Tại sao chọn chúng tôi?
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Chúng tôi cam kết mang đến chương trình học tiếng Anh chất lượng cao với những ưu điểm vượt trội
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Demo Accounts Section - chỉ hiển thị khi chưa đăng nhập */}
      {!user && (
        <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
          <Container maxWidth="md">
            <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
              🔑 Tài khoản demo
            </Typography>
            <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
              Trải nghiệm hệ thống với các tài khoản demo sau:
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {[
                { role: 'Admin', username: 'admin', password: 'admin123', color: 'error' },
                { role: 'Teacher', username: 'teacher', password: 'teacher123', color: 'primary' },
                { role: 'Student', username: 'student', password: 'student123', color: 'success' },
                { role: 'Parent', username: 'parent', password: 'parent123', color: 'warning' }
              ].map((account, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Chip
                        label={account.role}
                        color={account.color as any}
                        sx={{ mb: 2, fontWeight: 'bold' }}
                      />
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Username:</strong> {account.username}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Password:</strong> {account.password}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                English Center Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Hệ thống quản lý trung tâm tiếng Anh hiện đại, giúp tối ưu hóa
                quy trình quản lý và nâng cao chất lượng giáo dục.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Liên hệ
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                📧 Email: info@englishcenter.edu.vn<br/>
                📞 Phone: (84) 123 456 789<br/>
                📍 Address: 123 ABC Street, Ho Chi Minh City
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
