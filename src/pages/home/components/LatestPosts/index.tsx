import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  Box, Typography, Card, CardContent, CardMedia, Chip, IconButton,
  useTheme, useMediaQuery, Skeleton, Alert
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for posts (replace with real API later)
const mockPosts = [
  {
    id: 1,
    title: 'Khóa học IELTS mới - Cam kết điểm số 6.5+',
    content: 'Trung tâm ra mắt khóa học IELTS mới với phương pháp học tập hiện đại, cam kết điểm số 6.5+ cho học viên.',
    author: 'Admin',
    createdAt: '2024-01-15',
    imageUrl: '/images/post1.jpg',
    category: 'Khóa học'
  },
  {
    id: 2,
    title: 'Lịch khai giảng tháng 2/2024',
    content: 'Thông báo lịch khai giảng các khóa học tiếng Anh giao tiếp, IELTS và tiếng Anh trẻ em tháng 2/2024.',
    author: 'Admin',
    createdAt: '2024-01-14',
    imageUrl: '/images/post2.jpg',
    category: 'Thông báo'
  },
  {
    id: 3,
    title: 'Kết quả thi IELTS tháng 12/2023',
    content: 'Chúc mừng các học viên đã đạt được kết quả xuất sắc trong kỳ thi IELTS tháng 12/2023.',
    author: 'Admin',
    createdAt: '2024-01-13',
    imageUrl: '/images/post3.jpg',
    category: 'Kết quả'
  },
  {
    id: 4,
    title: 'Phương pháp học tiếng Anh hiệu quả',
    content: 'Chia sẻ những phương pháp học tiếng Anh hiệu quả dành cho người mới bắt đầu.',
    author: 'Giảng viên',
    createdAt: '2024-01-12',
    imageUrl: '/images/post4.jpg',
    category: 'Học tập'
  },
  {
    id: 5,
    title: 'Hoạt động ngoại khóa tháng 1/2024',
    content: 'Các hoạt động ngoại khóa thú vị giúp học viên thực hành tiếng Anh trong môi trường thực tế.',
    author: 'Admin',
    createdAt: '2024-01-11',
    imageUrl: '/images/post5.jpg',
    category: 'Hoạt động'
  },
  {
    id: 6,
    title: 'Tuyển dụng giảng viên tiếng Anh',
    content: 'Trung tâm tuyển dụng giảng viên tiếng Anh có kinh nghiệm và bằng cấp quốc tế.',
    author: 'HR',
    createdAt: '2024-01-10',
    imageUrl: '/images/post6.jpg',
    category: 'Tuyển dụng'
  }
];

const LatestPosts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const sliderRef = useRef<Slider>(null);

  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with real API call
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const previous = () => {
    sliderRef.current?.slickPrev();
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 1 : 3,
    slidesToScroll: 1,
    swipe: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePostClick = (postId: number) => {
    navigate(`/posts/${postId}`);
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
          <Typography variant="h3" textAlign="center" gutterBottom fontWeight="bold">
            Bài viết mới nhất
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item}>
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
        <Typography
          variant="h3"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          Bài viết mới nhất
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative' }}>
          {/* Navigation Buttons */}
          <IconButton
            onClick={previous}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              display: { xs: 'none', md: 'flex' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={next}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              display: { xs: 'none', md: 'flex' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          {/* Posts Slider */}
          <Slider ref={sliderRef} {...settings}>
            {posts.map((post) => (
              <Box key={post.id} sx={{ px: 1 }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    }
                  }}
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.imageUrl || '/images/default-post.jpg'}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(post.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1
                      }}
                    >
                      {post.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                        lineHeight: 1.5
                      }}
                    >
                      {post.content}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {post.author}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>

          {/* View All Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography
              variant="h6"
              component="button"
              onClick={() => navigate('/posts')}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'primary.dark',
                }
              }}
            >
              + Xem thêm bài viết
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LatestPosts;
