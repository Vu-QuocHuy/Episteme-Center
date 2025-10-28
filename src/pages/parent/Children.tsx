import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Avatar,
  Chip, LinearProgress, Alert, Button,
  Dialog, DialogContent, Divider, Collapse,ListItemIcon, IconButton,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon, School as SchoolIcon, Person as PersonIcon,
  TrendingUp as TrendingUpIcon, Class as ClassIcon,
      Schedule as ScheduleIcon, Description as DescriptionIcon,
    Percent as PercentIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
    Close as CloseIcon, AttachMoney as AttachMoneyIcon, Group as GroupIcon, Event as EventIcon, AssignmentLate as AssignmentLateIcon,
    ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentByIdAPI } from '../../services/parents';
import { getClassByIdAPI } from '../../services/classes';
import { getStudentByIdAPI } from '../../services/students';
import { getSessionsByStudentAPI } from '../../services/sessions';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';

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
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate: number;
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
          // Normalize class entries: prefer nested class fields
          const classes = rawClasses.map((c: any) => ({
            id: String(c.classId || c.id || c.class?.id || ''),
            classId: c.classId || c.id || c.class?.id,
            status: c.status || c.classStatus,
            enrollmentDate: c.enrollmentDate,
            feePerLesson: c.feePerLesson || c.class?.feePerLesson,
            schedule: c.schedule || c.class?.schedule,
            description: c.description || c.class?.description,
            grade: c.grade || c.class?.grade,
            room: c.room || c.class?.room,
            name: c.name || c.class?.name,
            discountPercent: c.discountPercent,
          }));
          // eslint-disable-next-line no-console
          console.log('[Children] Mapped classes for', s.id, classes);
          const classCount = classes.length;
          const activeCount = classes.filter((c: any) => (c.status) === 'active').length;
          const completedCount = classes.filter((c: any) => (c.status) === 'completed').length;
          return {
            id: s.id,
            studentId: s.id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            totalClasses: classCount,
            activeClasses: activeCount,
            completedClasses: completedCount,
            attendanceRate: 0,
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
            totalClasses: 0,
            activeClasses: 0,
            completedClasses: 0,
            attendanceRate: 0,
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

  const formatScheduleCompat = (schedule: any): string => {
    if (!schedule || typeof schedule !== 'object') return '-';
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const daysArr: number[] = schedule.days_of_week || schedule.dayOfWeeks || [];
    const days = Array.isArray(daysArr) ? daysArr.map((d) => dayNames[d] || '').filter(Boolean).join(', ') : '';
    const startTime = schedule.time_slots?.start_time || schedule.timeSlots?.startTime;
    const endTime = schedule.time_slots?.end_time || schedule.timeSlots?.endTime;
    const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : '';
    const startDate = schedule.start_date || schedule.startDate;
    const endDate = schedule.end_date || schedule.endDate;
    const dateStr = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
      : '';
    return [days, timeStr, dateStr].filter(Boolean).join(' | ') || '-';
  };

  const getStatusColor = (status: any): 'success' | 'warning' | 'error' | 'default' => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    switch (s) {
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

  const getStatusLabel = (status: any): string => {
    if (!status) return 'Không rõ';
    const s = String(status).toLowerCase();
    switch (s) {
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
        return String(status);
    }
  };

  const handleViewChildDetails = async (child: Child): Promise<void> => {
    setSelectedChild(child);
    setChildDetailsOpen(true);
    setDetailLoading(true);
    try {
      // 1) Always get sessions to ensure attendance and derive classIds if needed
      let derivedClassIds: string[] = [];
      try {
        const att = await getSessionsByStudentAPI(String((child as any).studentId || child.id));
        const payload: any = (att as any)?.data?.data || (att as any)?.data || att || {};
        const sessionsList: any[] = Array.isArray(payload?.result) ? payload.result
          : Array.isArray(payload) ? payload
          : Array.isArray(payload?.sessions) ? payload.sessions
          : [];
        // Normalize attendance summary
        const totalSessions = sessionsList.length;
        const presentSessions = sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'present').length;
        const absentSessions = sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'absent').length;
        const lateSessions = sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'late').length;
        const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;
        setAttendanceData({ totalSessions, presentSessions, absentSessions, lateSessions, attendanceRate, sessions: sessionsList });
        const ids = new Set<string>();
        sessionsList.forEach((s: any) => {
          const cid = s?.class?.id || s?.classId || s?.class_id || s?.classID || s?.classroom?.id || s?.classInfo?.id;
          if (cid) ids.add(String(cid));
        });
        derivedClassIds = Array.from(ids);
        // eslint-disable-next-line no-console
        console.log('Derived classIds from sessions:', derivedClassIds);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('getSessionsByStudentAPI failed or returned no sessions', e);
      }

      // 2) Prefer class IDs from student detail, fallback to derived from sessions
      const classes: any[] = Array.isArray((child as any).classes) && (child as any).classes.length > 0
        ? (child as any).classes
        : derivedClassIds.map((id) => ({ classId: id }));
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
            Quản lý con cái
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
                    <Typography variant="h4">{childrenData.totalChildren}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng số con
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
                    <Typography variant="h4">{childrenData.totalClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng lớp học
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
                    <Typography variant="h4">{childrenData.activeClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đang học
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
                    <Typography variant="h4">{childrenData.completedClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đã hoàn thành
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
                        <Typography variant="body2" color="textSecondary">
                          {child.grade && `${child.grade}${child.section ? ` - ${child.section}` : ''}`}
                        </Typography>
                        {child.dateOfBirth && (
                          <Typography variant="body2" color="textSecondary">
                            Sinh ngày: {formatDate(child.dateOfBirth)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box />
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Lớp đang học
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {child.activeClasses}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Tỷ lệ tham gia
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {child.attendanceRate}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Lớp đã hoàn thành
                      </Typography>
                      <Typography variant="h6" color="default">
                        {child.completedClasses}
                      </Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={child.attendanceRate}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

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
        <Dialog
          open={childDetailsOpen}
          onClose={handleCloseChildDetails}
          maxWidth="md"
          fullWidth
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">
              Chi tiết học sinh: {selectedChild?.name}
            </Typography>
            <IconButton
              onClick={handleCloseChildDetails}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 3 }}>
            {detailLoading && (
              <Box sx={{ py: 2 }}>
                <LinearProgress />
              </Box>
            )}

            {selectedChild && (
              <Box>
                {/* Danh sách lớp học */}
                <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
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
                                <Typography variant="h6" color="primary">
                                  {classData.name || 'Tên lớp không xác định'}
                    </Typography>
                                <Chip
                                  label={getStatusLabel(classData.status)}
                                  color={getStatusColor(classData.status)}
                                  size="small"
                                />
                                <Chip
                                  label={`Khối ${classData.grade || 'N/A'}`}
                                  variant="outlined"
                                  size="small"
                                />
                                <Chip
                                  label={`Phòng ${classData.room || 'N/A'}`}
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
                              <Grid container spacing={2}>
                                {/* Teacher Info */}
                                <Grid item xs={12} md={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle2" color="primary">
                                      Thông tin giáo viên
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {classData.teacher?.name || 'Chưa phân công'}
                                  </Typography>
                                  {classData.teacher?.email && (
                                    <Typography variant="body2" color="textSecondary">
                                      {classData.teacher.email}
                                    </Typography>
                                  )}
                                </Grid>

                                {/* Enrollment Info */}
                                <Grid item xs={12} md={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle2" color="primary">
                                      Thông tin đăng ký
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    Sĩ số: {classData.students?.length || 0} học sinh
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Ngày bắt đầu: {classData.startDate ? formatDate(classData.startDate) : 'N/A'}
                                  </Typography>
                                </Grid>

                                {/* Fee Info */}
                                <Grid item xs={12} md={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                    <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle2" color="primary">
                                      Học phí
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {classData.feePerLesson ? `${classData.feePerLesson.toLocaleString('vi-VN')} VND/buổi` : 'Chưa cập nhật'}
                                  </Typography>
                                  {classData.discountPercent && (
                                    <Typography variant="body2" color="success.main">
                                      Giảm giá: {classData.discountPercent}%
                                    </Typography>
                                  )}
                                </Grid>

                                {/* Schedule Info */}
                                <Grid item xs={12} md={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle2" color="primary">
                                      Lịch học
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {formatScheduleCompat(classData.schedule)}
                                  </Typography>
                                </Grid>

                                {/* Learning Progress */}
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle2" color="primary">
                                      Tiến độ học tập
                                    </Typography>
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={classData.progress || 0}
                                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                    />
                                    <Typography variant="body2" color="primary">
                                      {classData.progress || 0}%
                                    </Typography>
                                  </Box>
                                </Grid>

                                                                 {/* Description */}
                                 {classData.description && (
                                   <Grid item xs={12}>
                                     <Box display="flex" alignItems="center" mb={1}>
                                       <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                                       <Typography variant="subtitle2" color="primary">
                                         Mô tả
                                       </Typography>
                                     </Box>
                                     <Typography variant="body2">
                                       {classData.description}
                                     </Typography>
                                   </Grid>
                                 )}
                               </Grid>

                               {/* Thông tin điểm danh cho lớp này */}
                               {attendanceData && attendanceData.sessions && (
                                 <>
                                   <Divider sx={{ my: 3 }} />
                                   <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                                     Thông tin điểm danh
                                   </Typography>

                                   <Grid container spacing={2} sx={{ mb: 3 }}>
                                     <Grid item xs={12} sm={6} md={3}>
                                       <StatCard
                                         title="Tổng số buổi"
                                         value={attendanceData.totalSessions || 0}
                                         icon={<EventIcon />}
                                         color="primary"
                                       />
                                     </Grid>
                                     <Grid item xs={12} sm={6} md={3}>
                                       <StatCard
                                         title="Có mặt"
                                         value={attendanceData.presentSessions || 0}
                                         icon={<CheckCircleIcon />}
                                         color="success"
                                       />
                                     </Grid>
                                     <Grid item xs={12} sm={6} md={3}>
                                       <StatCard
                                         title="Vắng"
                                         value={attendanceData.absentSessions || 0}
                                         icon={<CancelIcon />}
                                         color="error"
                                       />
                                     </Grid>
                                     {(attendanceData.lateSessions || 0) > 0 && (
                                       <Grid item xs={12} sm={6} md={3}>
                                         <StatCard
                                           title="Đi muộn"
                                           value={attendanceData.lateSessions || 0}
                                           icon={<AssignmentLateIcon />}
                                           color="warning"
                                         />
                                       </Grid>
                                     )}
                                     <Grid item xs={12} sm={6} md={3}>
                                       <StatCard
                                         title="Tỷ lệ tham gia"
                                         value={`${attendanceData.attendanceRate || 0}%`}
                                         icon={<PercentIcon />}
                                         color="info"
                                       />
                                     </Grid>
                                   </Grid>

                                   <Card>
                                     <CardContent>
                                       <Typography variant="h6" gutterBottom>
                                         Danh sách buổi học
                                       </Typography>
                                       <List>
                                         {(attendanceData.sessions || []).map((session: any, index: number) => (
                                           <ListItem key={index} divider>
                                             <ListItemIcon>
                                               {session.status === 'present' && <CheckCircleIcon color="success" />}
                                               {session.status === 'absent' && <CancelIcon color="error" />}
                                               {session.status === 'late' && <AssignmentLateIcon color="warning" />}
                                               {!session.status && <EventIcon color="disabled" />}
                                             </ListItemIcon>
                                             <ListItemText
                                               primary={`Buổi ${index + 1} - ${session.date ? formatDate(session.date) : 'N/A'}`}
                                               secondary={session.note || 'Không có ghi chú'}
                                             />
                                           </ListItem>
                                         ))}
                                       </List>
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
          </DialogContent>
        </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
