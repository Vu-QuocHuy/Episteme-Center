import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Tabs, Tab } from '@mui/material';
import { commonStyles } from '../../utils/styles';
import TeacherPaymentsTab from './financial/tabs/TeacherPaymentsTab';
import StudentPaymentsTab from './financial/tabs/StudentPaymentsTab';
import OtherTransactionsTab from './financial/tabs/OtherTransactionsTab';

interface TotalStatistics {
  totalStudentFees: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalTeacherSalary: number;
}

const FinancialStatisticsPanel: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [fixedTotalTeacherSalary] = useState<number>(0);
  const [totalStatistics, setTotalStatistics] = useState<TotalStatistics>({
    totalStudentFees: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0,
    totalTeacherSalary: 0
  });

  const handleStudentTotalsChange = useCallback((
    { totalStudentFees, totalPaidAmount, totalRemainingAmount }: { totalStudentFees: number; totalPaidAmount: number; totalRemainingAmount: number }
  ) => {
    setTotalStatistics(prev => ({
      ...prev,
      totalStudentFees,
      totalPaidAmount,
      totalRemainingAmount
    }));
  }, []);

  return (
    <Box>
      <Box sx={commonStyles.pageHeader}>
        <Typography sx={commonStyles.pageTitle}>Thống kê tài chính</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Tổng lương giáo viên</Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">{fixedTotalTeacherSalary.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Tổng học phí</Typography>
                <Typography variant="h5" color="info.main" fontWeight="bold">{totalStatistics.totalStudentFees.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">{totalStatistics.totalPaidAmount.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
                <Typography variant="h5" color="warning.main" fontWeight="bold">{totalStatistics.totalRemainingAmount.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3, boxShadow: 'none' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chi tiết giáo viên" />
          <Tab label="Chi tiết học sinh" />
          <Tab label="Thu chi khác" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <TeacherPaymentsTab />
          )}
          {tab === 1 && (
            <StudentPaymentsTab onTotalsChange={handleStudentTotalsChange} />
          )}
          {tab === 2 && (
            <OtherTransactionsTab />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialStatisticsPanel;
