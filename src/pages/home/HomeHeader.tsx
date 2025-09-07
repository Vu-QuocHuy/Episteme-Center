import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../utils/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useMenuItems } from '../../hooks/features/useMenuItems';
import { NavigationMenuItem } from '../../types';

const scrollToSection = (id: string): void => {
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({
      top: el.offsetTop - 72, // Offset for header height
      behavior: 'smooth',
    });
  }
};

const HomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { menuItems } = useMenuItems();

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero-section');
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  // Get active menu items (filtered and sorted)
  const activeMenuItems = menuItems
    .filter(item => item.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Không dùng menu tĩnh mặc định; chỉ hiển thị khi có menu từ API
  const displayMenuItems = activeMenuItems;

  // Get section IDs for scroll detection
  const sectionIds = displayMenuItems
    .map(item => ({ label: item.title, id: item.slug || item.title }));

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollY = window.scrollY;
      const currentSection = sectionIds.reduce((acc, section) => {
        const el = document.getElementById(section.id);
        if (el && scrollY >= el.offsetTop - 80) {
          return section.id;
        }
        return acc;
      }, 'hero-section');

      setActiveSection(currentSection);
      setScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = (): void => {
    setMobileMenuAnchor(null);
  };

  const handleMobileMenuItemClick = (menuItem: NavigationMenuItem): void => {
    handleMenuClick(menuItem);
    handleMobileMenuClose();
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleDashboard = (): void => {
    const role = user?.role;
    if (role) {
      navigate(`/${role}/dashboard`);
    }
    handleMenuClose();
  };

  const handleProfile = (): void => {
    // Navigate to profile based on user role
    switch (user?.role) {
      case 'admin':
        navigate('/admin/profile');
        break;
      case 'teacher':
        navigate('/teacher/profile');
        break;
      case 'student':
        navigate('/student/profile');
        break;
      case 'parent':
        navigate('/parent/profile');
        break;
      default:
        navigate('/profile'); // Fallback to general profile
    }
    handleMenuClose();
  };

  const handleLogout = (): void => {
    logout();
    navigate('/'); // Stay on home page after logout
    handleMenuClose();
  };

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>, menuId: string): void => {
    setDropdownAnchor(prev => ({ ...prev, [menuId]: event.currentTarget }));
  };

  const handleDropdownClose = (menuId: string): void => {
    setDropdownAnchor(prev => ({ ...prev, [menuId]: null }));
  };

  const handleMenuClick = (menuItem: NavigationMenuItem): void => {
    if (menuItem.slug) {
      // Navigate to slug if available
      navigate(menuItem.slug);
    } else if (menuItem.children && menuItem.children.length > 0) {
      // If no slug but has children, do nothing (dropdown will handle it)
      return;
    } else {
      // Fallback to scroll to section
      scrollToSection(menuItem.title);
    }
  };

  const handleSubmenuClick = (submenu: NavigationMenuItem): void => {
    if (submenu.slug) {
      navigate(submenu.slug);
    }
  };

  const renderAuthControls = (): React.ReactNode => {
    if (user) {
      return (
        <>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0.3 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: COLORS.secondary.main,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18
              }}
              src={user?.avatar}
              alt={user?.name || user?.username || 'User'}
            >
              {user?.avatar ? null : (user?.name?.charAt(0) || user?.username?.charAt(0) || '?')}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                {user?.name || user?.username || 'User'}
              </Typography>
            </Box>
            <MenuItem onClick={handleDashboard}>
              <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Trang cá nhân
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </>
      );
    }
    return (
      <Button
        variant="contained"
        onClick={() => navigate('/login')}
        startIcon={<PersonIcon />}
        sx={{
          ...commonStyles.primaryButton,
          px: 2.5,
          py: 1,
          borderRadius: 2,
        }}
      >
        Đăng nhập
      </Button>
    );
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#fff',
        color: COLORS.text.primary,
        borderBottom: 'none',
        boxShadow: scrolled ? 1 : 'none',
        transition: 'all 0.3s',
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <SchoolIcon sx={{ fontSize: 32, color: COLORS.primary.text, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            English Center
          </Typography>
        </Box>

        {isMobile ? (
          // Mobile Menu
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              sx={{ mt: 1 }}
            >
              {displayMenuItems.map((menuItem) => (
                <Box key={menuItem.id}>
                  <MenuItem onClick={() => handleMobileMenuItemClick(menuItem)}>
                    {menuItem.title}
                  </MenuItem>
                  {menuItem.children && menuItem.children.length > 0 && (
                    <Box sx={{ pl: 2 }}>
                      {menuItem.children
                        .filter(child => child.isActive)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((submenu) => (
                          <MenuItem
                            key={submenu.id}
                            onClick={() => {
                              handleSubmenuClick(submenu);
                              handleMobileMenuClose();
                            }}
                            sx={{ pl: 3, fontSize: '0.9rem' }}
                          >
                            {submenu.title}
                          </MenuItem>
                        ))}
                    </Box>
                  )}
                </Box>
              ))}
              {user ? (
                <>
                  <MenuItem onClick={() => { handleDashboard(); handleMobileMenuClose(); }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleProfile(); handleMobileMenuClose(); }}>
                    Trang cá nhân
                  </MenuItem>
                  <MenuItem onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
                    Đăng xuất
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={() => { navigate('/login'); handleMobileMenuClose(); }}>
                  Đăng nhập
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          // Desktop Menu
          <>
            <Box sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              zIndex: 1,
            }}>
              {displayMenuItems.map((menuItem) => (
                <Box
                  key={menuItem.id}
                  sx={{ position: 'relative' }}
                  onMouseEnter={(e) => {
                    if (menuItem.children && menuItem.children.length > 0) {
                      handleDropdownOpen(e, menuItem.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (menuItem.children && menuItem.children.length > 0) {
                      handleDropdownClose(menuItem.id);
                    }
                  }}
                >
                  <Button
                    onClick={() => handleMenuClick(menuItem)}
                    sx={{
                      mx: 1.5,
                      color: activeSection === (menuItem.slug || menuItem.title) ? COLORS.primary.main : '#111',
                      fontWeight: activeSection === (menuItem.slug || menuItem.title) ? 700 : 500,
                      fontSize: '1rem',
                      borderRadius: 0,
                      bgcolor: 'transparent',
                      outline: 'none',
                      boxShadow: 'none',
                      border: '1px solid transparent',
                      '&:focus, &:active': {
                        outline: 'none',
                        boxShadow: 'none',
                        bgcolor: 'transparent',
                      },
                      '&:hover': {
                        color: '#111',
                        bgcolor: 'transparent',
                        border: '1px solid #ddd',
                        borderRadius: 0,
                      },
                    }}
                  >
                    {menuItem.title}
                  </Button>

                  {/* Dropdown Menu */}
                  {menuItem.children && menuItem.children.length > 0 && (
                    <Menu
                      anchorEl={dropdownAnchor[menuItem.id]}
                      open={Boolean(dropdownAnchor[menuItem.id])}
                      onClose={() => handleDropdownClose(menuItem.id)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                      sx={{
                        mt: 1,
                        '& .MuiPaper-root': {
                          borderRadius: 0,
                        }
                      }}
                      MenuListProps={{
                        onMouseEnter: () => {
                          // Keep dropdown open when hovering over menu items
                        },
                        onMouseLeave: () => handleDropdownClose(menuItem.id),
                      }}
                    >
                      {menuItem.children
                        .filter(child => child.isActive)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((submenu) => (
                          <MenuItem
                            key={submenu.id}
                            onClick={() => handleSubmenuClick(submenu)}
                            sx={{ minWidth: 150 }}
                          >
                            {submenu.title}
                          </MenuItem>
                        ))}
                    </Menu>
                  )}
                </Box>
              ))}
            </Box>

            {renderAuthControls()}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default HomeHeader;
