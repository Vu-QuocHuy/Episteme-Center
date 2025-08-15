import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';

interface ScheduleData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface ScheduleSelectorProps {
  schedule: ScheduleData;
  onChange: (field: keyof ScheduleData, value: string) => void;
  errors?: Partial<ScheduleData>;
}

const daysOfWeek = [
  { value: '1', label: 'Thứ 2' },
  { value: '2', label: 'Thứ 3' },
  { value: '3', label: 'Thứ 4' },
  { value: '4', label: 'Thứ 5' },
  { value: '5', label: 'Thứ 6' },
  { value: '6', label: 'Thứ 7' },
  { value: '0', label: 'Chủ nhật' }
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const rooms = [
  'Phòng 101', 'Phòng 102', 'Phòng 103', 'Phòng 201', 'Phòng 202', 'Phòng 203',
  'Phòng 301', 'Phòng 302', 'Phòng 303'
];

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  schedule,
  onChange,
  errors = {}
}) => {
  return (
    <>
      {/* Schedule Information */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" mt={2}>
          Lịch học
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.dayOfWeek}>
          <InputLabel>Ngày trong tuần</InputLabel>
          <Select
            value={schedule.dayOfWeek}
            onChange={(e) => onChange('dayOfWeek', e.target.value)}
            label="Ngày trong tuần"
          >
            {daysOfWeek.map((day) => (
              <MenuItem key={day.value} value={day.value}>
                {day.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth error={!!errors.startTime}>
          <InputLabel>Giờ bắt đầu</InputLabel>
          <Select
            value={schedule.startTime}
            onChange={(e) => onChange('startTime', e.target.value)}
            label="Giờ bắt đầu"
          >
            {timeSlots.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth error={!!errors.endTime}>
          <InputLabel>Giờ kết thúc</InputLabel>
          <Select
            value={schedule.endTime}
            onChange={(e) => onChange('endTime', e.target.value)}
            label="Giờ kết thúc"
          >
            {timeSlots.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.room}>
          <InputLabel>Phòng học</InputLabel>
          <Select
            value={schedule.room}
            onChange={(e) => onChange('room', e.target.value)}
            label="Phòng học"
          >
            {rooms.map((room) => (
              <MenuItem key={room} value={room}>
                {room}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
};

export default ScheduleSelector;

