import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Chip, useTheme, useMediaQuery, Skeleton, Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { CalendarToday as CalendarIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { getLatestEventsAPI } from '../../../services/api';
import { Event } from '../../../types';

const EventsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getLatestEventsAPI(0, 4);
        if (response.data?.data?.content) {
          setEvents(response.data.data.content);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Không thể tải sự kiện mới nhất');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper function to get first image from fileDTOList
  const getFirstImage = (event: Event) => {
    const imageFile = event.fileDTOList?.find(file =>
      file.fileType.startsWith('image/') ||
      file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    return imageFile ? imageFile.downloadUrl : '/images/default-event.jpg';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to get event status
  const getEventStatus = (startAt: string, endAt: string) => {
    const today = new Date();
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (today < startDate) {
      return { status: 'upcoming', label: 'Sắp diễn ra', color: 'warning' as const };
    } else if (today >= startDate && today <= endDate) {
      return { status: 'ongoing', label: 'Đang diễn ra', color: 'success' as const };
    } else {
      return { status: 'ended', label: 'Đã kết thúc', color: 'default' as const };
    }
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Sự kiện mới nhất
          </Typography>
          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Sự kiện mới nhất
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
          Các sự kiện và hoạt động sắp diễn ra tại trung tâm
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {events.map((event) => {
            const eventStatus = getEventStatus(event.startAt, event.endAt);

            return (
              <Grid item xs={12} sm={6} md={3} key={event.eventId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getFirstImage(event)}
                    alt={event.eventName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={eventStatus.label}
                        size="small"
                        color={eventStatus.color}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom component="h3">
                      {truncateText(event.eventName, 50)}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(event.startAt)} - {formatDate(event.endAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Tổ chức bởi:</strong> {event.organizedBy}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {truncateText(event.description, 100)}
                    </Typography>

                    <Button
                      component={Link}
                      to={`/events/${event.eventId}`}
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      Chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/events"
            variant="contained"
            size="large"
            sx={{ px: 4 }}
          >
            Xem tất cả sự kiện
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default EventsSection;
