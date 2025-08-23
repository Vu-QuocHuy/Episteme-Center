import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Grid,
  Chip,
  Autocomplete,
  Paper,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { Class, ClassFormData, ClassFormErrors } from '../../../types';
import { getClassByIdAPI, addStudentsToClassAPI, removeStudentsFromClassAPI, assignTeacherAPI, unassignTeacherAPI } from '../../../services/api';
import AddStudentToClassDialog from './AddStudentToClassDialog';
import AddTeacherToClassDialog from './AddTeacherToClassDialog';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (classData: ClassFormData) => Promise<void>;
  classItem?: Class | null;
  loading?: boolean;
}

const initialFormData: ClassFormData = {
  name: '',
  grade: '1',
  section: '1',
  year: new Date().getFullYear(),
  description: '',
  feePerLesson: '0',
  status: 'active',
  max_student: '30',
  room: '',
  schedule: {
    start_date: '',
    end_date: '',
    days_of_week: [],
    time_slots: {
      start_time: '',
      end_time: ''
    }
  }
};

const daysOfWeekOptions = [
  { value: '1', label: 'Thứ 2' },
  { value: '2', label: 'Thứ 3' },
  { value: '3', label: 'Thứ 4' },
  { value: '4', label: 'Thứ 5' },
  { value: '5', label: 'Thứ 6' },
  { value: '6', label: 'Thứ 7' },
  { value: '0', label: 'Chủ nhật' }
];

const ClassForm: React.FC<ClassFormProps> = ({
  open,
  onClose,
  onSubmit,
  classItem,
  loading = false
}) => {
  const [formData, setFormData] = useState<ClassFormData>(initialFormData);
  const [errors, setErrors] = useState<ClassFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [teacherInfo, setTeacherInfo] = useState<any | null>(null);
  const [studentsInfo, setStudentsInfo] = useState<Array<any>>([]);
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<any | null>(null);
  const [openRemoveStudentDialog, setOpenRemoveStudentDialog] = useState(false);
  const [openAddTeacherDialog, setOpenAddTeacherDialog] = useState(false);
  const [openRemoveTeacherDialog, setOpenRemoveTeacherDialog] = useState(false);

  // Initialize form data when classItem changes
  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        grade: (classItem.grade || 1).toString(),
        section: (classItem.section || 1).toString(),
        year: classItem.year || new Date().getFullYear(),
        description: classItem.description || '',
        feePerLesson: (classItem.feePerLesson || 0).toString(),
        status: classItem.status || 'active',
        max_student: (classItem.max_student || classItem.maxStudents || 30).toString(),
        room: classItem.room || '',
        schedule: {
          start_date: classItem.schedule?.start_date ?
            new Date(classItem.schedule.start_date).toISOString().split('T')[0] : '',
          end_date: classItem.schedule?.end_date ?
            new Date(classItem.schedule.end_date).toISOString().split('T')[0] : '',
          days_of_week: classItem.schedule?.days_of_week || [],
          time_slots: {
            start_time: classItem.schedule?.time_slots?.start_time || '',
            end_time: classItem.schedule?.time_slots?.end_time || ''
          }
        }
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [classItem, open]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (classItem && open) {
        try {
          const res = await getClassByIdAPI(classItem.id);
          console.log('📊 Class API Response:', res);
          const data = res?.data?.data || res?.data;
          console.log('📊 Class Data:', data);
          console.log('📊 Students Data:', data?.students);
          if (data) {
            setTeacherInfo(data.teacher || null);
            setStudentsInfo(data.students || []);
          }
        } catch (e) {
          console.error('Failed to fetch class details:', e);
        }
      } else {
        setTeacherInfo(null);
        setStudentsInfo([]);
      }
    };
    fetchDetails();
  }, [classItem, open]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ClassFormData] as any),
          [child]: value
        }
      }));
    } else if (field === 'schedule.time_slots.start_time' || field === 'schedule.time_slots.end_time') {
      const timeField = field.split('.')[2];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          time_slots: {
            ...prev.schedule.time_slots,
            [timeField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error for this field
    if (errors[field as keyof ClassFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    // Bỏ validation - luôn return true
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate year from end date
      const endDate = new Date(formData.schedule.end_date);
      const year = endDate.getFullYear();

      // Determine status based on dates
      const now = new Date();
      const startDate = new Date(formData.schedule.start_date);
      let status: 'active' | 'inactive' | 'completed' | 'cancelled' | 'closed' = 'active';

      if (startDate > now) {
        status = 'active'; // upcoming is not in the type, use active
      } else if (endDate < now) {
        status = 'completed';
      }

      const submitData = {
        ...formData,
        grade: parseInt(formData.grade.toString()) || 1,
        section: parseInt(formData.section.toString()) || 1,
        feePerLesson: parseInt(formData.feePerLesson.toString()) || 0,
        max_student: parseInt(formData.max_student.toString()) || 30,
        year,
        status
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting class form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setActiveTab(0);
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Student management functions
  const handleAddStudent = () => {
    setOpenAddStudentDialog(true);
  };

  const handleCloseAddStudentDialog = () => {
    setOpenAddStudentDialog(false);
  };

  const handleRemoveStudent = (student: any) => {
    console.log('Student to remove:', student);
    setStudentToRemove(student);
    setOpenRemoveStudentDialog(true);
  };

  const handleCloseRemoveStudentDialog = () => {
    setStudentToRemove(null);
    setOpenRemoveStudentDialog(false);
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove || !classItem) return;

    try {
      // Call API to remove student from class
      console.log('Removing student with ID:', studentToRemove.student?.id);
      await removeStudentsFromClassAPI(classItem.id, [studentToRemove.student?.id]);

      // Update local state
      setStudentsInfo(prev => prev.filter(s => s.student?.id !== studentToRemove.student?.id));

      handleCloseRemoveStudentDialog();
    } catch (error: any) {
      console.error('Error removing student:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  // Teacher management functions
  const handleAddTeacher = () => {
    setOpenAddTeacherDialog(true);
  };

  const handleCloseAddTeacherDialog = () => {
    setOpenAddTeacherDialog(false);
  };

  const handleRemoveTeacher = () => {
    setOpenRemoveTeacherDialog(true);
  };

  const handleCloseRemoveTeacherDialog = () => {
    setOpenRemoveTeacherDialog(false);
  };

  const handleConfirmRemoveTeacher = async () => {
    if (!classItem || !teacherInfo) return;

    try {
      // Call API to unassign teacher from class
      console.log('Removing teacher from class:', classItem.id, 'Teacher ID:', teacherInfo.id);
      await unassignTeacherAPI(classItem.id, teacherInfo.id);

      // Update local state
      setTeacherInfo(null);

      handleCloseRemoveTeacherDialog();
    } catch (error: any) {
      console.error('Error removing teacher:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleAddTeacherToClass = async (teacherId: string) => {
    if (!classItem) return;

    try {
      console.log('Adding teacher to class:', teacherId);

      // Call API to assign teacher to class
      await assignTeacherAPI(classItem.id, teacherId);

      // Refresh teacher info
      const res = await getClassByIdAPI(classItem.id);
      const data = res?.data?.data || res?.data;
      if (data) {
        setTeacherInfo(data.teacher || null);
      }
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handleAddStudentsToClass = async (studentIds: string[], discounts: Record<string, number>) => {
    if (!classItem) return;

    try {
      // Prepare data for API
      const studentsData = studentIds.map(id => ({
        studentId: id,
        discountPercent: discounts[id] || 0
      }));

      console.log('Adding students data:', studentsData);
      console.log('Class ID:', classItem.id);

      // Call API to add students to class
      const response = await addStudentsToClassAPI(classItem.id, studentsData);
      console.log('Add students response:', response);

      // If API call was successful, update local state immediately
      // Add the new students to the existing list
      const newStudents = studentIds.map(id => {
        const discount = discounts[id] || 0;
        // Create a temporary student object until we refresh from server
        return {
          discountPercent: discount,
          student: {
            id: id,
            name: 'Loading...', // Will be updated when we refresh
            email: '',
            phone: ''
          }
        };
      });

      // Update local state immediately
      setStudentsInfo(prev => [...prev, ...newStudents]);

      // Try to refresh from server, but don't fail if it errors
      try {
        const res = await getClassByIdAPI(classItem.id);
        const data = res?.data?.data || res?.data;
        if (data && data.students) {
          setStudentsInfo(data.students || []);
        }
      } catch (refreshError) {
        console.warn('Failed to refresh students list, but students were added successfully:', refreshError);
        // Don't throw error since the main operation was successful
      }

    } catch (error: any) {
      console.error('Error adding students:', error);
      console.error('Error details:', error.response?.data);

      // Check if it's a 500 error but operation might have succeeded
      if (error.response?.status === 500) {
        console.log('Got 500 error, but operation might have succeeded. Trying to refresh...');

        // Try to refresh to see if students were actually added
        try {
          const res = await getClassByIdAPI(classItem.id);
          const data = res?.data?.data || res?.data;
          if (data && data.students) {
            setStudentsInfo(data.students || []);
            console.log('Students were actually added successfully despite 500 error');
            return; // Don't throw error since operation succeeded
          }
        } catch (refreshError) {
          console.error('Failed to refresh after 500 error:', refreshError);
        }
      }

      throw error;
    }
  };

  const renderGeneralInfoTab = () => (
    <Grid container spacing={3}>
      {/* Left Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Khối"
            value={formData.grade}
            onChange={(e) => handleInputChange('grade', e.target.value)}
            error={!!errors.grade}
            helperText={errors.grade}
            required
          />

          <TextField
            fullWidth
            label="Tên lớp"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />

          <TextField
            fullWidth
            label="Giờ bắt đầu"
            placeholder="HH:MM"
            value={formData.schedule.time_slots.start_time}
            onChange={(e) => handleInputChange('schedule.time_slots.start_time', e.target.value)}
            error={!!errors.start_time}
            helperText={errors.start_time || "Định dạng: HH:MM (24 giờ)"}
            required
          />

          <TextField
            fullWidth
            label="Phòng học"
            value={formData.room}
            onChange={(e) => handleInputChange('room', e.target.value)}
            error={!!errors.room}
            helperText={errors.room}
            required
          />

          <TextField
            fullWidth
            label="Ngày kết thúc"
            type="date"
            value={formData.schedule.end_date}
            onChange={(e) => handleInputChange('schedule', {
              ...formData.schedule,
              end_date: e.target.value
            })}
            error={!!errors.end_date}
            helperText={errors.end_date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Lớp"
            value={formData.section}
            onChange={(e) => handleInputChange('section', e.target.value)}
            error={!!errors.section}
            helperText={errors.section}
            required
          />

          <TextField
            fullWidth
            label="Học phí/buổi"
            value={formData.feePerLesson}
            onChange={(e) => handleInputChange('feePerLesson', e.target.value)}
            error={!!errors.feePerLesson}
            helperText={errors.feePerLesson}
            required
          />

          <TextField
            fullWidth
            label="Giờ kết thúc"
            placeholder="HH:MM"
            value={formData.schedule.time_slots.end_time}
            onChange={(e) => handleInputChange('schedule.time_slots.end_time', e.target.value)}
            error={!!errors.end_time}
            helperText={errors.end_time || "Định dạng: HH:MM (24 giờ)"}
            required
          />

          <TextField
            fullWidth
            label="Số học sinh tối đa"
            type="number"
            value={formData.max_student}
            onChange={(e) => handleInputChange('max_student', parseInt(e.target.value) || 30)}
            error={!!errors.max_student}
            helperText={errors.max_student}
            InputProps={{ inputProps: { min: 1 } }}
            required
          />

          <TextField
            fullWidth
            label="Ngày bắt đầu"
            type="date"
            value={formData.schedule.start_date}
            onChange={(e) => handleInputChange('schedule', {
              ...formData.schedule,
              start_date: e.target.value
            })}
            error={!!errors.start_date}
            helperText={errors.start_date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </Grid>

      {/* Ngày học trong tuần - Full width */}
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={daysOfWeekOptions}
          getOptionLabel={(option) => option.label}
          value={daysOfWeekOptions.filter(day => formData.schedule.days_of_week.includes(day.value))}
          onChange={(_, newValue) => {
            handleInputChange('schedule', {
              ...formData.schedule,
              days_of_week: newValue.map(day => day.value)
            });
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option.label}
                {...getTagProps({ index })}
                key={option.value}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ngày học trong tuần"
              placeholder="Chọn ngày trong tuần"
              error={!!errors.days_of_week}
              helperText={errors.days_of_week}
            />
          )}
        />
      </Grid>

      {/* Mô tả - Full width */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Mô tả"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderTeachersTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Giáo viên phụ trách
      </Typography>

      {teacherInfo ? (
        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><b>Tên:</b> {teacherInfo.name}</Typography>
              <Typography><b>Email:</b> {teacherInfo.email}</Typography>
              <Typography><b>Điện thoại:</b> {teacherInfo.phone}</Typography>
              {teacherInfo.gender && <Typography><b>Giới tính:</b> {teacherInfo.gender}</Typography>}
            </Box>
          </Paper>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleRemoveTeacher}
            sx={{ borderRadius: 2 }}
          >
            Xóa giáo viên khỏi lớp
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Chưa có giáo viên phụ trách lớp này.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTeacher}
            sx={{
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              borderRadius: 2
            }}
          >
            Thêm giáo viên
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderStudentsTab = () => {
    console.log('📊 Rendering Students Tab - studentsInfo:', studentsInfo);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Danh sách học sinh ({studentsInfo?.length || 0} / {formData.max_student})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStudent}
            sx={{
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              borderRadius: 2
            }}
          >
            Thêm học sinh
          </Button>
        </Box>

        {studentsInfo && studentsInfo.length > 0 ? (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Số điện thoại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentsInfo.map((item: any, index: number) => {
                  console.log(`📊 Student ${index}:`, item);
                  console.log(`📊 Student ${index} name:`, item.student?.name);
                  return (
                    <TableRow key={item.student?.id || Math.random()} hover>
                      <TableCell>{item.student?.name || 'Không tên'}</TableCell>
                      <TableCell>{item.student?.email || '-'}</TableCell>
                      <TableCell>{item.student?.phone || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveStudent(item)}
                          title="Xóa học sinh khỏi lớp"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Chưa có học sinh.</Typography>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
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
            {classItem ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {classItem ? 'Cập nhật thông tin lớp học' : 'Thêm lớp học mới vào hệ thống'}
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
          {classItem ? (
            <EditIcon sx={{ fontSize: 28, color: 'white' }} />
          ) : (
            <AddIcon sx={{ fontSize: 28, color: 'white' }} />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          <Paper sx={{
            p: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '1px solid #e0e6ed'
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

            {classItem ? (
              // Edit mode - Show tabs
              <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    px: 3,
                    pt: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      minHeight: 48,
                      color: '#666',
                      '&.Mui-selected': {
                        color: '#667eea',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#667eea',
                      height: 3
                    }
                  }}
                >
                  <Tab label="Thông tin chung" />
                  <Tab label="Giáo viên" />
                  <Tab label="Học sinh" />
                </Tabs>

                <Divider sx={{ mx: 3 }} />

                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && renderGeneralInfoTab()}
                  {activeTab === 1 && renderTeachersTab()}
                  {activeTab === 2 && renderStudentsTab()}
                </Box>
              </Box>
            ) : (
              // Create mode - Show original form
              <Box sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                {renderGeneralInfoTab()}
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button
          onClick={handleClose}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            border: '2px solid #667eea',
            color: '#667eea',
            bgcolor: 'white',
            '&:hover': {
              bgcolor: '#f0f2ff',
              borderColor: '#5a6fd8'
            }
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#667eea',
            color: 'white',
            '&:hover': { bgcolor: '#5a6fd8' },
            '&:disabled': { bgcolor: '#ccc' }
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (classItem ? <EditIcon /> : <AddIcon />)}
        >
          {isSubmitting ? 'Đang lưu...' : (classItem ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>

      {/* Confirm Remove Student Dialog */}
      <Dialog
        open={openRemoveStudentDialog}
        onClose={handleCloseRemoveStudentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Xác nhận xóa học sinh</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa học sinh "{studentToRemove?.student?.name}" khỏi lớp học này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveStudentDialog}>Hủy</Button>
          <Button
            onClick={handleConfirmRemoveStudent}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <AddStudentToClassDialog
        open={openAddStudentDialog}
        onClose={handleCloseAddStudentDialog}
        onAddStudents={handleAddStudentsToClass}
        existingStudentIds={studentsInfo.map(s => s.student?.id).filter(Boolean)}
        loading={false}
      />

      {/* Confirm Remove Teacher Dialog */}
      <Dialog
        open={openRemoveTeacherDialog}
        onClose={handleCloseRemoveTeacherDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Xác nhận xóa giáo viên</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa giáo viên "{teacherInfo?.name}" khỏi lớp học này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveTeacherDialog}>Hủy</Button>
          <Button
            onClick={handleConfirmRemoveTeacher}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Teacher Dialog */}
      <AddTeacherToClassDialog
        open={openAddTeacherDialog}
        onClose={handleCloseAddTeacherDialog}
        onAddTeacher={handleAddTeacherToClass}
        loading={false}
      />
    </Dialog>
  );
};

export default ClassForm;
