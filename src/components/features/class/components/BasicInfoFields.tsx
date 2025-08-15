import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import { Teacher } from '../../../../types';

interface BasicInfoData {
  name: string;
  description: string;
  level: string;
  maxStudents: string;
  teacherId: string;
  status: string;
}

interface BasicInfoFieldsProps {
  formData: BasicInfoData;
  onChange: (field: keyof BasicInfoData, value: string) => void;
  teachers: Teacher[];
  errors?: Partial<BasicInfoData>;
}

const levels = [
  { value: 'beginner', label: 'Sơ cấp' },
  { value: 'elementary', label: 'Cơ bản' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'upper-intermediate', label: 'Trung cấp cao' },
  { value: 'advanced', label: 'Nâng cao' }
];

const statusOptions = [
  { value: 'pending', label: 'Chờ mở lớp' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  onChange,
  teachers,
  errors = {}
}) => {
  return (
    <>
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
          onChange={(e) => onChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.level}>
          <InputLabel>Trình độ</InputLabel>
          <Select
            value={formData.level}
            onChange={(e) => onChange('level', e.target.value)}
            label="Trình độ"
          >
            {levels.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Mô tả"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          rows={3}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Số lượng học sinh tối đa"
          type="number"
          value={formData.maxStudents}
          onChange={(e) => onChange('maxStudents', e.target.value)}
          error={!!errors.maxStudents}
          helperText={errors.maxStudents}
          inputProps={{ min: 1, max: 50 }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.status}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value)}
            label="Trạng thái"
          >
            {statusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.teacherId}>
          <InputLabel>Giáo viên phụ trách</InputLabel>
          <Select
            value={formData.teacherId}
            onChange={(e) => onChange('teacherId', e.target.value)}
            label="Giáo viên phụ trách"
          >
            <MenuItem value="">
              <em>Chưa phân công</em>
            </MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>
                {teacher.userId?.name || 'N/A'} - {teacher.specialization || 'N/A'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
};

export default BasicInfoFields;

