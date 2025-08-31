import React from 'react';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Skeleton,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { getBreadcrumb, loading } = useMenuItems();

  // Get current path segments
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Get breadcrumb items
  const breadcrumbItems = pathSegments.length > 0
    ? getBreadcrumb(pathSegments[pathSegments.length - 1])
    : [];

  if (loading) {
    return (
      <Box sx={{ py: 2 }}>
        <Skeleton width="60%" height={24} />
      </Box>
    );
  }

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

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return isLast ? (
            <Typography key={item.id} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.id}
              component={RouterLink}
              to={`/${item.sectionId}`}
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
