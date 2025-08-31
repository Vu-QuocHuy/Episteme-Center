import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getTypicalTeachersAPI } from '../../../services/api';
import { Teacher } from '../../../types';

const FeaturedTeachersHome = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch typical teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await getTypicalTeachersAPI(); // Get typical teachers
        console.log('Teachers API Response:', response);

        // Handle different response formats
        let teachersData = [];
        if (response.data?.data?.result) {
          teachersData = response.data.data.result;
        } else if (response.data?.result) {
          teachersData = response.data.result;
        } else if (Array.isArray(response.data)) {
          teachersData = response.data;
        }

        console.log('Teachers Data:', teachersData);
        setTeachers(teachersData);
      } catch (err) {
        console.error('Error fetching typical teachers:', err);
        setError('Không thể tải dữ liệu giáo viên tiêu biểu');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleTeacherClick = (teacherId: string) => {
    navigate(`/teacher/${teacherId}`);
  };

  // Helper function to get default avatar based on gender
  const getDefaultAvatar = (gender: string) => {
    if (gender === 'female') {
      return '/images/anh-1.png'; // Default female avatar
    } else {
      return '/images/ang-chin-yong.webp'; // Default male avatar
    }
  };

  // Helper function to format qualifications
  const formatQualifications = (qualifications: string[]) => {
    if (!qualifications || qualifications.length === 0) return 'Chưa có thông tin';
    return qualifications.join(', ');
  };

  // Helper function to format specializations
  const formatSpecializations = (specializations: string[]) => {
    if (!specializations || specializations.length === 0) return 'Chưa có thông tin';
    return specializations.join(', ');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (teachers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có giáo viên nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', px: 4 }}>
      {/* Tiêu đề */}
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          mb: 4,
          color: '#000',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Giáo viên tiêu biểu
      </Typography>

      <Grid container spacing={4}>
        {teachers.map((teacher) => (
          <Grid item key={teacher.id} xs={12} md={4}>
            <Card
              onClick={() => handleTeacherClick(teacher.id)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                <CardMedia
                  component="img"
                  image={teacher.avatar || getDefaultAvatar(teacher.gender)}
                  alt={teacher.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: 'bold', color: '#000' }}
                >
                  {teacher.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {formatSpecializations(teacher.specializations)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  Bằng cấp: {formatQualifications(teacher.qualifications)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 2, fontWeight: 500 }}
                >
                  Địa chỉ: {teacher.address}
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ lineHeight: 1.6, color: '#555', mb: 2 }}
                >
                  {teacher.description || 'Chưa có mô tả'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 'auto',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }
                  }}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedTeachersHome;
