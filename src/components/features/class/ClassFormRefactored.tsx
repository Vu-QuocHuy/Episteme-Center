// Refactored ClassForm - Clean, modular, and maintainable
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Class, Teacher } from '../../../types';
import { validateForm, classValidationSchema } from '../../../utils/validation';
import BasicInfoFields from './components/BasicInfoFields';
import ScheduleSelector from './components/ScheduleSelector';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (classData: Partial<Class>) => Promise<void>;
  classItem?: Class | null;
  teachers?: Teacher[];
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  level: string;
  maxStudents: string;
  teacherId: string;
  status: string;
  startDate: string;
  endDate: string;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
  };
}

interface FormErrors {
  name?: string;
  description?: string;
  level?: string;
  maxStudents?: string;
  teacherId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  schedule?: {
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
  };
}

const initialFormData: FormData = {
  name: '',
  description: '',
  level: '',
  maxStudents: '',
  teacherId: '',
  status: 'pending',
  startDate: '',
  endDate: '',
  schedule: {
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    room: ''
  }
};

const ClassFormRefactored: React.FC<ClassFormProps> = ({
  open,
  onClose,
  onSubmit,
  classItem,
  teachers = [],
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data when classItem changes
  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        description: classItem.description || '',
        level: classItem.level || '',
        maxStudents: classItem.maxStudents?.toString() || '',
        teacherId: classItem.teacherId || '',
        status: classItem.status || 'pending',
        startDate: classItem.startDate || '',
        endDate: classItem.endDate || '',
        schedule: {
          dayOfWeek: classItem.schedule?.dayOfWeek?.toString() || '',
          startTime: classItem.schedule?.startTime || '',
          endTime: classItem.schedule?.endTime || '',
          room: classItem.schedule?.room || ''
        }
      });
    } else {
      setFormData(initialFormData);
    }
    setFormErrors({});
  }, [classItem, open]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleScheduleChange = (field: keyof FormData['schedule'], value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value
      }
    }));

    // Clear schedule errors
    if (formErrors.schedule?.[field]) {
      setFormErrors(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [field]: undefined
        }
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate form
      const validation = validateForm(formData, classValidationSchema);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      // Transform data for submission
      const submitData: Partial<Class> = {
        ...formData,
        maxStudents: parseInt(formData.maxStudents),
        schedule: {
          ...formData.schedule,
          dayOfWeek: parseInt(formData.schedule.dayOfWeek)
        }
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setFormErrors({});
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
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        {classItem ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <BasicInfoFields
              formData={formData}
              onChange={handleInputChange}
              teachers={teachers}
              errors={formErrors}
            />

            <ScheduleSelector
              schedule={formData.schedule}
              onChange={handleScheduleChange}
              errors={formErrors.schedule}
            />
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={submitting || loading}
        >
          {submitting ? 'Đang lưu...' : (classItem ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassFormRefactored;

