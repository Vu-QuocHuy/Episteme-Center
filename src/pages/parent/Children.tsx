import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar,
  Chip, LinearProgress, Alert, Button,
  Divider, Collapse, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon, School as SchoolIcon, Person as PersonIcon,
  TrendingUp as TrendingUpIcon, Class as ClassIcon,
      Schedule as ScheduleIcon, Description as DescriptionIcon,
    Percent as PercentIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
    AttachMoney as AttachMoneyIcon, Event as EventIcon, AssignmentLate as AssignmentLateIcon,
    ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, MeetingRoom as RoomIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentByIdAPI } from '../../services/parents';
import { getClassByIdAPI } from '../../services/classes';
import { getStudentByIdAPI } from '../../services/students';
import BaseDialog from '../../components/common/BaseDialog';
import { getSessionsByStudentAPI } from '../../services/sessions';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import { getStudentStatus } from '../../utils/studentHelpers';

interface ChildClass {
  id?: string;
  name: string;
  teacher?: string;
  schedule?: any;
  status: string;
  grade?: string;
  section?: string;
  attendanceRate?: number;
  progress?: number;
}

interface Child {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate?: number;
  classes: ChildClass[];
}

interface ChildrenData {
  children: Child[];
  totalChildren: number;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
}

const Children: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [childrenData, setChildrenData] = useState<ChildrenData>({
    children: [],
    totalChildren: 0,
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0
  });
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childDetailsOpen, setChildDetailsOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [classDetails, setClassDetails] = useState<Record<string, any>>({});
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchChildrenData();
    }
  }, [user]);

  const fetchChildrenData = async (): Promise<void> => {
    try {
      setLoading(true);
      const parentId = (user as any)?.parentId || localStorage.getItem('parent_id') || user?.id || '';
      const res = await getParentByIdAPI(String(parentId));
      const parentPayload = (res as any)?.data?.data ?? (res as any)?.data;
      const students = Array.isArray(parentPayload?.students) ? parentPayload.students : [];
      // Fetch each student details to get academic info and class ids
      const detailed = await Promise.all(students.map(async (s: any) => {
        try {
          const det = await getStudentByIdAPI(String(s.id));
          // eslint-disable-next-line no-console
          console.log('[Children] GET /students/:id raw response for', s.id, det);
          const payload: any = (det as any)?.data?.data || (det as any)?.data || det || {};
          // eslint-disable-next-line no-console
          console.log('[Children] Parsed student payload for', s.id, payload);
          const rawClasses: any[] = Array.isArray(payload?.classes) ? payload.classes
            : Array.isArray(payload?.enrolledClasses) ? payload.enrolledClasses
            : Array.isArray(payload?.classIds) ? payload.classIds.map((id: any) => ({ classId: id }))
            : [];
          // Normalize class entries: API returns {discountPercent, class: {...}, isActive}
          const classes = rawClasses.map((c: any) => {
            // If class data is nested under 'class' property
            const classData = c.class || c;
            return {
              id: String(classData.id || c.classId || ''),
              classId: classData.id || c.classId,
              name: classData.name,
              grade: classData.grade,
              section: classData.section,
              room: classData.room,
              feePerLesson: classData.feePerLesson,
              schedule: classData.schedule,
              description: classData.description,
              status: c.isActive ? 'active' : 'inactive',
              isActive: c.isActive,
              discountPercent: c.discountPercent,
              enrollmentDate: c.enrollmentDate,
            };
          });
          // eslint-disable-next-line no-console
          console.log('[Children] Mapped classes for', s.id, classes);
          const classCount = classes.length;
          const activeCount = classes.filter((c: any) => c.isActive === true).length;
          const completedCount = classes.filter((c: any) => c.isActive === false).length;

          return {
            id: s.id,
            studentId: s.id,
            name: s.name || payload.name,
            email: s.email || payload.email,
            phone: s.phone || payload.phone,
            dateOfBirth: payload.dayOfBirth,
            address: payload.address,
            gender: payload.gender,
            totalClasses: classCount,
            activeClasses: activeCount,
            completedClasses: completedCount,
            classes: classes,
          } as Child;
        } catch {
          // eslint-disable-next-line no-console
          console.warn('[Children] GET /students/:id failed for', s.id);
          return {
            id: s.id,
            studentId: s.id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            address: (s as any).address,
            gender: (s as any).gender,
            totalClasses: 0,
            activeClasses: 0,
            completedClasses: 0,
            classes: [],
          } as Child;
        }
      }));

      setChildrenData({
        children: detailed,
        totalChildren: detailed.length,
        totalClasses: detailed.reduce((sum, c) => sum + (c.totalClasses || 0), 0),
        activeClasses: detailed.reduce((sum, c) => sum + (c.activeClasses || 0), 0),
        completedClasses: detailed.reduce((sum, c) => sum + (c.completedClasses || 0), 0),
      });
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin con');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderLabel = (gender?: string): string => {
    if (!gender) return 'Chưa cập nhật';
    const g = gender.toString().toLowerCase();
    if (g === 'male' || g === 'nam') return 'Nam';
    if (g === 'female' || g === 'nữ' || g === 'nu') return 'Nữ';
    if (g === 'other' || g === 'khác') return 'Khác';
    return gender;
  };

  const handleViewChildDetails = async (child: Child): Promise<void> => {
    setSelectedChild(child);
    setChildDetailsOpen(true);
    setDetailLoading(true);
    try {
      // Luôn gọi API thống kê điểm danh khi mở dialog chi tiết
        try {
          const att = await getSessionsByStudentAPI(String((child as any).studentId || child.id));
          const payload: any = (att as any)?.data?.data || (att as any)?.data || att || {};
        const sessionsList: any[] = Array.isArray(payload?.detailedAttendance)
          ? payload.detailedAttendance
          : Array.isArray(payload?.result)
            ? payload.result
            : Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.sessions)
                ? payload.sessions
            : [];

          const stats = payload.attendanceStats || {
            totalSessions: sessionsList.length,
            presentSessions: sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'present').length,
            absentSessions: sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'absent').length,
            lateSessions: sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'late').length,
          };

          const attendanceRate = stats.totalSessions > 0
            ? Math.round(((stats.presentSessions + stats.lateSessions) / stats.totalSessions) * 100)
            : 0;

          setAttendanceData({
            ...stats,
            attendanceRate,
            sessions: sessionsList
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('getSessionsByStudentAPI failed or returned no sessions', e);
          setAttendanceData({
            totalSessions: 0,
            presentSessions: 0,
            absentSessions: 0,
            lateSessions: 0,
            attendanceRate: 0,
            sessions: []
          });
      }

      // 2) Use class IDs from student detail
      const classes: any[] = Array.isArray((child as any).classes) && (child as any).classes.length > 0
        ? (child as any).classes
        : [];
      // eslint-disable-next-line no-console
      console.log('Class IDs used for fetching details:', classes.map((c: any) => c.classId || c.id));

      // 3) Fetch class details for each class id
      const classPromises = classes.map(async (c: any) => {
        const classId = String(c.classId || c.id || '');
        if (!classId) return { classId, classData: null };
        try {
          const res = await getClassByIdAPI(classId);
          const classData = (res as any)?.data?.data || (res as any)?.data || res;
          return { classId, classData };
        } catch {
          return { classId, classData: null };
        }
      });
      const classResults = await Promise.all(classPromises);
      // eslint-disable-next-line no-console
      console.log('Fetched class details count:', classResults.filter(r => r.classData).length);
      const map: Record<string, any> = {};
      classResults.forEach((r) => { if (r.classId) map[r.classId] = r; });
      setClassDetails(map);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseChildDetails = (): void => {
    setChildDetailsOpen(false);
    setSelectedChild(null);
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
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Thông tin con
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FamilyIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Tổng số con
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.totalChildren}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Tổng lớp học
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.totalClasses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đang học
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.activeClasses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ClassIcon sx={{ mr: 2, fontSize: 40, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đã kết thúc
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.completedClasses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Children List */}
        <Grid container spacing={3}>
          {childrenData.children.map((child) => (
            <Grid item xs={12} md={6} key={child.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{child.name}</Typography>
                      </Box>
                    </Box>
                    <Box />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">
                          {child.phone || 'Chưa có số điện thoại'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {child.email || 'Chưa có email'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          Năm sinh
                        </Typography>
                        <Typography variant="body1">
                          {child.dateOfBirth
                            ? new Date(child.dateOfBirth).getFullYear()
                            : 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          Giới tính
                        </Typography>
                        <Typography variant="body1">
                          {getGenderLabel(child.gender)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Tổng lớp học
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {child.totalClasses}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Lớp đang học
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {child.activeClasses}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Lớp đã kết thúc
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {child.completedClasses}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleViewChildDetails(child)}
                    >
                      Xem chi tiết
                    </Button>

                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {childrenData.children.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              Chưa có thông tin con
            </Typography>
          </Box>
        )}

        {/* Child Details Dialog */}
        <BaseDialog
          open={childDetailsOpen}
          onClose={handleCloseChildDetails}
          title="Chi tiết học sinh"
          subtitle={selectedChild?.name}
          icon={<PersonIcon sx={{ fontSize: 28, color: 'white' }} />}
          maxWidth="md"
          loading={detailLoading}
          contentPadding={0}
        >
          <Box sx={{ p: 4 }}>
            {detailLoading && (
              <Box sx={{ py: 2 }}>
                <LinearProgress />
              </Box>
            )}

            {selectedChild && (
              <Box>
                {/* Danh sách lớp học */}
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                  Danh sách lớp học
                </Typography>

                                <Grid container spacing={2}>
                  {Object.values(classDetails).map((classDetail: any) => {
                    if (!classDetail?.classData) return null;
                    const classData = classDetail.classData;
                    const classId = classDetail.classId;
                    const expanded = expandedClasses[classId] || false;

                    return (
                      <Grid item xs={12} key={classId}>
                        <Card sx={{ mb: 2 }}>
                          <CardContent>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => setExpandedClasses(prev => ({
                                ...prev,
                                [classId]: !prev[classId]
                              }))}
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  Lớp {classData.name || 'Không xác định'}
                                </Typography>
                                {(() => {
                                  const enrollment = (selectedChild as any)?.classes?.find((c: any) =>
                                    (c.id === classId || c.classId === classId)
                                  );
                                  const statusConfig = getStudentStatus(
                                    classData.status,
                                    enrollment?.isActive === true
                                  );
                                  return (
                                    <Chip
                                      label={statusConfig.label}
                                      size="small"
                                      sx={{
                                        bgcolor: statusConfig.bgColor,
                                        color: statusConfig.color,
                                        fontWeight: 600,
                                      }}
                                    />
                                  );
                                })()}
                                <Chip
                                  label={`Khối ${classData.grade || 'N/A'}`}
                                  variant="outlined"
                                  size="small"
                                />
                              </Box>
                              <IconButton size="small">
                                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>

                            <Collapse in={expanded}>
                              <Divider sx={{ my: 2 }} />

                              {/* Thông tin cơ bản */}
                              <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                  Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={3}>
                                  {/* Room */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <RoomIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Phòng học
                                        </Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                        {classData.room || 'Chưa xác định'}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Fee */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <AttachMoneyIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Học phí / buổi
                                        </Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', pl: 3 }}>
                                        {classData.feePerLesson
                                          ? `${classData.feePerLesson.toLocaleString('vi-VN')} ₫`
                                          : 'Chưa xác định'}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Discount */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <PercentIcon sx={{ fontSize: 18, mr: 0.5, color: 'warning.main' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Giảm giá
                                        </Typography>
                                      </Box>
                                      {(() => {
                                        const originalClass = (selectedChild as any)?.classes?.find((c: any) =>
                                          (c.id === classId || c.classId === classId)
                                        );
                                        const discountPercent = originalClass?.discountPercent;

                                        return (
                                          <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 600, pl: 3 }}
                                            color={discountPercent ? "warning.main" : "text.secondary"}
                                          >
                                            {discountPercent ? `${discountPercent}%` : 'Không có'}
                                          </Typography>
                                        );
                                      })()}
                                    </Box>
                                  </Grid>

                                  {/* Teacher */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Giáo viên
                                        </Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                        {classData.teacher?.name || 'Chưa phân công'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Paper>

                              {/* Lịch học */}
                              <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <ScheduleIcon sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Lịch học
                                  </Typography>
                                </Box>
                                {classData.schedule ? (
                                  <Grid container spacing={2}>
                                    {/* Days of week */}
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Ngày học trong tuần
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(() => {
                                          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                                          const daysArr = classData.schedule.days_of_week || classData.schedule.dayOfWeeks || [];
                                          return Array.isArray(daysArr)
                                            ? daysArr.map((d: any) => dayNames[d] || '').filter(Boolean).join(', ') || '-'
                                            : '-';
                                        })()}
                                      </Typography>
                                    </Grid>

                                    {/* Time slots */}
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Giờ học
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(() => {
                                          const startTime = classData.schedule.time_slots?.start_time || classData.schedule.timeSlots?.startTime;
                                          const endTime = classData.schedule.time_slots?.end_time || classData.schedule.timeSlots?.endTime;
                                          return startTime && endTime ? `${startTime} - ${endTime}` : '-';
                                        })()}
                                      </Typography>
                                    </Grid>

                                    {/* Duration */}
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Thời gian học
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(() => {
                                          const startDate = classData.schedule.start_date || classData.schedule.startDate;
                                          const endDate = classData.schedule.end_date || classData.schedule.endDate;
                                          return startDate && endDate
                                            ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
                                            : '-';
                                        })()}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Chưa có lịch học
                                  </Typography>
                                )}
                              </Paper>

                              {/* Description */}
                              {classData.description && (
                                <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                    <DescriptionIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                      Mô tả lớp học
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                                    {classData.description}
                                  </Typography>
                                </Paper>
                              )}

                               {/* Thông tin điểm danh cho lớp này */}
                               {attendanceData && attendanceData.sessions && (
                                 <>
                                   <Divider sx={{ my: 3 }} />
                                   <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
                                     Thông tin điểm danh
                                   </Typography>

                                   {(() => {
                                     // Calculate stats for this specific class
                                     const classSessions = (attendanceData.sessions || [])
                                       .filter((session: any) => {
                                         const sessionClassId = session?.class?.id || session?.classId;
                                         return sessionClassId === classId;
                                       });

                                     const totalSessions = classSessions.length;
                                     const presentSessions = classSessions.filter((s: any) =>
                                       String(s?.status || '').toLowerCase() === 'present'
                                     ).length;
                                     const absentSessions = classSessions.filter((s: any) =>
                                       String(s?.status || '').toLowerCase() === 'absent'
                                     ).length;
                                     const lateSessions = classSessions.filter((s: any) =>
                                       String(s?.status || '').toLowerCase() === 'late'
                                     ).length;

                                     return (
                                       <Grid container spacing={2} sx={{ mb: 3 }}>
                                         <Grid item xs={12} sm={6} md={4}>
                                           <StatCard
                                             title="Tổng số buổi"
                                             value={totalSessions}
                                             icon={<EventIcon />}
                                             color="primary"
                                           />
                                         </Grid>
                                         <Grid item xs={12} sm={6} md={4}>
                                           <StatCard
                                             title="Có mặt"
                                             value={presentSessions}
                                             icon={<CheckCircleIcon />}
                                             color="success"
                                           />
                                         </Grid>
                                         <Grid item xs={12} sm={6} md={4}>
                                           <StatCard
                                             title="Vắng"
                                             value={absentSessions}
                                             icon={<CancelIcon />}
                                             color="error"
                                           />
                                         </Grid>
                                         {lateSessions > 0 && (
                                           <Grid item xs={12} sm={6} md={4}>
                                             <StatCard
                                               title="Đi muộn"
                                               value={lateSessions}
                                               icon={<AssignmentLateIcon />}
                                               color="warning"
                                             />
                                           </Grid>
                                         )}
                                       </Grid>
                                     );
                                   })()}

                                   <Card>
                                     <CardContent>
                                       <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                                         Danh sách buổi học
                                       </Typography>
                                       <TableContainer component={Paper} variant="outlined">
                                         <Table>
                                           <TableHead>
                                             <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                                               <TableCell sx={{ fontWeight: 700 }}>Buổi học</TableCell>
                                               <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                                               <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                               <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                                             </TableRow>
                                           </TableHead>
                                           <TableBody>
                                             {(attendanceData.sessions || [])
                                               .filter((session: any) => {
                                                 // Filter sessions for this specific class
                                                 const sessionClassId = session?.class?.id || session?.classId;
                                                 return sessionClassId === classId;
                                               })
                                               .map((session: any, index: number) => {
                                               const getStatusConfig = (status: string) => {
                                                 switch (status?.toLowerCase()) {
                                                   case 'present':
                                                     return {
                                                       label: 'Có mặt',
                                                       color: 'success' as const,
                                                       icon: <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                   case 'absent':
                                                     return {
                                                       label: 'Vắng mặt',
                                                       color: 'error' as const,
                                                       icon: <CancelIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                   case 'late':
                                                     return {
                                                       label: 'Đi muộn',
                                                       color: 'warning' as const,
                                                       icon: <AssignmentLateIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                   default:
                                                     return {
                                                       label: 'Chưa xác định',
                                                       color: 'default' as const,
                                                       icon: <EventIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                 }
                                               };

                                               const statusConfig = getStatusConfig(session.status);

                                               return (
                                                 <TableRow key={index} hover>
                                                   <TableCell>
                                                     <Typography variant="body2" fontWeight={600}>
                                                       Buổi {index + 1}
                                                     </Typography>
                                                   </TableCell>
                                                   <TableCell>
                                                     <Typography variant="body2">
                                                       {session.date ? formatDate(session.date) : '-'}
                                                     </Typography>
                                                   </TableCell>
                                                   <TableCell>
                                                     <Chip
                                                       icon={statusConfig.icon}
                                                       label={statusConfig.label}
                                                       color={statusConfig.color}
                                                       size="small"
                                                       sx={{ fontWeight: 600 }}
                                                     />
                                                   </TableCell>
                                                   <TableCell>
                                                     <Typography variant="body2" color="text.secondary">
                                                       {session.note || '-'}
                                                     </Typography>
                                                   </TableCell>
                                                 </TableRow>
                                               );
                                             })}
                                             {(() => {
                                               const filteredSessions = (attendanceData.sessions || [])
                                                 .filter((session: any) => {
                                                   const sessionClassId = session?.class?.id || session?.classId;
                                                   return sessionClassId === classId;
                                                 });

                                               if (filteredSessions.length === 0) {
                                                 return (
                                                   <TableRow>
                                                     <TableCell colSpan={4} align="center">
                                                       <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                                         Chưa có buổi học nào cho lớp này
                                                       </Typography>
                                                     </TableCell>
                                                   </TableRow>
                                                 );
                                               }
                                               return null;
                                             })()}
                                           </TableBody>
                                         </Table>
                                       </TableContainer>
                                     </CardContent>
                                   </Card>
                                 </>
                               )}
                             </Collapse>
                           </CardContent>
                         </Card>
                       </Grid>
                     );
                   })}
                 </Grid>
              </Box>
            )}
          </Box>
        </BaseDialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
