import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Divider, Chip, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon, TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon, Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getParentDashboardAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';

interface StudentPayment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalAmount: number;
  totalPaidAmount: number;
  totalUnPaidAmount: number;
}

interface PaymentInfo {
  totalRevenue: number;
  totalPaidAmount: number;
  totalUnPaidAmount: number;
}

interface DashboardData {
  totalChildren: number;
  paymentInfo: PaymentInfo;
  studentPayments: StudentPayment[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalChildren: 0,
    paymentInfo: {
      totalRevenue: 0,
      totalPaidAmount: 0,
      totalUnPaidAmount: 0
    },
    studentPayments: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await getParentDashboardAPI(user?.id || '');
      console.log('📊 Parent Dashboard API Response:', response);

      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalChildren: data.totalChildren || 0,
        paymentInfo: data.paymentInfo || {
          totalRevenue: 0,
          totalPaidAmount: 0,
          totalUnPaidAmount: 0
        },
        studentPayments: data.studentPayments || []
      });

    } catch (err: any) {
      console.error('Error fetching parent dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };



  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.container}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng con"
              value={dashboardData.totalChildren}
              icon={<FamilyIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng doanh thu"
              value={formatCurrency(dashboardData.paymentInfo.totalRevenue)}
              icon={<TrendingUpIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thanh toán"
              value={formatCurrency(dashboardData.paymentInfo.totalPaidAmount)}
              icon={<PaymentIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa thanh toán"
              value={formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount)}
              icon={<PaymentIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Student Payments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thanh toán của con
                </Typography>
                <List>
                  {dashboardData.studentPayments.map((student, index) => (
                    <React.Fragment key={student.studentId}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={student.studentName}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {student.studentEmail}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={1}>
                                <Typography variant="body2" sx={{ mr: 2 }}>
                                  Tổng: {formatCurrency(student.totalAmount)}
                                </Typography>
                                <Typography variant="body2">
                                  Đã trả: {formatCurrency(student.totalPaidAmount)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" mt={1}>
                                <Chip
                                  label={`Còn lại: ${formatCurrency(student.totalUnPaidAmount)}`}
                                  color={student.totalUnPaidAmount > 0 ? 'warning' : 'success'}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.studentPayments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {dashboardData.studentPayments.length === 0 && (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="textSecondary">
                      Chưa có thông tin thanh toán
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Overview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tổng quan thanh toán
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Thống kê tổng quan
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Tổng doanh thu
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(dashboardData.paymentInfo.totalRevenue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Đã thanh toán
                      </Typography>
                      <Typography variant="h6" color="info.main">
                        {formatCurrency(dashboardData.paymentInfo.totalPaidAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Chưa thanh toán
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        {formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Số con
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {dashboardData.totalChildren}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Payments Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chi tiết thanh toán của con
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên học sinh</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Tổng tiền</TableCell>
                        <TableCell align="right">Đã thanh toán</TableCell>
                        <TableCell align="right">Chưa thanh toán</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.studentPayments.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {student.studentName}
                            </Typography>
                          </TableCell>
                          <TableCell>{student.studentEmail}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(student.totalAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(student.totalPaidAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(student.totalUnPaidAmount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={student.totalUnPaidAmount > 0 ? 'Chưa thanh toán' : 'Đã thanh toán'}
                              color={student.totalUnPaidAmount > 0 ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {dashboardData.studentPayments.length === 0 && (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="textSecondary">
                      Chưa có thông tin thanh toán
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
