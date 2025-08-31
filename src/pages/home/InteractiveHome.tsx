import React from 'react';
import {
  Box, Container, Typography, Grid, Card,

} from '@mui/material';
import {

  School as SchoolIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';



// Import components
import BannerCarousel from './components/BannerCarousel';
import FeedbackHome from '../../components/features/homepage/FeedbackHome';
import FeaturedTeachersHome from '../../components/features/homepage/FeaturedTeachersHome';
import HomeWelcomeAdPopup from './components/WelcomeAdPopup';
import HomeHeader from './HomeHeader';

const InteractiveHome: React.FC = () => {


  // Banner configuration


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
  const statistics = getStatisticsContent();

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



  return (
    <Box>
      {/* Header */}
      <HomeHeader />

      {/* Welcome Ad Popup */}
      <HomeWelcomeAdPopup />

      {/* Banner Carousel Section - Fixed */}
      <BannerCarousel />

      {/* About Us Section - Dynamic */}
      <Box id="about-section" sx={{ py: 8, bgcolor: 'background.paper' }}>
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

      {/* Featured Teachers Section - Dynamic */}
      <Box id="teachers-section" sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <FeaturedTeachersHome />
        </Container>
      </Box>

      {/* Student Testimonials Section - Dynamic */}
      <Box id="contact-section" sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <FeedbackHome />
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
