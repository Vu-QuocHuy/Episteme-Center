import React from 'react';
import { Box } from '@mui/material';
import HomeHeader from './HomeHeader';
import Footer from './Footer';
import DynamicHome from './DynamicHome';

const Home: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <HomeHeader />
      <DynamicHome />
      <Footer />
    </Box>
  );
};

export default Home;
