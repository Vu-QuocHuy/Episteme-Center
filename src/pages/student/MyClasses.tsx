import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentScheduleAPI, getStudentDashboardAPI } from '../../services/students';
import { getClassByIdAPI } from '../../services/classes';
import { getSessionsByStudentAPI } from '../../services/sessions';
import { StudentMyClassesTable } from '../../components/features/student';
import StatCard from '../../components/common/StatCard';
import BaseDialog from '../../components/common/BaseDialog';

const MyClasses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    attendance: {
      totalSessions: 0,
      presentSessions: 0,
      absentSessions: 0,
      lateSessions: 0,
      attendanceRate: 0
    }
  });
  const [classDetailLoading, setClassDetailLoading] = useState(false);
  const [attendanceInfo, setAttendanceInfo] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      console.log('DEBUG - fetchClasses START');
      setLoading(true);
      try {
        let studentId = user?.id;
        if (user?.role === 'student' && user?.studentId) {
          studentId = user.studentId;
        }
        if (!studentId) {
          console.log('DEBUG - Không tìm thấy thông tin học sinh', user);
          throw new Error('Không tìm thấy thông tin học sinh');
        }

        // Lấy dữ liệu từ cả 2 API
        const [dashRes, scheduleRes] = await Promise.all([
          getStudentDashboardAPI(studentId).catch(() => null),
          getStudentScheduleAPI(studentId).catch(() => null)
        ]);

        // Xử lý dữ liệu dashboard cho StatCard
        if (dashRes) {
          const dashData = dashRes?.data?.data || dashRes?.data || {};
          setDashboardData({
            totalClasses: dashData.totalClasses || 0,
            activeClasses: dashData.activeClasses || 0,
            completedClasses: dashData.completedClasses || 0,
            attendance: dashData.attendance || {
              totalSessions: 0,
              presentSessions: 0,
              absentSessions: 0,
              lateSessions: 0,
              attendanceRate: 0
            }
          });
        }

        // Lấy dữ liệu từ schedule API
        const scheduleData = scheduleRes?.data?.data || [];
        const dashboardClassList = dashRes?.data?.data?.classList || [];

        if (!Array.isArray(scheduleData)) {
          console.log('DEBUG - Không có hoặc không phải mảng scheduleData:', scheduleData);
          setClasses([]);
          console.log('DEBUG - setClasses([]) do không có dữ liệu');
          return;
        }

        // Tạo map từ dashboard để tìm nhanh status và teacherName theo className
        const dashboardClassMap = new Map();
        dashboardClassList.forEach((dashboardClass: any) => {
          dashboardClassMap.set(dashboardClass.className, {
            status: dashboardClass.status,
            teacherName: dashboardClass.teacherName
          });
        });

        // Chuyển đổi dữ liệu lớp học từ schedule API và merge với dashboard API
        const realClasses = scheduleData.map((item) => {
          const classInfo = item.class;
          const schedule = classInfo.schedule;

          // Lấy thông tin từ dashboard API
          const dashboardInfo = dashboardClassMap.get(classInfo.name) || {};
          const classStatus = dashboardInfo.status || 'active'; // Mặc định là active nếu không tìm thấy
          // Ưu tiên lấy teacher từ schedule API; fallback dashboard; cuối cùng là placeholder
          const teacherName = classInfo?.teacher?.name || dashboardInfo.teacherName || 'Chưa phân công';

          // Format lịch học
          const weekdays = ['CN','T2','T3','T4','T5','T6','T7'];
          const dayText = schedule?.days_of_week?.length > 0
            ? schedule.days_of_week.map((d: string) => weekdays[Number(d)]).join(', ')
            : 'Chưa có lịch';

          const startTime = schedule?.time_slots?.start_time || '';
          const endTime = schedule?.time_slots?.end_time || '';
          let scheduleDays = dayText;
          let scheduleTime = '';
          if (startTime && endTime) {
            scheduleTime = `${startTime} - ${endTime}`;
          } else if (startTime || endTime) {
            scheduleTime = startTime || endTime;
          }

          return {
            id: classInfo.id,
            name: classInfo.name,
            teacher: teacherName,
            scheduleDays,
            scheduleTime,
            status: classStatus, // Lấy từ dashboard API (closed, upcoming, active)
            isActive: item.isActive, // Trạng thái học sinh còn học hay nghỉ giữa chừng
            enrollStatus: item.isActive ? 'active' : 'inactive',
            room: classInfo.room || 'Chưa phân phòng',
            startDate: schedule?.start_date,
            endDate: schedule?.end_date,
            grade: classInfo.grade,
            section: classInfo.section,
            year: new Date(schedule?.start_date).getFullYear(),
            discountPercent: item.discountPercent,
            enrollmentDate: new Date().toISOString() // Tạm thời set ngày hiện tại
          };
        });
        setClasses(realClasses);
        console.log('DEBUG - setClasses(realClasses):', realClasses);
      } catch (error) {
        console.log('DEBUG - Error in fetchClasses:', error);
        console.error('Error fetching classes:', error);
        setClasses([]);
        console.log('DEBUG - setClasses([]) do error');
      } finally {
        setLoading(false);
        console.log('DEBUG - fetchClasses END');
      }
    };
    fetchClasses();
  }, [user]);

  const handleOpenDialog = async (classData: any = null) => {
    if (!classData || !classData.id) return;
    setClassDetailLoading(true);
    setAttendanceLoading(true);
    setAttendanceInfo(null);

    try {
      // Lấy thông tin chi tiết lớp học từ API Get class by id
      const res = await getClassByIdAPI(classData.id);
      const detail = res?.data?.data || res?.data || res;

      // Cập nhật thông tin lớp với dữ liệu từ API
      const updatedClassData = {
        ...classData,
        ...detail,
        // Cập nhật thông tin từ API response
        name: detail.name || classData.name,
        grade: detail.grade || classData.grade,
        section: detail.section || classData.section,
        year: detail.year || classData.year,
        description: detail.description || '',
        feePerLesson: detail.feePerLesson || 0,
        status: detail.status || classData.status,
        max_student: detail.max_student || 0,
        room: detail.room || classData.room,
        schedule: detail.schedule || classData.schedule,
        // Giữ giáo viên từ dữ liệu list nếu API detail không trả về
        teacher: detail.teacher || classData.teacher || { name: 'Chưa phân công' }
      };

      setSelectedClass(updatedClassData);
    } catch (e) {
      console.error('Error fetching class details:', e);
      setSelectedClass(classData);
    } finally {
      setClassDetailLoading(false);
    }

    // Lấy thông tin điểm danh từ API Get student session
    try {
      let studentId = user?.id;
      if (user?.role === 'student' && user?.studentId) {
        studentId = user.studentId;
      }
      if (studentId) {
        const attRes = await getSessionsByStudentAPI(studentId);
        const attData = attRes?.data?.data || attRes?.data || attRes;

        // Lọc các bản ghi điểm danh đúng lớp (so sánh theo id hoặc tên lớp)
        const selectedClassId = (classData as any).id;
        const selectedClassName = (classData as any).name;
        const filteredDetailed = (attData.detailedAttendance || []).filter((a: any) =>
          (a.class?.id && a.class.id === selectedClassId) || (a.class?.name && a.class.name === selectedClassName)
        );
        const filteredAbsent = (attData.absentSessionsDetails || []).filter((a: any) =>
          (a.class?.id && a.class.id === selectedClassId) || (a.class?.name && a.class.name === selectedClassName)
        );

        // Tính thống kê điểm danh THEO LỚP đã chọn
        const attendanceStats: any = {
          totalSessions: filteredDetailed.length,
          presentSessions: filteredDetailed.filter((a: any) => a.status === 'present').length,
          absentSessions: filteredDetailed.filter((a: any) => a.status === 'absent').length,
          lateSessions: filteredDetailed.filter((a: any) => a.status === 'late').length,
          attendanceRate: 0
        };
        attendanceStats.attendanceRate = attendanceStats.totalSessions > 0
          ? Math.round(((attendanceStats.presentSessions + attendanceStats.lateSessions) / attendanceStats.totalSessions) * 100)
          : 0;

        const filteredAttendance = {
          ...attData,
          attendanceStats,
          absentSessionsDetails: filteredAbsent,
          detailedAttendance: filteredDetailed,
        };

        setAttendanceInfo(filteredAttendance);
      }
    } catch (e) {
      console.error('Error fetching attendance data:', e);
      setAttendanceInfo(null);
    } finally {
      setAttendanceLoading(false);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleTabChange = (_event: any, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredClasses = classes.filter((classItem) => {
    const name = classItem.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

    // Lọc theo tab và trạng thái (status từ dashboard API)
    let matchesStatus = true;
    if (selectedTab === 0) {
      // Tab "Đang học" - hiển thị các lớp có status = 'active' và isActive = true
      matchesStatus = classItem.status === 'active' && classItem.isActive === true;
    } else if (selectedTab === 1) {
      // Tab "Sắp khai giảng" - hiển thị các lớp có status = 'upcoming'
      matchesStatus = classItem.status === 'upcoming';
    } else if (selectedTab === 2) {
      // Tab "Đã kết thúc" - hiển thị các lớp có status = 'closed' hoặc 'completed'
      matchesStatus = classItem.status === 'closed' || classItem.status === 'completed';
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'closed') return 'error';
    if (status === 'upcoming') return 'warning';
    if (status === 'completed') return 'error';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Đang học';
    if (status === 'closed') return 'Đã kết thúc';
    if (status === 'upcoming') return 'Sắp khai giảng';
    if (status === 'completed') return 'Đã hoàn thành';
    return 'Không xác định';
  };

  // (removed unused helpers)

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, color: `${COLORS.primary}`, fontWeight: 600 }}>
            Thông tin học tập
          </Typography>

          <Grid container spacing={3}>
            {/* Stat Cards */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số lớp"
                    value={dashboardData.totalClasses || classes.length}
                    icon={<SchoolIcon sx={{ fontSize: 40 }} />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Đang học"
                    value={dashboardData.activeClasses || classes.filter((c) => c.status === 'active').length}
                    icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Đã kết thúc"
                    value={dashboardData.completedClasses || classes.filter((c) => c.status === 'closed' || c.status === 'completed').length}
                    icon={<CancelIcon sx={{ fontSize: 40 }} />}
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tỷ lệ tham gia"
                    value={typeof dashboardData.attendance.attendanceRate === 'number' ? `${dashboardData.attendance.attendanceRate}%` : ''}
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số buổi"
                    value={dashboardData.attendance.totalSessions}
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Buổi có mặt"
                    value={dashboardData.attendance.presentSessions}
                    icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Buổi vắng"
                    value={dashboardData.attendance.absentSessions}
                    icon={<CancelIcon sx={{ fontSize: 40 }} />}
                    color="error"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Buổi muộn"
                    value={dashboardData.attendance.lateSessions}
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    color="warning"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Danh sách lớp học */}
            <Grid item xs={12}>
              <Paper sx={{ p: 0, mb: 3, boxShadow: 'none', background: 'transparent' }}>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm lớp học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: '100%', background: '#fff', borderRadius: 2, boxShadow: 1 }}
                  />
                </Box>
              </Paper>

              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                sx={{ mb: 2, width: '100%' }}
                TabIndicatorProps={{ sx: { height: 4, borderRadius: 2 } }}
              >
                <Tab label="Đang học" sx={{ width: '33.33%' }} />
                <Tab label="Sắp khai giảng" sx={{ width: '33.33%' }} />
                <Tab label="Đã kết thúc" sx={{ width: '33.33%' }} />
              </Tabs>

              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <LinearProgress />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Đang tải dữ liệu lớp học...
                  </Typography>
                </Box>
              ) : filteredClasses.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchQuery ? 'Không tìm thấy lớp học phù hợp' :
                     selectedTab === 0 ? 'Chưa có lớp học nào đang diễn ra' :
                     selectedTab === 1 ? 'Chưa có lớp học nào đã kết thúc' :
                     'Chưa có lớp học nào sắp khai giảng'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Vui lòng liên hệ admin để được phân lớp'}
                  </Typography>
                </Box>
              ) : (
                <StudentMyClassesTable
                  classes={filteredClasses}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  onViewDetails={handleOpenDialog}
                />
              )}
            </Grid>
          </Grid>

          {/* Dialog xem chi tiết lớp học */}
          <BaseDialog
            open={openDialog}
            onClose={handleCloseDialog}
            title="Chi tiết lớp học"
            subtitle={selectedClass?.name}
            icon={<SchoolIcon sx={{ fontSize: 28, color: 'white' }} />}
            maxWidth="md"
            loading={classDetailLoading}
            contentPadding={0}
          >
              {selectedClass && !classDetailLoading && (
                <Box sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {/* Thông tin cơ bản */}
                    <Grid item xs={12}>
                      <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        border: '1px solid #e0e6ed',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" gutterBottom sx={{
                          color: '#2c3e50',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2
                        }}>
                          <Box sx={{
                            width: 4,
                            height: 20,
                            bgcolor: '#667eea',
                            borderRadius: 2
                          }} />
                          Thông tin lớp học
                        </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Tên lớp:
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {selectedClass.name}
                              </Typography>
                              </Box>
                            </Grid>
                                                         <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                 Giáo viên:
                               </Typography>
                               <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                 {selectedClass.teacher?.name || selectedClass.teacher || 'Chưa phân công'}
                               </Typography>
                              </Box>
                             </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Phòng học:
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {selectedClass.room}
                              </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Lịch học:
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {selectedClass.scheduleDays || 'Chưa có lịch'}
                              </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Giờ học:
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {selectedClass.scheduleTime || 'Chưa có giờ'}
                              </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Trạng thái:
                              </Typography>
                              <Chip
                                label={getStatusLabel(selectedClass.status)}
                                color={getStatusColor(selectedClass.status)}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  '& .MuiChip-icon': {
                                    fontSize: '16px'
                                  }
                                }}
                              />
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Thống kê tham gia */}
                    {selectedClass.status !== 'upcoming' && (
                      <Grid item xs={12}>
                        <Paper sx={{
                          p: 3,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                          border: '1px solid #e0e6ed',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{
                            color: '#2c3e50',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2
                          }}>
                            <Box sx={{
                              width: 4,
                              height: 20,
                              bgcolor: '#667eea',
                              borderRadius: 2
                            }} />
                            Thống kê tham gia học tập
                          </Typography>
                          {attendanceLoading ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <LinearProgress />
                              <Typography variant="body2" sx={{ mt: 1 }}>Đang tải thông tin điểm danh...</Typography>
                            </Box>
                          ) : attendanceInfo ? (
                            <Box sx={{
                              p: 2,
                              bgcolor: 'white',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                    <CardContent>
                                      <Typography variant="h4" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                        {attendanceInfo.attendanceStats?.presentSessions ?? 0}
                                      </Typography>
                                      <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                                        Buổi đã học
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #ffe0e3 0%, #ffb3ba 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                    <CardContent>
                                      <Typography variant="h4" sx={{ color: 'error.dark', fontWeight: 600 }}>
                                        {attendanceInfo.attendanceStats?.absentSessions ?? 0}
                                      </Typography>
                                      <Typography variant="body2" color="error.dark" sx={{ fontWeight: 500 }}>
                                        Buổi đã nghỉ
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #fff9e0 0%, #ffeab3 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                    <CardContent>
                                      <Typography variant="h4" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                                        {attendanceInfo.attendanceStats?.lateSessions ?? 0}
                                      </Typography>
                                      <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
                                        Buổi muộn
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #e3e0ff 0%, #b3baff 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                    <CardContent>
                                      <Typography variant="h4" sx={{ color: 'info.dark', fontWeight: 600 }}>
                                        {attendanceInfo.attendanceStats?.attendanceRate ?? 0}%
                                      </Typography>
                                      <Typography variant="body2" color="info.dark" sx={{ fontWeight: 500 }}>
                                        Tỷ lệ tham gia
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="error" sx={{ p: 2 }}>Không có dữ liệu điểm danh.</Typography>
                          )}
                        </Paper>
                      </Grid>
                    )}

                    {/* Lịch sử điểm danh */}
                    {selectedClass.status !== 'upcoming' && (
                      <Grid item xs={12}>
                        <Paper sx={{
                          p: 3,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                          border: '1px solid #e0e6ed',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{
                            color: '#2c3e50',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2
                          }}>
                            <Box sx={{
                              width: 4,
                              height: 20,
                              bgcolor: '#667eea',
                              borderRadius: 2
                            }} />
                            Lịch sử điểm danh
                          </Typography>
                          {attendanceLoading ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <LinearProgress />
                              <Typography variant="body2" sx={{ mt: 1 }}>Đang tải lịch sử điểm danh...</Typography>
                            </Box>
                          ) : attendanceInfo && attendanceInfo.detailedAttendance?.length > 0 ? (
                            <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ngày</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Trạng thái</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ghi chú</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {attendanceInfo.detailedAttendance.map((attendance: any, idx: number) => (
                                      <TableRow key={idx} hover>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                            {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={attendance.status === 'present' ? 'Có mặt' : attendance.status === 'absent' ? 'Vắng' : 'Đi muộn'}
                                            color={attendance.status === 'present' ? 'success' : attendance.status === 'absent' ? 'error' : 'warning'}
                                            size="small"
                                            icon={attendance.status === 'present' ? <CheckCircleIcon /> : attendance.status === 'absent' ? <CancelIcon /> : <ScheduleIcon />}
                                            sx={{ fontWeight: 600, '& .MuiChip-icon': { fontSize: '16px' } }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            {attendance.note || '-'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="black" align="center" sx={{ p: 2 }}>Không có dữ liệu điểm danh.</Typography>
                          )}
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
          </BaseDialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
