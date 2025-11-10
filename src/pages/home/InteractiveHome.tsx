import React from 'react';
import {
  Box, Container,
} from '@mui/material';



// Import components
import BannerCarousel from './components/BannerCarousel';
import FeedbackHome from '../../components/features/home/FeedbackHome';
import FeaturedTeachersHome from '../../components/features/home/FeaturedTeachersHome';
import HomeWelcomeAdPopup from './components/WelcomeAdPopup';
import PublicLayout from '../../components/layouts/PublicLayout';

const InteractiveHome: React.FC = () => {


  // Banner configuration





  return (
    <PublicLayout>
      {/* Welcome Ad Popup */}
      <HomeWelcomeAdPopup />

      {/* Banner Carousel Section */}
      <BannerCarousel />

      {/* Featured Teachers Section */}
      <Box id="teachers-section" sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <FeaturedTeachersHome />
        </Container>
      </Box>

      {/* Student Testimonials Section */}
      <Box id="contact-section" sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <FeedbackHome />
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default InteractiveHome;
