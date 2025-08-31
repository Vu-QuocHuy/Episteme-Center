import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Tooltip, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import WebIcon from '@mui/icons-material/Web';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { COLORS } from '../../utils/colors';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const drawerWidth = 260;
const miniWidth = 72;

const getMenuItemsByRole = (role: string): MenuItem[] => {
  switch (role) {
    case 'admin':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/admin/dashboard' },
        { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Quản lý quảng cáo', icon: <CampaignIcon />, path: '/admin/advertisements' },
        { text: 'Quản lý Menu', icon: <MenuIcon />, path: '/admin/menu-management' },
                  { text: 'Thống kê', icon: <AssessmentIcon />, path: '/admin/statistics' },
          { text: 'Quản lý trang chủ', icon: <WebIcon />, path: '/admin/homepage' },
          { text: 'Audit Logs', icon: <ListAltIcon />, path: '/admin/audit-log' },

      ];
    case 'teacher':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/teacher/dashboard' },
        { text: 'Lịch dạy', icon: <ClassIcon />, path: '/teacher/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/teacher/classes' },
        { text: 'Lương', icon: <PaymentIcon />, path: '/teacher/salary' },
      ];
    case 'student':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/student/dashboard' },
        { text: 'Lịch học', icon: <ClassIcon />, path: '/student/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/student/classes' },
      ];
    case 'parent':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/parent/dashboard' },
        { text: 'Con em', icon: <SchoolIcon />, path: '/parent/children' },
        { text: 'Thanh toán', icon: <PaymentIcon />, path: '/parent/payments' },
      ];
    default:
      return [
        { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
        { text: 'Khám phá', icon: <ExploreIcon />, path: '/explore' },
        { text: 'Kênh đăng ký', icon: <SubscriptionsIcon />, path: '/subscriptions' },
        { text: 'Thư viện', icon: <VideoLibraryIcon />, path: '/library' },
        { text: 'Lịch sử', icon: <HistoryIcon />, path: '/history' },
      ];
  }
};

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebar } = useSidebar();
  const role = user?.role || 'student';
  const menuItems = getMenuItemsByRole(role);
  const [statsOpen, setStatsOpen] = useState<boolean>(location.pathname.startsWith('/admin/statistics'));
  const [usersOpen, setUsersOpen] = useState<boolean>(location.pathname.startsWith('/admin/users'));
  const [homepageOpen, setHomepageOpen] = useState<boolean>(location.pathname.startsWith('/admin/homepage'));

  // Đóng sub-menu khi sidebar đóng
  React.useEffect(() => {
    if (!open) {
      setStatsOpen(false);
      setUsersOpen(false);
      setHomepageOpen(false);
    }
  }, [open]);

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : miniWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: '#fff',
          borderRight: '1px solid #eee',
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {menuItems.map((item) => {
            const isStatistics = item.path === '/admin/statistics';
            const isUsers = item.path === '/admin/users';
            const isHomepage = item.path === '/admin/homepage';

            if (!isStatistics && !isUsers && !isHomepage) {
              return (
            <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
              <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
              sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    my: 0.5,
                    transition: 'background 0.2s',
                '&.Mui-selected': {
                      bgcolor: '#f5f5f5',
                      color: COLORS.primary.main,
                          '&:hover': { bgcolor: '#eeeeee' }
                        },
                        '&:hover': { bgcolor: '#f9f9f9' }
              }}
            >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === item.path ? COLORS.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                    </ListItemIcon>
                  {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />}
                  </ListItemButton>
                </ListItem>
            </Tooltip>
              );
            }

            // Users management item with expandable sub-menu
            if (isUsers) {
              return (
                <Box key={item.text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      selected={location.pathname.startsWith('/admin/users')}
                      onClick={() => {
                        if (!open) {
                          openSidebar();
                        }
                        setUsersOpen((v) => !v);
                      }}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        my: 0.5,
                        transition: 'background 0.2s',
                        '&.Mui-selected': {
                          bgcolor: '#f5f5f5',
                          color: COLORS.primary.main,
                          '&:hover': { bgcolor: '#eeeeee' }
                        },
                        '&:hover': { bgcolor: '#f9f9f9' }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: location.pathname.startsWith('/admin/users') ? COLORS.primary.main : 'inherit',
                        }}
                      >
                        <PeopleIcon />
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, mr: 2 }} />}
                      {open && (usersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                    </ListItemButton>
                  </ListItem>
                  {usersOpen && (
                    <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                      <ListItemButton
                        selected={location.pathname === '/admin/users/students'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/users/students');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Học viên" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/users/teachers'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/users/teachers');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Giáo viên" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/users/parents'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/users/parents');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Phụ huynh" />}
                      </ListItemButton>
                    </List>
                  )}
                </Box>
              );
            }

            // Homepage Management item with expandable sub-menu
            if (isHomepage) {
              return (
                <Box key={item.text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      selected={location.pathname.startsWith('/admin/homepage')}
                      onClick={() => {
                        if (!open) {
                          openSidebar();
                        }
                        setHomepageOpen((v) => !v);
                      }}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        my: 0.5,
                        transition: 'background 0.2s',
                        '&.Mui-selected': {
                          bgcolor: '#f5f5f5',
                          color: COLORS.primary.main,
                          '&:hover': { bgcolor: '#eeeeee' }
                        },
                        '&:hover': { bgcolor: '#f9f9f9' }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: location.pathname.startsWith('/admin/homepage') ? COLORS.primary.main : 'inherit',
                        }}
                      >
                        <WebIcon />
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, mr: 2 }} />}
                      {open && (homepageOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                    </ListItemButton>
                  </ListItem>
                  {homepageOpen && (
                    <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                      <ListItemButton
                        selected={location.pathname === '/admin/homepage'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/homepage');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Tổng quan" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/homepage/banner'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/homepage/banner');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Quản lý Banner" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/homepage/about'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/homepage/about');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Quản lý Giới thiệu" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/homepage/featured-teachers'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/homepage/featured-teachers');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Giảng viên nổi bật" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/homepage/testimonials'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/homepage/testimonials');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Đánh giá học viên" />}
                      </ListItemButton>
                      <ListItemButton
                        selected={location.pathname === '/admin/homepage/footer'}
                        onClick={() => {
                          if (!open) {
                            openSidebar();
                          }
                          navigate('/admin/homepage/footer');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25
                        }}
                      >
                        {open && <ListItemText primary="Footer" />}
                      </ListItemButton>
                    </List>
                  )}
                </Box>
              );
            }

            // Statistics item with expandable sub-menu
            return (
              <Box key={item.text}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    selected={location.pathname.startsWith('/admin/statistics')}
                    onClick={() => {
                      if (!open) {
                        openSidebar();
                      }
                      setStatsOpen((v) => !v);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      my: 0.5,
                      transition: 'background 0.2s',
                      '&.Mui-selected': {
                        bgcolor: '#f5f5f5',
                        color: COLORS.primary.main,
                        '&:hover': { bgcolor: '#eeeeee' }
                      },
                      '&:hover': { bgcolor: '#f9f9f9' }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: location.pathname.startsWith('/admin/statistics') ? COLORS.primary.main : 'inherit',
                      }}
                    >
                      <AssessmentIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, mr: 2 }} />}
                    {open && (statsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </ListItemButton>
                </ListItem>
                {statsOpen && (
                  <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                    <ListItemButton
                      selected={location.pathname === '/admin/statistics/financial'}
                      onClick={() => {
                        if (!open) {
                          openSidebar();
                        }
                        navigate('/admin/statistics/financial');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25
                      }}
                    >
                      {open && <ListItemText primary="Thống kê tài chính" />}
                    </ListItemButton>
                    <ListItemButton
                      selected={location.pathname === '/admin/statistics/students'}
                      onClick={() => {
                        if (!open) {
                          openSidebar();
                        }
                        navigate('/admin/statistics/students');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25
                      }}
                    >
                      {open && <ListItemText primary="Thống kê học sinh" />}
                    </ListItemButton>
                  </List>
                )}
              </Box>
            );
          })}
            </List>
      </Box>
      <Divider />
      </Drawer>
  );
};

export default Sidebar;
