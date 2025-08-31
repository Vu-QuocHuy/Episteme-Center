import React from 'react';
import { Box } from '@mui/material';
import HomeHeader from './HomeHeader';
import Footer from './Footer';
import InteractiveHome from './InteractiveHome';

const Home: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <HomeHeader />
      <InteractiveHome />
      <Footer />
    </Box>
  );
};

export default Home;
