import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentScheduleAPI } from '../../services/api';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';
import { Schedule as ScheduleType, ClassItem, Lesson } from '../../types';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let response;
      try {
        response = await getStudentScheduleAPI(user?.id || '');
      } catch (scheduleError) {
        console.warn('Student schedule API failed, falling back to classes API:', scheduleError);
        setLessons([]);
        return;
      }

      if (response.data) {
        const scheduleData = response.data;
        const lessons: Lesson[] = [];

        if (scheduleData.classes && Array.isArray(scheduleData.classes)) {
          scheduleData.classes.forEach((classItem: ClassItem) => {
            if (classItem.schedule && Array.isArray(classItem.schedule)) {
              classItem.schedule.forEach((scheduleItem: ScheduleType) => {
                // Convert schedule to lessons
                const startDate = dayjs(scheduleItem.startDate);
                const endDate = dayjs(scheduleItem.endDate);
                let currentDate = startDate;

                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                  if (scheduleItem.dayOfWeeks.includes(currentDate.day())) {
                    lessons.push({
                      date: currentDate.format('YYYY-MM-DD'),
                      className: classItem.name,
                      time: `${scheduleItem.timeSlots.startTime} - ${scheduleItem.timeSlots.endTime}`,
                      room: classItem.room,
                      teacher: classItem.teacher?.name || 'Chưa phân công',
                      type: 'regular',
                      classId: classItem.id,
                      status: classItem.status,
                      grade: classItem.grade,
                      section: classItem.section
                    });
                  }
                  currentDate = currentDate.add(1, 'day');
                }
              });
            }
          });
        }

        setLessons(lessons);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || user?.name) {
      fetchSchedule();
    }
  }, [user?.id, user?.name]);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="student">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <ScheduleCalendar
        lessons={lessons}
        title="Lịch học của tôi"
        userType="student"
      />
    </DashboardLayout>
  );
};

export default Schedule;
