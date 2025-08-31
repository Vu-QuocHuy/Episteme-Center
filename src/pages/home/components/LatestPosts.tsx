import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Chip, useTheme, useMediaQuery, Skeleton, Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getLatestPostsAPI } from '../../../services/api';
import { Post } from '../../../types';

const LatestPosts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getLatestPostsAPI(8);
        if (response.data?.data) {
          setPosts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Không thể tải bài viết mới nhất');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Helper function to get first image from file_dto
  const getFirstImage = (post: Post) => {
    const imageFile = post.file_dto?.find(file =>
      file.fileType.startsWith('image/') ||
      file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    return imageFile ? imageFile.downloadUrl : '/images/default-post.jpg';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Bài viết mới nhất
          </Typography>
          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Bài viết mới nhất
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
          Cập nhật tin tức và thông tin mới nhất từ trung tâm
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {posts.slice(0, 4).map((post) => (
            <Grid item xs={12} sm={6} md={3} key={post.post_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getFirstImage(post)}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={formatDate(post.create_at)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom component="h3">
                    {truncateText(post.title, 50)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Tác giả:</strong> {post.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {truncateText(post.content.replace(/<[^>]*>/g, ''), 100)}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/posts/${post.post_id}`}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    Đọc thêm
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/posts"
            variant="contained"
            size="large"
            sx={{ px: 4 }}
          >
            Xem tất cả bài viết
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LatestPosts;
