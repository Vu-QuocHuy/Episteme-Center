// Refactored Teacher Dashboard - Clean, modular, and maintainable
import React from 'react';
import { Box, Grid } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { LoadingErrorWrapper } from '../../components/common';
import { useDashboardData } from '../../hooks';
import { getTeacherDashboardAPI } from '../../services/api';
import { DashboardStats, ActiveClassesList, PaymentInfoPanel } from '../../components/features/teacher';

// Type definitions
interface PaymentInfo {
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface ActiveClass {
  id: string;
  name: string;
  studentCount: number;
  schedule: string;
  nextLesson?: string;
}

interface RecentlySalary {
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface DashboardData {
  totalStudent: number;
  teachingClasses: number;
  closedClasses: number;
  upcomingClasses: number;
  paymentInfo: PaymentInfo[];
  activeClasses: ActiveClass[];
  recentlySalary: RecentlySalary;
}

// Default data structure
const initialDashboardData: DashboardData = {
  totalStudent: 0,
  teachingClasses: 0,
  closedClasses: 0,
  upcomingClasses: 0,
  paymentInfo: [],
  activeClasses: [],
  recentlySalary: {} as RecentlySalary
};

const DashboardRefactored: React.FC = () => {
  // Use custom hook for data fetching and state management
  const { data, loading, error } = useDashboardData({
    initialData: initialDashboardData,
    fetchFunction: getTeacherDashboardAPI
  });

  return (
    <DashboardLayout role="teacher">
      <LoadingErrorWrapper loading={loading} error={error}>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            {/* Statistics Section */}
            <Grid item xs={12}>
              <DashboardStats data={data} />
            </Grid>

            {/* Active Classes */}
            <Grid item xs={12} md={6}>
              <ActiveClassesList
                classes={data.activeClasses}
                loading={loading}
              />
            </Grid>

                        {/* Payment Information */}
            <Grid item xs={12} md={6}>
              <PaymentInfoPanel
                paymentInfo={data.paymentInfo}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </LoadingErrorWrapper>
    </DashboardLayout>
  );
};

export default DashboardRefactored;
