interface ScheduleItem {
  day?: string;
  time?: string;
}

interface Teacher {
  id: string;
  userId?: {
    name?: string;
  };
  name?: string;
}

interface Student {
  id: string;
  name?: string;
}

// Helper function to format schedule display
export const formatSchedule = (schedule: ScheduleItem[]): string => {
  if (!schedule || schedule.length === 0) return 'Chưa có lịch học';

  return schedule.map(item => {
    const day = item.day || 'Chưa xác định';
    const time = item.time || 'Chưa xác định';
    return `${day}: ${time}`;
  }).join('\n');
};

// Helper function to get status label
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Đang hoạt động';
    case 'inactive':
      return 'Không hoạt động';
    case 'completed':
      return 'Đã hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

// Helper function to get status color
export const getStatusColor = (status: string): 'success' | 'error' | 'info' | 'warning' | 'default' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'warning';
    default:
      return 'default';
  }
};

// Helper function to get teacher object
export const getTeacherObj = (teacherId: string, teachers: Teacher[]): Teacher | null => {
  if (!teacherId || !teachers) return null;
  return teachers.find(teacher => teacher.id === teacherId) || null;
};

// Helper function to format class name
export const formatClassName = (grade: string | number, section: string | number, year: string | number): string => {
  return `Lớp ${grade}.${section} (${year})`;
};

// Helper function to safely render text content
export const renderText = (text: any): string => {
  if (text === null || text === undefined) return '-';
  if (typeof text === 'object') return '-';
  return String(text);
};

// Helper function to format student count
export const formatStudentCount = (students: Student[]): string => {
  if (!students || students.length === 0) return '0 học sinh';
  return `${students.length} học sinh`;
};

// Helper function to format teacher name
export const formatTeacherName = (teacher: Teacher | null | undefined): string => {
  if (!teacher) return 'Chưa phân công';
  return teacher.userId?.name || teacher.name || 'Không xác định';
};




