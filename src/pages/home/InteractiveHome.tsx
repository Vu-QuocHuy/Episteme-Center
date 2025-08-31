import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia,
  Avatar, Rating, Chip, IconButton, useTheme, useMediaQuery, Skeleton,
  Alert, CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getAllTeachersAPI } from '../../services/api';
import { Teacher } from '../../types';
import { useBannerConfig } from '../../hooks/useBannerConfig';

// Import components
import BannerCarousel from './components/BannerCarousel';
import LatestPosts from './components/LatestPosts';
import EventsSection from './components/EventsSection';
import HomeWelcomeAdPopup from './components/WelcomeAdPopup';

const InteractiveHome: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Banner configuration
  const { bannerConfig, popupConfig } = useBannerConfig();

  // State for dynamic content
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for carousels
  const [currentTestimonial, setCurrentTestimonial] = useState(0);



  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await getAllTeachersAPI({ page: 1, limit: 6 });
        if (response.data?.data) {
          setTeachers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setError('Không thể tải danh sách giảng viên');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Static content for sections - NO API NEEDED
  const getAboutContent = () => {
    return {
      title: "Về Trung tâm Anh ngữ",
      subtitle: "Hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục",
      description: "Trung tâm Anh ngữ được thành lập với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.",
      features: [
        { id: '1', title: "Giảng viên chất lượng", description: "100% giảng viên có bằng cấp quốc tế", icon: "school", order: 1 },
        { id: '2', title: "Phương pháp hiện đại", description: "Áp dụng công nghệ AI và phương pháp học tập tiên tiến", icon: "people", order: 2 },
        { id: '3', title: "Cam kết chất lượng", description: "Đảm bảo kết quả học tập cho mọi học viên", icon: "star", order: 3 },
      ]
    };
  };

  const getTestimonialsContent = () => {
    return [
      {
        id: '1',
        name: "Nguyễn Văn A",
        role: "Học viên IELTS",
        content: "Sau 6 tháng học tại trung tâm, tôi đã đạt được IELTS 7.0. Giảng viên rất tận tâm và phương pháp học hiệu quả.",
        rating: 5,
        avatar: "/images/student1.jpg",
        isActive: true,
        order: 1
      },
      {
        id: '2',
        name: "Trần Thị B",
        role: "Phụ huynh học sinh",
        content: "Con tôi rất thích học tại trung tâm, phương pháp giảng dạy phù hợp với trẻ em và kết quả học tập rất tốt.",
        rating: 5,
        avatar: "/images/student2.jpg",
        isActive: true,
        order: 2
      },
      {
        id: '3',
        name: "Lê Văn C",
        role: "Học viên giao tiếp",
        content: "Tôi đã tự tin giao tiếp tiếng Anh sau 3 tháng học. Môi trường học tập thân thiện và chuyên nghiệp.",
        rating: 5,
        avatar: "/images/student3.jpg",
        isActive: true,
        order: 3
      }
    ];
  };

  const getStatisticsContent = () => {
    return [
      { id: '1', number: "1000+", label: "Học viên", icon: "people", order: 1 },
      { id: '2', number: "50+", label: "Giảng viên", icon: "school", order: 2 },
      { id: '3', number: "95%", label: "Hài lòng", icon: "star", order: 3 },
      { id: '4', number: "10+", label: "Năm kinh nghiệm", icon: "trending", order: 4 }
    ];
  };

  // Get dynamic content
  const aboutContent = getAboutContent();
  const testimonials = getTestimonialsContent();
  const statistics = getStatisticsContent();

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'school': return <SchoolIcon />;
      case 'people': return <PeopleIcon />;
      case 'star': return <StarIcon />;
      case 'trending': return <TrendingUpIcon />;
      default: return <SchoolIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
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
    <Box>
      {/* Welcome Ad Popup */}
      <HomeWelcomeAdPopup />

      {/* Banner Carousel Section - Fixed */}
      <BannerCarousel />

      {/* About Us Section - Dynamic */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              {aboutContent.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              {aboutContent.subtitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="800px" mx="auto">
              {aboutContent.description}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {aboutContent.features.map((feature) => (
              <Grid item xs={12} md={4} key={feature.id}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <Box sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}>
                    {getIconComponent(feature.icon)}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Latest Posts Section - Dynamic */}
      <LatestPosts />

      {/* Featured Teachers Section - Dynamic */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Giảng viên nổi bật
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
            Đội ngũ giảng viên giàu kinh nghiệm và chuyên môn cao
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            {teachers.slice(0, 6).map((teacher) => (
              <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={teacher.avatar || '/images/default-teacher.jpg'}
                    alt={teacher.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {teacher.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {teacher.specializations?.join(', ') || 'Tiếng Anh'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={teacher.isActive ? 'Đang giảng dạy' : 'Tạm nghỉ'}
                        color={teacher.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Events Section - Dynamic */}
      <EventsSection />

      {/* Student Testimonials Section - Dynamic */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Đánh giá từ học viên
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
            Những chia sẻ chân thực từ học viên của chúng tôi
          </Typography>

          <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={prevTestimonial}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar
                    src={testimonials[currentTestimonial].avatar}
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {testimonials[currentTestimonial].name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {testimonials[currentTestimonial].role}
                </Typography>
                <Rating value={testimonials[currentTestimonial].rating} readOnly sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{testimonials[currentTestimonial].content}"
                </Typography>
              </Box>

              <IconButton
                onClick={nextTestimonial}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Testimonial indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
              {testimonials.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: index === currentTestimonial ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Statistics Section - Dynamic */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {statistics.map((stat) => (
              <Grid item xs={6} md={3} key={stat.id}>
                <Box textAlign="center">
                  <Box sx={{ fontSize: 48, mb: 1 }}>
                    {getIconComponent(stat.icon)}
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold" gutterBottom>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default InteractiveHome;
