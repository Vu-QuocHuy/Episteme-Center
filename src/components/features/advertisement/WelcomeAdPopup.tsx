import React from 'react';
import { Dialog, IconButton, Box, Card, CardMedia, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Advertisement } from '../../../types';

interface WelcomeAdPopupProps {
  open: boolean;
  onClose: () => void;
  ads: Advertisement[];
  width?: number;
  height?: number;
}

const WelcomeAdPopup: React.FC<WelcomeAdPopupProps> = ({ open, onClose, ads, width = 600, height = 450 }) => {
  if (!ads || !Array.isArray(ads) || ads.length === 0) return null;

  // Chọn quảng cáo có priority nhỏ nhất, nếu cùng priority thì lấy createdAt sớm nhất
  const welcomeAd = [...ads].sort((a, b) => {
    if ((a.priority ?? 0) !== (b.priority ?? 0)) {
      return (a.priority ?? 0) - (b.priority ?? 0);
    }
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  })[0];

  if (!welcomeAd) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          width: { xs: '90%', sm: width },
          maxWidth: width,
          aspectRatio: '4/3', // Fixed 4:3 aspect ratio
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          animation: 'fadeInScale 0.4s ease-out',
          '@keyframes fadeInScale': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -12,
            top: -12,
            zIndex: 10,
            bgcolor: 'white',
            color: 'text.primary',
            width: 36,
            height: 36,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'grey.100',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Card
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            width: '100%',
            aspectRatio: '4/3', // Fixed 4:3 aspect ratio
          }}
        >
          <CardMedia
            component="img"
            image={welcomeAd.imageUrl || welcomeAd.image}
            alt={welcomeAd.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Overlay for text - Clean and minimal */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
              color: 'white',
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              {welcomeAd.title}
            </Typography>

            {welcomeAd.content || welcomeAd.description ? (
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {welcomeAd.content || welcomeAd.description}
              </Typography>
            ) : null}
          </Box>
        </Card>
      </Box>
    </Dialog>
  );
};

export default WelcomeAdPopup;
