import React from 'react';
import { Box } from '@mui/material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import StudentStatisticsPanel from './StudentStatisticsPanel';

const StudentStatistics: React.FC = () => {
  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <StudentStatisticsPanel />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default StudentStatistics;