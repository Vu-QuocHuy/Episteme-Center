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
  LinearProgress,
  Alert,
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
  totalSalary: number;
  totalPaidAmount: number;
  totalUnPaidAmount: number;
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
  totalLessons: number;
  salaryPerLesson: number;
  paidAmount: number;
}

interface DashboardData {
  totalStudent: number;
  teachingClasses: number;
  closedClasses: number;
  upcomingClasses: number;
  paymentInfo: PaymentInfo;
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
    paymentInfo: {
      totalSalary: 0,
      totalPaidAmount: 0,
      totalUnPaidAmount: 0
    },
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
        paymentInfo: data.paymentInfo || {
          totalSalary: 0,
          totalPaidAmount: 0,
          totalUnPaidAmount: 0
        },
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

  const formatSchedule = (schedule: any): string => {
    if (!schedule) return '';

    try {
      // Nếu schedule đã là object
      if (typeof schedule === 'object') {
        if (Array.isArray(schedule) && schedule.length > 0) {
          const firstSchedule = schedule[0];
          return `${formatDayOfWeek(firstSchedule.dayOfWeek)} ${formatTime(firstSchedule.startTime)} - ${formatTime(firstSchedule.endTime)}`;
        }
        return 'Lịch học đã được thiết lập';
      }

      // Nếu schedule là string, thử parse JSON
      const scheduleObj = JSON.parse(schedule);
      if (Array.isArray(scheduleObj) && scheduleObj.length > 0) {
        const firstSchedule = scheduleObj[0];
        return `${formatDayOfWeek(firstSchedule.dayOfWeek)} ${formatTime(firstSchedule.startTime)} - ${formatTime(firstSchedule.endTime)}`;
      }
      return schedule;
    } catch {
      return typeof schedule === 'string' ? schedule : 'Lịch học đã được thiết lập';
    }
  };

  const formatMonthYear = (month: number, year: number): string => {
    return `Tháng ${month}/${year}`;
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
                          primary={typeof classItem.name === 'string' ? classItem.name : 'Tên lớp không xác định'}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {typeof classItem.studentCount === 'number' ? classItem.studentCount : 0} học sinh • {formatSchedule(classItem.schedule)}
                              </Typography>
                              {classItem.nextLesson && (
                                <Typography variant="body2" color="primary">
                                  Buổi tiếp theo: {typeof classItem.nextLesson === 'string' ? classItem.nextLesson : 'Đã lên lịch'}
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
                    {formatMonthYear(dashboardData.recentlySalary.month || 0, dashboardData.recentlySalary.year || 0)}
                  </Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>
                    {formatCurrency((dashboardData.recentlySalary.totalLessons || 0) * (dashboardData.recentlySalary.salaryPerLesson || 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Số buổi dạy: {dashboardData.recentlySalary.totalLessons || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Lương/buổi: {formatCurrency(dashboardData.recentlySalary.salaryPerLesson || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã thanh toán: {formatCurrency(dashboardData.recentlySalary.paidAmount || 0)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Payment Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Tổng quan lương
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                      Tổng lương
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(dashboardData.paymentInfo.totalSalary || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="success.main">
                      Đã thanh toán
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(dashboardData.paymentInfo.totalPaidAmount || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="warning.main">
                      Chưa thanh toán
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount || 0)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
