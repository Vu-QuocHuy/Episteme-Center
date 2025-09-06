import React from 'react';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// import { useMenuItems } from '../../hooks/useMenuItems';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  // const { getBreadcrumb, loading } = useMenuItems();

  // Get current path segments
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Get breadcrumb items - simplified version
  const breadcrumbItems: Array<{ label: string; path: string }> = pathSegments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    path: '/' + pathSegments.slice(0, index + 1).join('/')
  }));

  // if (loading) {
  //   return (
  //     <Box sx={{ py: 2 }}>
  //       <Skeleton width="60%" height={24} />
  //     </Box>
  //   );
  // }

  if (pathSegments.length === 0) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <Box sx={{ py: 2, px: 2, backgroundColor: 'background.paper' }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Trang chủ
        </Link>

        {breadcrumbItems.map((item: { label: string; path: string }, index: number) => {
          const isLast = index === breadcrumbItems.length - 1;

          return isLast ? (
            <Typography key={item.path} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
