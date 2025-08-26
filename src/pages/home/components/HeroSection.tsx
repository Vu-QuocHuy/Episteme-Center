import React from 'react';
import { Box } from '@mui/material';

const HeroSection: React.FC = () => {
  return (
    <Box
      id="hero-section"
      sx={{
        position: 'relative',
        height: '580px',
        borderRadius: 0,
        mb: 0,
        pt: 7.8,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(229,57,53,0.1) 0%, rgba(25,118,210,0.1) 100%)',
          zIndex: 1
        }
      }}
    >
      <Box
        component="img"
        src="/images/Banner-tieng-Anh.png"
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 0,
          objectFit: 'cover',
          position: 'relative',
          zIndex: 0
        }}
      />
    </Box>
  );
};

export default HeroSection;

