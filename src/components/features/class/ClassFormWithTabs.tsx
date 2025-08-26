import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Autocomplete,
  Paper,
  Tabs,
  Tab,
  Divider,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { Class, ClassFormData, ClassFormErrors } from '../../../types';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (classData: ClassFormData) => Promise<void>;
  classItem?: Class | null;
  loading?: boolean;
}

const initialFormData: ClassFormData = {
  name: '',
  grade: 1,
  section: 1,
  year: new Date().getFullYear(),
  description: '',
  feePerLesson: 0,
  status: 'active',
  max_student: 30,
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

  // Initialize form data when classItem changes
  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        grade: classItem.grade || 1,
        section: classItem.section || 1,
        year: classItem.year || new Date().getFullYear(),
        description: classItem.description || '',
        feePerLesson: classItem.feePerLesson || 0,
        status: classItem.status || 'active',
        max_student: classItem.max_student || classItem.maxStudents || 30,
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

  const handleInputChange = (field: string, value: any) => {
    // Convert string to number for numeric fields
    if (['grade', 'section', 'feePerLesson', 'max_student'].includes(field)) {
      value = Number(value) || 0;
    }

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
        Quản lý giáo viên
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tính năng thêm/xóa giáo viên sẽ được phát triển ở đây.
      </Typography>
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="body2" color="text.secondary">
          • Hiển thị danh sách giáo viên hiện tại
          <br />
          • Thêm giáo viên mới vào lớp
          <br />
          • Xóa giáo viên khỏi lớp
          <br />
          • Phân quyền giáo viên
        </Typography>
      </Paper>
    </Box>
  );

  const renderStudentsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quản lý học sinh
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tính năng thêm/xóa học sinh sẽ được phát triển ở đây.
      </Typography>
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="body2" color="text.secondary">
          • Hiển thị danh sách học sinh hiện tại
          <br />
          • Thêm học sinh mới vào lớp
          <br />
          • Xóa học sinh khỏi lớp
          <br />
          • Quản lý học phí và giảm giá
        </Typography>
      </Paper>
    </Box>
  );

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
    </Dialog>
  );
};

export default ClassForm;
