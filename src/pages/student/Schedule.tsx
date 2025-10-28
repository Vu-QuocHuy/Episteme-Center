import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentScheduleAPI, StudentScheduleClass } from '../../services/students';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';
import { Lesson } from '../../types';
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

      const response = await getStudentScheduleAPI(user?.id || '');
      const lessons: Lesson[] = [];

      if (response.data && response.data.data) {
        console.log('📅 Student schedule response:', response.data);
        const scheduleData: StudentScheduleClass[] = response.data.data;

        scheduleData.forEach((item: StudentScheduleClass) => {
          const classData = item.class;
          const schedule = classData.schedule;

          if (schedule) {
            console.log('📅 Processing schedule for class:', classData.name);
            console.log('📅 Start date:', schedule.start_date);
            console.log('📅 End date:', schedule.end_date);
            console.log('📅 Days of week:', schedule.days_of_week);

            // Convert schedule to lessons
            const startDate = dayjs(schedule.start_date);
            const endDate = dayjs(schedule.end_date);
            let currentDate = startDate;

            console.log('📅 Parsed start date:', startDate.format('YYYY-MM-DD'));
            console.log('📅 Parsed end date:', endDate.format('YYYY-MM-DD'));

            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
              // Convert day of week from string to number (0 = Sunday, 1 = Monday, etc.)
              const dayOfWeeks = schedule.days_of_week.map(day => parseInt(day));
              const currentDay = currentDate.day();

              console.log('📅 Checking date:', currentDate.format('YYYY-MM-DD'), 'Day:', currentDay, 'Days of week:', dayOfWeeks);

              if (dayOfWeeks.includes(currentDay)) {
                console.log('📅 ✅ Adding lesson for date:', currentDate.format('YYYY-MM-DD'));
                const lessonDate = currentDate.format('YYYY-MM-DD');
                console.log('📅 Creating lesson:', {
                  date: lessonDate,
                  className: classData.name,
                  type: 'student'
                });

                lessons.push({
                  date: lessonDate,
                  className: classData.name,
                  time: `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`,
                  room: (classData as any).room || '',
                  teacher: 'Chưa phân công', // API không cung cấp teacher info
                  type: 'student',
                  classId: classData.id,
                  status: 'active', // Default status
                  grade: classData.grade.toString(),
                  section: classData.section.toString()
                });

                // Log thông tin giảm giá
                console.log(`Lớp ${classData.name}: Giảm giá ${item.discountPercent}%`);
              }
              currentDate = currentDate.add(1, 'day');
            }
          }
        });

        console.log('📅 Generated lessons:', lessons);
        console.log('📅 Number of lessons:', lessons.length);
        setLessons(lessons);
      }
    } catch (error: any) {
      console.error('Error fetching student schedule:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user?.id]);

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

  console.log('📅 Rendering ScheduleCalendar with lessons:', lessons);
  console.log('📅 Lessons count:', lessons.length);

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
