import React from 'react';
import { Box } from '@mui/material';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import MenuManagementComponent from '../MenuManagement';

const MenuManagement: React.FC = () => {
  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <MenuManagementComponent />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MenuManagement;
