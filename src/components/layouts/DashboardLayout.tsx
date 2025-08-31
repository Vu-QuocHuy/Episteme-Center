import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSidebar } from '../../contexts/SidebarContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Header onMenuClick={toggleSidebar} />
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: '64px' }}>
        <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            transition: 'margin 0.3s',
            bgcolor: '#f9f9f9',
        }}
      >
        {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
