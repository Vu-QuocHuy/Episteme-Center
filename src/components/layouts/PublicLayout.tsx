import React from 'react';
import { Box } from '@mui/material';
import HomeHeader from '../../pages/home/HomeHeader';
import Footer from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * PublicLayout - Layout dùng chung cho các trang public
 * Header: Dùng HomeHeader mặc định (đã lấy menu từ API)
 * Footer: Bố cục tĩnh, nội dung động (email, phone, address)
 */
const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true
}) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section - HomeHeader mặc định (đã lấy menu từ API) */}
      {showHeader && <HomeHeader />}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: showHeader ? { xs: '72px', md: '72px' } : 0, // Match HomeHeader minHeight: 72px, ensure content is not hidden
          width: '100%'
        }}
      >
        {children}
      </Box>

      {/* Footer: Bố cục tĩnh, nội dung động */}
      {showFooter && <Footer />}
    </Box>
  );
};

export default PublicLayout;
