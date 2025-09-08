import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  Paper,
  Slide,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { Close as CloseIcon, ArrowForward } from '@mui/icons-material';

type AdvertisementMode = 'slider' | 'popup' | 'banner';

type AdvertisementItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  buttonText: string;
};

interface AdvertisementProps {
  mode?: AdvertisementMode;
  userRole?: string;
  autoShow?: boolean;
  autoShowDelay?: number;
  onAdClick?: (ad: AdvertisementItem) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const Advertisement: React.FC<AdvertisementProps> = ({
  mode = 'slider',
  userRole,
  autoShow = true,
  autoShowDelay = 3000,
  onAdClick
}) => {
  const [open, setOpen] = useState<boolean>(mode === 'popup' ? false : true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const getAdvertisements = (): AdvertisementItem[] => {
    const baseAds: AdvertisementItem[] = [
      {
        id: 1,
        title: 'Khóa học IELTS chất lượng cao',
        description: 'Cam kết đầu ra 6.5+ với đội ngũ giáo viên kinh nghiệm. Đăng ký ngay để nhận ưu đãi 20% học phí!',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
        link: '/courses/ielts',
        buttonText: 'Đăng ký ngay'
      },
      {
        id: 2,
        title: 'Lớp Tiếng Anh Giao Tiếp',
        description: 'Phát triển kỹ năng giao tiếp tự tin với phương pháp hiện đại. Khai giảng lớp mới - Số lượng có hạn!',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
        link: '/courses/speaking',
        buttonText: 'Tìm hiểu thêm'
      },
      {
        id: 3,
        title: 'Chương trình học thiếu nhi',
        description: 'Khóa học Tiếng Anh dành cho trẻ em với phương pháp vui nhộn, hiệu quả. Ưu đãi đặc biệt cho học sinh mới!',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
        link: '/courses/kids',
        buttonText: 'Xem chi tiết'
      },
      {
        id: 4,
        title: 'Luyện thi TOEIC 990',
        description: 'Chương trình luyện thi TOEIC chuyên sâu với tỷ lệ đậu cao. Cam kết điểm số hoặc học lại miễn phí!',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
        link: '/courses/toeic',
        buttonText: 'Đăng ký tư vấn'
      }
    ];

    if (userRole === 'parent') {
      return baseAds.map((ad) => {
        if (ad.id === 3) {
          return {
            ...ad,
            title: 'Đăng ký con em học Tiếng Anh',
            description: 'Cho con cơ hội phát triển với chương trình Tiếng Anh chất lượng cao. Ưu đãi đặc biệt cho phụ huynh mới!',
          } as AdvertisementItem;
        }
        return ad;
      });
    } else if (userRole === 'student') {
      return baseAds.filter((ad) => ad.id !== 3);
    }

    return baseAds;
  };

  const advertisements = getAdvertisements();

  useEffect(() => {
    if (autoShow && mode === 'popup') {
      const timer = setTimeout(() => {
        setOpen(true);
      }, autoShowDelay);
      return () => clearTimeout(timer);
    }
  }, [autoShow, mode, autoShowDelay]);

  useEffect(() => {
    if (mode === 'slider' && advertisements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [mode, advertisements.length]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAdClick = (ad: AdvertisementItem) => {
    if (onAdClick) {
      onAdClick(ad);
    }
    // Có thể thêm logic navigation ở đây
    // eslint-disable-next-line no-console
    console.log('Clicked ad:', ad);
  };

  if (mode === 'popup') {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <CloseIcon />
          </IconButton>

          {advertisements[0] && (
            <Card sx={{ boxShadow: 'none' }}>
              <CardMedia
                component="img"
                height="300"
                image={advertisements[0].imageUrl}
                alt={advertisements[0].title}
              />
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {advertisements[0].title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {advertisements[0].description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleAdClick(advertisements[0])}
                  endIcon={<ArrowForward />}
                >
                  {advertisements[0].buttonText}
                </Button>
                <Button
                  variant="text"
                  onClick={handleClose}
                  sx={{ ml: 1 }}
                >
                  Đóng
                </Button>
              </CardActions>
            </Card>
          )}
        </Box>
      </Dialog>
    );
  }

  if (mode === 'banner' && advertisements.length > 0) {
    const currentAd = advertisements[currentIndex];
    return (
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentAd.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={() => handleAdClick(currentAd)}
        >
          <Box sx={{ p: 4, maxWidth: '60%' }}>
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
              {currentAd.title}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              {currentAd.description}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
              endIcon={<ArrowForward />}
            >
              {currentAd.buttonText}
            </Button>
          </Box>
        </Paper>

        {advertisements.length > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2
          }}>
            {advertisements.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        🎯 Khóa học nổi bật
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'grey.100',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 4,
          },
        }}
      >
        {advertisements.map((ad) => (
          <Card
            key={ad.id}
            sx={{
              minWidth: 350,
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            onClick={() => handleAdClick(ad)}
          >
            <CardMedia
              component="img"
              height="200"
              image={ad.imageUrl}
              alt={ad.title}
            />
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                {ad.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {ad.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                endIcon={<ArrowForward />}
              >
                {ad.buttonText}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Advertisement;
