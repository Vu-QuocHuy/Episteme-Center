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
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

import { Class, Teacher, ClassFormData, ClassFormErrors } from '../../../types';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (classData: ClassFormData) => Promise<void>;
  classItem?: Class | null;
  teachers?: Teacher[];
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

const statusOptions = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'closed', label: 'Đã đóng' },
  { value: 'completed', label: 'Đã kết thúc' },
  { value: 'cancelled', label: 'Đã hủy' }
];

const ClassForm: React.FC<ClassFormProps> = ({
  open,
  onClose,
  onSubmit,
  classItem,

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

    if (formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Năm học không hợp lệ';
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
      await onSubmit(formData);
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {classItem ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên lớp học"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phòng học"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
                error={!!errors.room}
                helperText={errors.room}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
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
            </Grid>

            <Grid item xs={12} md={3}>
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
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Năm học"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                error={!!errors.year}
                helperText={errors.year}
                InputProps={{ inputProps: { min: 2020, max: 2030 } }}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Trạng thái"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Học phí mỗi buổi (VND)"
                type="number"
                value={formData.feePerLesson}
                onChange={(e) => handleInputChange('feePerLesson', parseInt(e.target.value) || 0)}
                error={!!errors.feePerLesson}
                helperText={errors.feePerLesson}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số học sinh tối đa"
                type="number"
                value={formData.max_student}
                onChange={(e) => handleInputChange('max_student', parseInt(e.target.value) || 30)}
                error={!!errors.max_student}
                helperText={errors.max_student}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

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

            {/* Schedule Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lịch học
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Ngày trong tuần *
              </Typography>
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
                    placeholder="Chọn ngày trong tuần"
                    error={!!errors.days_of_week}
                    helperText={errors.days_of_week}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassForm;
