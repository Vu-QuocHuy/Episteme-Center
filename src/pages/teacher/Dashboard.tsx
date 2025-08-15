import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Class as ClassIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getTeacherDashboardAPI } from '../../services/api';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudent: 0,
    teachingClasses: 0,
    closedClasses: 0,
    upcomingClasses: 0,
    paymentInfo: [],
    activeClasses: [],
    recentlySalary: {} as RecentlySalary
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
      const teacherId = user?.teacherId || user?.id;
      if (!teacherId) {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
        return;
      }

      const response = await getTeacherDashboardAPI(teacherId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalStudent: data.totalStudent || 0,
        teachingClasses: data.teachingClasses || 0,
        closedClasses: data.closedClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        paymentInfo: data.paymentInfo || [],
        activeClasses: data.activeClasses || [],
        recentlySalary: data.recentlySalary || {}
      });

    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const formatDayOfWeek = (dayNumber: number): string => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayNumber] || `Thứ ${dayNumber}`;
  };

  const formatSchedule = (schedule: string): string => {
    if (!schedule) return '';
    try {
      const scheduleObj = JSON.parse(schedule);
      if (Array.isArray(scheduleObj) && scheduleObj.length > 0) {
        const firstSchedule = scheduleObj[0];
        return `${formatDayOfWeek(firstSchedule.dayOfWeek)} ${formatTime(firstSchedule.startTime)} - ${formatTime(firstSchedule.endTime)}`;
      }
      return schedule;
    } catch {
      return schedule;
    }
  };

  const formatMonthYear = (month: number, year: number): string => {
    return `Tháng ${month}/${year}`;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'partial': return 'Thanh toán một phần';
      case 'pending': return 'Chờ thanh toán';
      default: return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={commonStyles.pageTitle}>
          Dashboard Giáo Viên
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng học sinh"
              value={dashboardData.totalStudent}
              icon={<PersonIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang dạy"
              value={dashboardData.teachingClasses}
              icon={<ClassIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={dashboardData.closedClasses}
              icon={<SchoolIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Buổi học sắp tới"
              value={dashboardData.upcomingClasses}
              icon={<EventIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Active Classes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClassIcon color="primary" />
                Lớp đang dạy
              </Typography>
              {dashboardData.activeClasses.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Không có lớp nào đang dạy
                </Typography>
              ) : (
                <List>
                  {dashboardData.activeClasses.map((classItem, index) => (
                    <React.Fragment key={classItem.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <ClassIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classItem.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {classItem.studentCount} học sinh • {formatSchedule(classItem.schedule)}
                              </Typography>
                              {classItem.nextLesson && (
                                <Typography variant="body2" color="primary">
                                  Buổi tiếp theo: {classItem.nextLesson}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.activeClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Recent Salary */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon color="primary" />
                Lương gần đây
              </Typography>
              {Object.keys(dashboardData.recentlySalary).length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Chưa có thông tin lương
                </Typography>
              ) : (
                <Box>
                  <Typography variant="h6" color="primary">
                    {formatMonthYear(dashboardData.recentlySalary.month, dashboardData.recentlySalary.year)}
                  </Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>
                    {formatCurrency(dashboardData.recentlySalary.totalAmount)}
                  </Typography>
                  <Chip
                    label={getStatusLabel(dashboardData.recentlySalary.status)}
                    color={getStatusColor(dashboardData.recentlySalary.status)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Đã thanh toán: {formatCurrency(dashboardData.recentlySalary.paidAmount)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Payment History */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Lịch sử lương
              </Typography>
              {dashboardData.paymentInfo.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Chưa có lịch sử lương
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tháng/Năm</TableCell>
                        <TableCell align="right">Tổng lương</TableCell>
                        <TableCell align="right">Đã thanh toán</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.paymentInfo.map((payment) => (
                        <TableRow key={`${payment.month}-${payment.year}`}>
                          <TableCell>{formatMonthYear(payment.month, payment.year)}</TableCell>
                          <TableCell align="right">{formatCurrency(payment.totalAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(payment.paidAmount)}</TableCell>
                          <TableCell align="center">
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
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
