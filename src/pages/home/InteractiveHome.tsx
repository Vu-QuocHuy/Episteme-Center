import React from 'react';
import {
  Box, Container, Grid, Typography,
} from '@mui/material';



// Import components
import BannerCarousel from './components/BannerCarousel';
import FeedbackHome from '../../components/features/home/FeedbackHome';
import FeaturedTeachersHome from '../../components/features/home/FeaturedTeachersHome';
import HomeWelcomeAdPopup from './components/WelcomeAdPopup';
import PublicLayout from '../../components/layouts/PublicLayout';
import ArticlesSidebar from '../../components/articles/ArticlesSidebar';

const InteractiveHome: React.FC = () => {


  // Banner configuration





  return (
    <PublicLayout>
      {/* Welcome Ad Popup */}
      <HomeWelcomeAdPopup />

      {/* Banner Carousel Section - Start right below header (72px) */}
      <Box sx={{ mt: '-72px', pt: '72px' }}>
        <BannerCarousel />
      </Box>

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

      {/* Articles Section */}
      <Box id="articles-section" sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Bài viết mới nhất
              </Typography>
              <ArticlesSidebar
                limit={10}
                title=""
                showContent={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                <ArticlesSidebar
                  limit={5}
                  title="Bài viết nổi bật"
                  showContent={false}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default InteractiveHome;
