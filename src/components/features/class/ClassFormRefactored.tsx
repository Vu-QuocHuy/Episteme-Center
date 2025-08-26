// Refactored ClassForm - Clean, modular, and maintainable
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon
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
    const newErrors: ClassFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp học là bắt buộc';
    }

    if (formData.grade < 1 || formData.grade > 12) {
      newErrors.grade = 'Khối phải từ 1 đến 12';
    }

    if (formData.section < 1) {
      newErrors.section = 'Lớp phải lớn hơn 0';
    }

    if (formData.feePerLesson < 0) {
      newErrors.feePerLesson = 'Học phí phải lớn hơn hoặc bằng 0';
    }

    if (formData.max_student < 1) {
      newErrors.max_student = 'Số học sinh tối đa phải lớn hơn 0';
    }

    if (!formData.room.trim()) {
      newErrors.room = 'Phòng học là bắt buộc';
    }

    if (!formData.schedule.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.schedule.end_date) {
      newErrors.end_date = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.schedule.start_date && formData.schedule.end_date &&
        new Date(formData.schedule.start_date) >= new Date(formData.schedule.end_date)) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (formData.schedule.days_of_week.length === 0) {
      newErrors.days_of_week = 'Phải chọn ít nhất một ngày trong tuần';
    }

    if (!formData.schedule.time_slots.start_time) {
      newErrors.start_time = 'Giờ bắt đầu là bắt buộc';
    }

    if (!formData.schedule.time_slots.end_time) {
      newErrors.end_time = 'Giờ kết thúc là bắt buộc';
    }

    if (formData.schedule.time_slots.start_time && formData.schedule.time_slots.end_time &&
        formData.schedule.time_slots.start_time >= formData.schedule.time_slots.end_time) {
      newErrors.end_time = 'Giờ kết thúc phải sau giờ bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    onClose();
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
        {classItem ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {classItem ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới vào hệ thống'}
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
          <AddIcon sx={{ fontSize: 28, color: 'white' }} />
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

            <Box sx={{
              p: 2,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                         <TextField
                       fullWidth
                       label="Khối"
                       type="number"
                       value={formData.grade}
                       onChange={(e) => handleInputChange('grade', parseInt(e.target.value) || 1)}
                       error={!!errors.grade}
                       helperText={errors.grade}
                       InputProps={{ inputProps: { min: 1, max: 12 } }}
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
                       type="time"
                       value={formData.schedule.time_slots.start_time}
                       onChange={(e) => handleInputChange('schedule.time_slots.start_time', e.target.value)}
                       error={!!errors.start_time}
                       helperText={errors.start_time}
                       InputLabelProps={{ shrink: true }}
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
                       type="number"
                       value={formData.section}
                       onChange={(e) => handleInputChange('section', parseInt(e.target.value) || 1)}
                       error={!!errors.section}
                       helperText={errors.section}
                       InputProps={{ inputProps: { min: 1 } }}
                       required
                     />

                                         <TextField
                       fullWidth
                       label="Học phí/buổi"
                       type="number"
                       value={formData.feePerLesson}
                       onChange={(e) => handleInputChange('feePerLesson', parseInt(e.target.value) || 0)}
                       error={!!errors.feePerLesson}
                       helperText={errors.feePerLesson}
                       InputProps={{ inputProps: { min: 0 } }}
                       required
                     />

                     <TextField
                       fullWidth
                       label="Giờ kết thúc"
                       type="time"
                       value={formData.schedule.time_slots.end_time}
                       onChange={(e) => handleInputChange('schedule.time_slots.end_time', e.target.value)}
                       error={!!errors.end_time}
                       helperText={errors.end_time}
                       InputLabelProps={{ shrink: true }}
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
                   <Chip
                     label="Ngày học trong tuần"
                     sx={{
                       bgcolor: '#e0e0e0',
                       color: '#333',
                       borderRadius: 2,
                       fontWeight: 600,
                       mb: 2
                     }}
                   />
                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                     {daysOfWeekOptions.map(day => (
                       <Chip
                         key={day.value}
                         label={day.label}
                         variant={formData.schedule.days_of_week.includes(day.value) ? 'filled' : 'outlined'}
                         onClick={() => {
                           const newDays = formData.schedule.days_of_week.includes(day.value)
                             ? formData.schedule.days_of_week.filter(d => d !== day.value)
                             : [...formData.schedule.days_of_week, day.value];
                           handleInputChange('schedule', {
                             ...formData.schedule,
                             days_of_week: newDays
                           });
                         }}
                         sx={{
                           cursor: 'pointer',
                           '&:hover': {
                             bgcolor: '#e0e0e0'
                           }
                         }}
                       />
                     ))}
                   </Box>
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
             </Box>
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
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
        >
          {isSubmitting ? 'Đang thêm...' : (classItem ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassForm;
