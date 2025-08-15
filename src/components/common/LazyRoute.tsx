import React, { Suspense, ComponentType } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LazyRouteProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

const LazyRoute: React.FC<LazyRouteProps> = React.memo(({
  component: Component,
  fallback = null,
  ...props
}) => {
  const defaultFallback = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
});

LazyRoute.displayName = 'LazyRoute';

export default LazyRoute;
