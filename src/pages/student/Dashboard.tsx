import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getStudentDashboardAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';

interface Attendance {
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
}

interface ClassSchedule {
  start_date: string;
  end_date: string;
  days_of_week: string[];
  time_slots: {
    start_time: string;
    end_time: string;
  };
}

interface ClassItem {
  className: string;
  room: string;
  schedule: ClassSchedule;
  teacherName: string;
  status: string;
}

interface DashboardData {
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendance: Attendance;
  classList: ClassItem[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    attendance: {
      totalSessions: 0,
      attendedSessions: 0,
      attendanceRate: 0
    },
    classList: []
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
      const studentId = user?.studentId || user?.id;
      if (!studentId) {
        setError('Không tìm thấy thông tin học sinh');
        setLoading(false);
        return;
      }

      const response = await getStudentDashboardAPI(studentId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalClasses: data.totalClasses || 0,
        activeClasses: data.activeClasses || 0,
        completedClasses: data.completedClasses || 0,
        attendance: data.attendance || {
          totalSessions: 0,
          attendedSessions: 0,
          attendanceRate: 0
        },
        classList: data.classList || []
      });

    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:MM format
  };

  const formatDayOfWeek = (dayNumber: number): string => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayNumber] || `T${dayNumber}`;
  };

  const formatSchedule = (schedule: ClassSchedule): string => {
    if (!schedule) return 'Chưa có lịch học';

    const days = schedule.days_of_week.map(day => formatDayOfWeek(parseInt(day))).join(', ');
    const timeRange = `${formatTime(schedule.time_slots.start_time)} - ${formatTime(schedule.time_slots.end_time)}`;

    return `${days} | ${timeRange}`;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Đang học';
      case 'completed': return 'Đã hoàn thành';
      case 'pending': return 'Chờ khai giảng';
      default: return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="student">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={commonStyles.pageTitle}>
          Dashboard Học Sinh
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={dashboardData.totalClasses}
              icon={<ClassIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang học"
              value={dashboardData.activeClasses}
              icon={<SchoolIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã hoàn thành"
              value={dashboardData.completedClasses}
              icon={<TrendingUpIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ điểm danh"
              value={`${dashboardData.attendance.attendanceRate}%`}
              icon={<PersonIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Attendance Summary */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Thống kê điểm danh
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tổng số buổi học:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dashboardData.attendance.totalSessions}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="success.main">Đã tham gia:</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="medium">
                    {dashboardData.attendance.attendedSessions}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="error.main">Vắng mặt:</Typography>
                  <Typography variant="body2" color="error.main" fontWeight="medium">
                    {dashboardData.attendance.totalSessions - dashboardData.attendance.attendedSessions}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight="medium">Tỷ lệ điểm danh:</Typography>
                  <Chip
                    label={`${dashboardData.attendance.attendanceRate}%`}
                    color={dashboardData.attendance.attendanceRate >= 80 ? 'success' : dashboardData.attendance.attendanceRate >= 60 ? 'warning' : 'error'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Class List */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClassIcon color="primary" />
                Danh sách lớp học
              </Typography>
              {dashboardData.classList.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Chưa có lớp học nào
                </Typography>
              ) : (
                <Box>
                  {dashboardData.classList.slice(0, 5).map((classItem, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {classItem.className}
                        </Typography>
                        <Chip
                          label={getStatusLabel(classItem.status)}
                          color={getStatusColor(classItem.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Giáo viên: {classItem.teacherName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phòng: {classItem.room}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatSchedule(classItem.schedule)}
                      </Typography>
                    </Box>
                  ))}
                  {dashboardData.classList.length > 5 && (
                    <Typography variant="body2" color="primary" sx={{ textAlign: 'center', mt: 2 }}>
                      Và {dashboardData.classList.length - 5} lớp khác...
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Detailed Class Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="primary" />
                Chi tiết lớp học
              </Typography>
              {dashboardData.classList.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Chưa có lớp học nào
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Tên lớp</TableCell>
                        <TableCell>Giáo viên</TableCell>
                        <TableCell>Lịch học</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.classList.map((classItem, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {classItem.className}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Phòng: {classItem.room}
                            </Typography>
                          </TableCell>
                          <TableCell>{classItem.teacherName}</TableCell>
                          <TableCell>{formatSchedule(classItem.schedule)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(classItem.status)}
                              color={getStatusColor(classItem.status)}
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
