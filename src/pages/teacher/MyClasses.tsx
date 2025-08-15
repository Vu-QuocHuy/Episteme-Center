import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar,
  LinearProgress, Alert, List, ListItem, ListItemText, ListItemAvatar,
} from '@mui/material';
import {
  Class as ClassIcon, Schedule as ScheduleIcon,
  School as SchoolIcon, TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getMyClassesAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';

interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClassData {
  id: string;
  name: string;
  students?: Student[];
  studentCount?: number;
  schedule: ClassSchedule[];
  status: string;
  grade?: string;
  section?: string;
  room?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  attendanceRate?: number;
}

interface MyClassesData {
  classes: ClassData[];
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  totalStudents: number;
}

const MyClasses: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [classesData, setClassesData] = useState<MyClassesData>({
    classes: [],
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    totalStudents: 0
  });

  useEffect(() => {
    if (user) {
      fetchMyClasses();
    }
  }, [user]);

  const fetchMyClasses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getMyClassesAPI();
      if (response.data) {
        setClassesData(response.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string): string => {
    return timeString.substring(0, 5);
  };

  const formatDayOfWeek = (dayNumber: number): string => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayNumber] || `Thứ ${dayNumber}`;
  };

  const formatSchedule = (schedule: ClassSchedule[]): string => {
    if (!schedule || schedule.length === 0) return 'Chưa có lịch học';

    return schedule.map(s =>
      `${formatDayOfWeek(s.dayOfWeek)} ${formatTime(s.startTime)}-${formatTime(s.endTime)}`
    ).join(', ');
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'đang học':
        return 'success';
      case 'completed':
      case 'hoàn thành':
        return 'default';
      case 'pending':
      case 'chờ':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'đang học':
        return 'Đang học';
      case 'completed':
      case 'hoàn thành':
        return 'Hoàn thành';
      case 'pending':
      case 'chờ':
        return 'Chờ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.container}>
        <Typography variant="h4" gutterBottom>
          Lớp học của tôi
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{classesData.totalClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng số lớp
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{classesData.activeClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đang dạy
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ClassIcon sx={{ mr: 2, fontSize: 40, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="h4">{classesData.completedClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đã hoàn thành
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <GroupIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{classesData.totalStudents}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng học sinh
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Classes List */}
        <Grid container spacing={3}>
          {classesData.classes.map((classItem) => (
            <Grid item xs={12} md={6} key={classItem.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2">
                      {classItem.name}
                    </Typography>
                    <Chip
                      label={getStatusLabel(classItem.status)}
                      color={getStatusColor(classItem.status)}
                      size="small"
                    />
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <ScheduleIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Lịch học"
                        secondary={formatSchedule(classItem.schedule)}
                      />
                    </ListItem>

                    {classItem.room && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <ClassIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Phòng học"
                          secondary={classItem.room}
                        />
                      </ListItem>
                    )}

                    {classItem.grade && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Khối"
                          secondary={`${classItem.grade}${classItem.section ? ` - ${classItem.section}` : ''}`}
                        />
                      </ListItem>
                    )}

                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <GroupIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Số học sinh"
                        secondary={classItem.studentCount || (classItem.students ? classItem.students.length : 0)}
                      />
                    </ListItem>
                  </List>

                  {classItem.totalSessions !== undefined && classItem.completedSessions !== undefined && (
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          Tiến độ giảng dạy
                        </Typography>
                        <Typography variant="body2">
                          {classItem.completedSessions}/{classItem.totalSessions} buổi
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(classItem.completedSessions / classItem.totalSessions) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}

                  {classItem.attendanceRate !== undefined && (
                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary">
                        Tỷ lệ tham gia: {classItem.attendanceRate}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Xem chi tiết
                  </Button>
                  <Button size="small" color="secondary">
                    Quản lý học sinh
                  </Button>
                  <Button size="small" color="info">
                    Xem lịch học
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {classesData.classes.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              Bạn chưa có lớp học nào
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
