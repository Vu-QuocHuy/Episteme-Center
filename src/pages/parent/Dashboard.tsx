import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Divider, Chip, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon, School as SchoolIcon, TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon, Schedule as ScheduleIcon, Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getParentDashboardAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';

interface Child {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate: number;
}

interface PaymentInfo {
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface UpcomingClass {
  id: string;
  className: string;
  childName: string;
  date: string;
  time: string;
  teacher: string;
  room?: string;
}

interface DashboardData {
  totalChildren: number;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  totalPayments: number;
  pendingPayments: number;
  children: Child[];
  paymentInfo: PaymentInfo[];
  upcomingClasses: UpcomingClass[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalChildren: 0,
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    totalPayments: 0,
    pendingPayments: 0,
    children: [],
    paymentInfo: [],
    upcomingClasses: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getParentDashboardAPI(user?.id || '');
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu dashboard');
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

  const formatTime = (timeString: string): string => {
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'đã thanh toán':
        return 'success';
      case 'pending':
      case 'chờ thanh toán':
        return 'warning';
      case 'overdue':
      case 'quá hạn':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'đã thanh toán':
        return 'Đã thanh toán';
      case 'pending':
      case 'chờ thanh toán':
        return 'Chờ thanh toán';
      case 'overdue':
      case 'quá hạn':
        return 'Quá hạn';
      default:
        return status;
    }
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
              title="Lớp học"
              value={dashboardData.totalClasses}
              icon={<SchoolIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang học"
              value={dashboardData.activeClasses}
              icon={<TrendingUpIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Thanh toán"
              value={formatCurrency(dashboardData.totalPayments)}
              icon={<PaymentIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Children List */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Con của tôi
                </Typography>
                <List>
                  {dashboardData.children.map((child, index) => (
                    <React.Fragment key={child.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={child.name}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {child.grade && `${child.grade}${child.section ? ` - ${child.section}` : ''}`}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={1}>
                                <Typography variant="body2" sx={{ mr: 2 }}>
                                  {child.activeClasses} lớp đang học
                                </Typography>
                                <Typography variant="body2">
                                  {child.attendanceRate}% tham gia
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={child.attendanceRate}
                                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.children.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {dashboardData.children.length === 0 && (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="textSecondary">
                      Chưa có thông tin con
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Classes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lớp học sắp tới
                </Typography>
                <List>
                  {dashboardData.upcomingClasses.map((classItem, index) => (
                    <React.Fragment key={classItem.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <ScheduleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classItem.className}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {classItem.childName} • {classItem.teacher}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {formatDate(classItem.date)} • {formatTime(classItem.time)}
                                {classItem.room && ` • ${classItem.room}`}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.upcomingClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {dashboardData.upcomingClasses.length === 0 && (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="textSecondary">
                      Không có lớp học sắp tới
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tóm tắt thanh toán
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tháng/Năm</TableCell>
                        <TableCell align="right">Tổng tiền</TableCell>
                        <TableCell align="right">Đã thanh toán</TableCell>
                        <TableCell align="right">Còn lại</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.paymentInfo.map((payment) => (
                        <TableRow key={`${payment.month}-${payment.year}`}>
                          <TableCell>
                            {payment.month}/{payment.year}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(payment.totalAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(payment.paidAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(payment.totalAmount - payment.paidAmount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(payment.status)}
                              color={getStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {dashboardData.paymentInfo.length === 0 && (
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
