import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CardMedia, Button, Chip,
  useTheme, useMediaQuery, Skeleton, Alert, Avatar
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for events (replace with real API later)
const mockEvents = [
  {
    id: 1,
    title: 'Workshop Tiếng Anh Giao tiếp',
    description: 'Workshop thực hành tiếng Anh giao tiếp với giáo viên bản ngữ, giúp học viên tự tin hơn trong việc sử dụng tiếng Anh.',
    startDate: '2024-02-15',
    endDate: '2024-02-15',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Phòng học 101 - Trung tâm Anh ngữ',
    organizer: 'Trung tâm Anh ngữ',
    imageUrl: '/images/event1.jpg',
    maxParticipants: 30,
    currentParticipants: 25,
    isActive: true
  },
  {
    id: 2,
    title: 'Lễ khai giảng khóa IELTS',
    description: 'Lễ khai giảng khóa học IELTS mới với cam kết điểm số 6.5+. Gặp gỡ giảng viên và nhận tài liệu học tập.',
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Hội trường chính',
    organizer: 'Trung tâm Anh ngữ',
    imageUrl: '/images/event2.jpg',
    maxParticipants: 100,
    currentParticipants: 80,
    isActive: true
  },
  {
    id: 3,
    title: 'Cuộc thi hùng biện tiếng Anh',
    description: 'Cuộc thi hùng biện tiếng Anh dành cho học viên các khóa học. Cơ hội thể hiện khả năng và nhận giải thưởng.',
    startDate: '2024-03-01',
    endDate: '2024-03-01',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Phòng đa năng',
    organizer: 'Trung tâm Anh ngữ',
    imageUrl: '/images/event3.jpg',
    maxParticipants: 50,
    currentParticipants: 35,
    isActive: true
  },
  {
    id: 4,
    title: 'Hội thảo du học',
    description: 'Hội thảo chia sẻ kinh nghiệm du học và chuẩn bị hồ sơ. Tư vấn trực tiếp từ các chuyên gia.',
    startDate: '2024-03-10',
    endDate: '2024-03-10',
    startTime: '14:00',
    endTime: '16:30',
    location: 'Phòng hội thảo',
    organizer: 'Trung tâm Anh ngữ',
    imageUrl: '/images/event4.jpg',
    maxParticipants: 40,
    currentParticipants: 28,
    isActive: true
  }
];

const EventsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [events, setEvents] = useState(mockEvents);
  const [currentEvent, setCurrentEvent] = useState(mockEvents[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with real API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvents(mockEvents);
      setCurrentEvent(mockEvents[0]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEventStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) {
      return { status: 'upcoming', label: 'Sắp diễn ra', color: 'warning' as const };
    } else if (today >= start && today <= end) {
      return { status: 'ongoing', label: 'Đang diễn ra', color: 'success' as const };
    } else {
      return { status: 'ended', label: 'Đã kết thúc', color: 'default' as const };
    }
  };

  const handleEventClick = (event: typeof mockEvents[0]) => {
    setCurrentEvent(event);
  };

  const handleRegisterEvent = (eventId: number) => {
    // TODO: Implement event registration
    console.log('Register for event:', eventId);
  };

  const handleViewAllEvents = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
          <Typography variant="h3" textAlign="center" gutterBottom fontWeight="bold">
            Sự kiện mới nhất
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mt: 4 }}>
            <Skeleton variant="rectangular" height={300} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} variant="rectangular" height={80} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
        <Typography
          variant="h3"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          Sự kiện mới nhất
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          {/* Featured Event */}
          <Card sx={{ height: 'fit-content' }}>
            <CardMedia
              component="img"
              height="250"
              image={currentEvent.imageUrl || '/images/default-event.jpg'}
              alt={currentEvent.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                  {currentEvent.title}
                </Typography>
                <Chip
                  label={getEventStatus(currentEvent.startDate, currentEvent.endDate).label}
                  color={getEventStatus(currentEvent.startDate, currentEvent.endDate).color}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                {currentEvent.description}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(currentEvent.startDate)} - {formatDate(currentEvent.endDate)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {currentEvent.startTime} - {currentEvent.endTime}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {currentEvent.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {currentEvent.organizer}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {currentEvent.currentParticipants}/{currentEvent.maxParticipants} người tham gia
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleRegisterEvent(currentEvent.id)}
                  disabled={getEventStatus(currentEvent.startDate, currentEvent.endDate).status === 'ended'}
                >
                  Đăng ký ngay
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Events List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map((event) => (
              <Card
                key={event.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  border: currentEvent.id === event.id ? 2 : 1,
                  borderColor: currentEvent.id === event.id ? 'primary.main' : 'divider'
                }}
                onClick={() => handleEventClick(event)}
              >
                <Box sx={{ display: 'flex', p: 2 }}>
                  <Avatar
                    src={event.imageUrl}
                    variant="rounded"
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography
                        variant="h6"
                        component="h4"
                        fontWeight="bold"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Chip
                        label={getEventStatus(event.startDate, event.endDate).label}
                        color={getEventStatus(event.startDate, event.endDate).color}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1
                      }}
                    >
                      {event.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption">
                          {formatDate(event.startDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="caption">
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>

        {/* View All Events Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleViewAllEvents}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Xem tất cả sự kiện
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EventsSection;
