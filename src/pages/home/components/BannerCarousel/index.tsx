import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  Box, Typography, Button, useTheme, useMediaQuery, Skeleton
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHomeBannersAPI } from '../../../../services/api';
import { Advertisement } from '../../../../types';
import { useBannerConfig } from '../../../../hooks/useBannerConfig';

const BannerCarousel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { bannerConfig } = useBannerConfig();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch advertisements data
  useEffect(() => {
    const fetchAdvertisements = async () => {
              try {
          setLoading(true);
          const response = await getHomeBannersAPI(10);
          console.log('Banners API Response:', response);

          // Handle different response formats
          let bannerAds = [];
          if (response.data?.data?.result) {
            bannerAds = response.data.data.result;
          } else if (Array.isArray(response.data)) {
            bannerAds = response.data;
          } else if (response.data && typeof response.data === 'object') {
            // Handle case where response.data is an object with advertisements
            bannerAds = (response.data as any).result || (response.data as any).advertisements || [];
          }

          console.log('Banners Data:', bannerAds);
          setAdvertisements(bannerAds.slice(0, bannerConfig.maxSlides)); // Use config
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setError('Không thể tải quảng cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  // Slider settings
  const settings = {
    dots: bannerConfig.showDots,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: bannerConfig.autoPlay,
    autoplaySpeed: bannerConfig.interval,
    arrows: bannerConfig.showArrows && !isMobile,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: bannerConfig.showArrows ? false : false,
        }
      }
    ]
  };

  const handleBannerClick = (ad: Advertisement) => {
    if (ad.linkUrl) {
      if (ad.linkUrl.startsWith('http')) {
        window.open(ad.linkUrl, '_blank');
      } else {
        navigate(ad.linkUrl);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: bannerConfig.height, position: 'relative' }}>
        <Skeleton variant="rectangular" height="100%" />
      </Box>
    );
  }

  if (error || advertisements.length === 0 || !bannerConfig.isActive) {
    return (
      <Box sx={{
        height: bannerConfig.height,
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" color="text.secondary">
          {error || 'Chưa có quảng cáo' || 'Banner đã bị tắt'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', mb: 4 }}>
      <Slider {...settings}>
        {advertisements.map((ad, index) => (
          <Box key={ad.id || index} sx={{ position: 'relative' }}>
            <Box
              sx={{
                height: bannerConfig.height,
                position: 'relative',
                cursor: ad.linkUrl ? 'pointer' : 'default',
                overflow: 'hidden'
              }}
              onClick={() => handleBannerClick(ad)}
            >
              {/* Background Image */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${ad.imageUrl || ad.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 1
                  }
                }}
              />

              {/* Content Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: 'white',
                  p: 4
                }}
              >
                <Typography
                  variant={isMobile ? 'h4' : 'h2'}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    mb: 2
                  }}
                >
                  {ad.title}
                </Typography>

                {ad.description && (
                  <Typography
                    variant={isMobile ? 'body1' : 'h6'}
                    sx={{
                      maxWidth: 800,
                      mb: 3,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      lineHeight: 1.6
                    }}
                  >
                    {ad.description}
                  </Typography>
                )}

                {ad.linkUrl && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  >
                    Tìm hiểu thêm
                  </Button>
                )}
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              >
                {/* Animated bubbles effect */}
                {[...Array(6)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      width: Math.random() * 20 + 10,
                      height: Math.random() * 20 + 10,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      '@keyframes float': {
                        '0%, 100%': {
                          transform: 'translateY(0px)',
                        },
                        '50%': {
                          transform: 'translateY(-20px)',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        ))}
      </Slider>

      {/* Custom styles for slider */}
      <style>{`
        .slick-dots {
          bottom: 20px !important;
        }
        .slick-dots li button:before {
          color: white !important;
          font-size: 12px !important;
        }
        .slick-dots li.slick-active button:before {
          color: white !important;
        }
        .slick-prev, .slick-next {
          z-index: 10 !important;
          width: 40px !important;
          height: 40px !important;
        }
        .slick-prev {
          left: 20px !important;
        }
        .slick-next {
          right: 20px !important;
        }
        .slick-prev:before, .slick-next:before {
          font-size: 40px !important;
        }
      `}</style>
    </Box>
  );
};

export default BannerCarousel;
