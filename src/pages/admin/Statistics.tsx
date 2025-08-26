import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import FinancialStatisticsPanel from './FinancialStatisticsPanel';

const Statistics: React.FC = () => {
  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom>Thống kê</Typography>
          <Box>
            {/* Default summary page could be empty or redirect; keep minimal */}
            <FinancialStatisticsPanel />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Statistics;
