import React from 'react';
import { Box } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import FinancialStatisticsPanel from './FinancialStatisticsPanel';

const FinancialStatistics: React.FC = () => {
  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <FinancialStatisticsPanel />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default FinancialStatistics;

