import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { getClassByIdAPI } from '../../../services/classes';
import AttendanceModal from './AttendanceModal';

interface Schedule {
  dayOfWeeks: number[];
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
}

interface Teacher {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface ClassData {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  status?: string;
  teacherId?: Teacher;
  schedule?: Schedule;
  capacity?: number;
  currentStudents?: number;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface ClassDetailModalProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`class-detail-tabpanel-${index}`}
      aria-labelledby={`class-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `class-detail-tab-${index}`,
    'aria-controls': `class-detail-tabpanel-${index}`,
  };
}

const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  open,
  onClose,
  classData
}) => {
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassData | null>(null);
  const [studentsDetail, setStudentsDetail] = useState<Student[]>([]);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [detailTabValue, setDetailTabValue] = useState<number>(0);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (open && classData) {
      handleOpenDetail();
    }
  }, [open, classData]);

  const handleOpenDetail = async (): Promise<void> => {
    if (!classData?.id) return;

    setLoadingDetail(true);
    try {
      // Lấy thông tin chi tiết lớp học
      const classRes = await getClassByIdAPI(classData.id);
      const payload = (classRes as any)?.data?.data || (classRes as any)?.data || {};

      const normalizedSchedule = payload?.schedule ? {
        dayOfWeeks: (payload.schedule.days_of_week || []).map((d: any) => Number(d)),
        startTime: payload.schedule.time_slots?.start_time || payload.schedule.start_time,
        endTime: payload.schedule.time_slots?.end_time || payload.schedule.end_time,
        startDate: payload.schedule.start_date,
        endDate: payload.schedule.end_date,
      } : undefined;

      const normalizedClass = {
        id: payload.id,
        name: payload.name,
        grade: payload.grade,
        section: payload.section,
        status: payload.status,
        teacherId: payload.teacher ? {
          id: payload.teacher.id,
          name: payload.teacher.name,
          email: payload.teacher.email
        } : undefined,
        schedule: normalizedSchedule,
        capacity: payload.max_student,
        currentStudents: Array.isArray(payload.students) ? payload.students.length : undefined,
        description: payload.description,
      } as any;

      setSelectedClassDetail(normalizedClass);

      // Lấy danh sách học sinh từ response data.students
      setLoadingStudents(true);
      const mappedStudents: Student[] = Array.isArray(payload?.students)
        ? payload.students.map((s: any) => ({
            id: s?.student?.id,
            name: s?.student?.name,
            email: s?.student?.email,
            phone: s?.student?.phone,
            // Map trạng thái từ API: isActivce (boolean) -> 'active' | 'inactive'
            status: s?.isActivce ? 'active' : 'inactive',
          }))
        : [];
      setStudentsDetail(mappedStudents);
    } catch (err) {
      console.error('Error loading class details:', err);
    } finally {
      setLoadingDetail(false);
      setLoadingStudents(false);
    }
  };

  const handleDetailTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setDetailTabValue(newValue);
  };

  const handleCloseAttendance = (): void => {
    setAttendanceModalOpen(false);
  };

  const formatDate = (iso?: string): string => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  const formatSchedule = (schedule: Schedule | undefined): string => {
    if (!schedule) return '';
    const parts: string[] = [];
    const days = (schedule.dayOfWeeks || [])
      .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
      .join(', ');
    if (days) parts.push(days);
    if (schedule.startTime && schedule.endTime) parts.push(`${schedule.startTime} - ${schedule.endTime}`);
    if (schedule.startDate || schedule.endDate) parts.push(`${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}`);
    return parts.join(' | ');
  };

  const getStatusColor = (status: string | undefined): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string | undefined): string => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'inactive': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Chi tiết lớp học
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedClassDetail?.name || classData?.name}
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SchoolIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loadingDetail ? (
            <Box sx={{ py: 4, px: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải chi tiết lớp học...</Typography>
            </Box>
          ) : (
            <Box>
              <Tabs
                value={detailTabValue}
                onChange={handleDetailTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab
                  label="Thông tin chung"
                  icon={<SchoolIcon />}
                  iconPosition="start"
                  {...a11yProps(0)}
                />
                <Tab
                  label="Danh sách học sinh"
                  icon={<PeopleIcon />}
                  iconPosition="start"
                  {...a11yProps(1)}
                />
                {/* Removed Lịch học tab; schedule moved into Thông tin chung */}
              </Tabs>

              <TabPanel value={detailTabValue} index={0}>
                {selectedClassDetail && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                          Thông tin cơ bản
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Tên lớp</Typography>
                            <Typography variant="body1" fontWeight="medium">{selectedClassDetail.name}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Khối - Phần</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              Khối {selectedClassDetail.grade} - Phần {selectedClassDetail.section}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                            <Chip
                              label={getStatusLabel(selectedClassDetail.status)}
                              color={getStatusColor(selectedClassDetail.status)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Sức chứa</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedClassDetail.currentStudents || 0} / {selectedClassDetail.capacity || 'Không giới hạn'} học sinh
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {selectedClassDetail.schedule && (
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                            Lịch học
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Ngày học trong tuần</Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {selectedClassDetail.schedule.dayOfWeeks?.map(day => (
                                  <Chip
                                    key={day}
                                    label={['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day]}
                                    color="primary"
                                    size="small"
                                  />
                                ))}
                              </Box>
                            </Box>
                            {selectedClassDetail.schedule.startTime && selectedClassDetail.schedule.endTime && (
                              <Box>
                                <Typography variant="body2" color="text.secondary">Giờ học</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {selectedClassDetail.schedule.startTime} - {selectedClassDetail.schedule.endTime}
                                </Typography>
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body2" color="text.secondary">Lịch học đầy đủ</Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {formatSchedule(selectedClassDetail.schedule)}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedClassDetail.description && (
                      <Grid item xs={12} md={12}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                            Mô tả
                          </Typography>
                          <Typography variant="body1">{selectedClassDetail.description}</Typography>
                        </Paper>
                      </Grid>
                    )}



                  </Grid>
                )}
              </TabPanel>

              <TabPanel value={detailTabValue} index={1}>
                {loadingStudents ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LinearProgress />
                    <Typography sx={{ mt: 2 }}>Đang tải danh sách học sinh...</Typography>
                  </Box>
                ) : studentsDetail.length > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                        Danh sách học sinh ({studentsDetail.length})
                      </Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>STT</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Họ và tên</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Số điện thoại</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentsDetail.map((student, index) => (
                            <TableRow key={student.id} hover>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight="medium">
                                  {student.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{student.email || 'Không có'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{student.phone || 'Không có'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusLabel(student.status)}
                                  color={getStatusColor(student.status)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Chưa có học sinh
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lớp học này chưa có học sinh nào được ghi danh.
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              {/* Removed Lịch học tab; schedule moved into Thông tin chung */}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              px: 3,
              py: 1,
              borderRadius: 2
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Modal */}
      <AttendanceModal
        open={attendanceModalOpen}
        onClose={handleCloseAttendance}
        classData={selectedClassDetail || classData}
      />
    </>
  );
};

export default ClassDetailModal;
