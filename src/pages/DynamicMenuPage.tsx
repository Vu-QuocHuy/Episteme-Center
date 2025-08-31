import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Container, CircularProgress, Alert,
  Grid, Card, CardContent, CardMedia, Button, Chip,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { getMenuByIdAPI } from '../services/api';
import { MenuItem } from '../types';

// Mock content data based on menu slug
const getContentBySlug = (slug: string) => {
  const contentMap: { [key: string]: any } = {
    'khoa-hoc': {
      title: 'Khóa học tiếng Anh',
      subtitle: 'Các khóa học chất lượng cao với cam kết kết quả',
      type: 'courses',
      content: {
        courses: [
          {
            id: 1,
            name: 'IELTS Foundation',
            level: 'Cơ bản',
            duration: '3 tháng',
            price: '2,500,000 VNĐ',
            description: 'Khóa học dành cho người mới bắt đầu học IELTS',
            features: ['Grammar cơ bản', 'Vocabulary building', 'Practice tests'],
            image: '/images/course-ielts.jpg'
          },
          {
            id: 2,
            name: 'IELTS Advanced',
            level: 'Nâng cao',
            duration: '6 tháng',
            price: '4,500,000 VNĐ',
            description: 'Khóa học nâng cao, cam kết điểm 6.5+',
            features: ['Advanced techniques', 'Mock tests', 'Personal coaching'],
            image: '/images/course-advanced.jpg'
          },
          {
            id: 3,
            name: 'Tiếng Anh Giao tiếp',
            level: 'Mọi cấp độ',
            duration: '2 tháng',
            price: '1,800,000 VNĐ',
            description: 'Khóa học giao tiếp thực tế với giáo viên bản ngữ',
            features: ['Conversation practice', 'Real-life scenarios', 'Pronunciation'],
            image: '/images/course-communication.jpg'
          }
        ]
      }
    },
    'gioi-thieu': {
      title: 'Giới thiệu về Trung tâm',
      subtitle: 'Hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục',
      type: 'about',
      content: {
        description: 'Trung tâm Anh ngữ được thành lập với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.',
        features: [
          'Đội ngũ giảng viên 100% có bằng cấp quốc tế',
          'Phương pháp học tập hiện đại với công nghệ AI',
          'Cam kết kết quả học tập cho mọi học viên',
          'Môi trường học tập thân thiện và chuyên nghiệp'
        ],
        stats: [
          { number: '1000+', label: 'Học viên', icon: <PeopleIcon /> },
          { number: '50+', label: 'Giảng viên', icon: <SchoolIcon /> },
          { number: '95%', label: 'Hài lòng', icon: <StarIcon /> },
          { number: '10+', label: 'Năm kinh nghiệm', icon: <BookIcon /> }
        ]
      }
    },
    'su-kien': {
      title: 'Sự kiện & Hoạt động',
      subtitle: 'Các sự kiện và hoạt động ngoại khóa thú vị',
      type: 'events',
      content: {
        events: [
          {
            id: 1,
            title: 'Workshop Tiếng Anh Giao tiếp',
            date: '15/02/2024',
            time: '14:00 - 16:00',
            location: 'Phòng học 101',
            description: 'Workshop thực hành tiếng Anh giao tiếp với giáo viên bản ngữ',
            status: 'upcoming'
          },
          {
            id: 2,
            title: 'Lễ khai giảng khóa IELTS',
            date: '20/02/2024',
            time: '19:00 - 21:00',
            location: 'Hội trường chính',
            description: 'Lễ khai giảng khóa học IELTS mới với cam kết điểm số 6.5+',
            status: 'upcoming'
          },
          {
            id: 3,
            title: 'Cuộc thi hùng biện tiếng Anh',
            date: '01/03/2024',
            time: '09:00 - 17:00',
            location: 'Phòng đa năng',
            description: 'Cuộc thi hùng biện tiếng Anh dành cho học viên các khóa học',
            status: 'upcoming'
          }
        ]
      }
    },
    'lien-he': {
      title: 'Liên hệ với chúng tôi',
      subtitle: 'Hãy liên hệ để được tư vấn và hỗ trợ',
      type: 'contact',
      content: {
        contactInfo: [
          { type: 'Địa chỉ', value: '123 Đường ABC, Quận 1, TP.HCM', icon: <InfoIcon /> },
          { type: 'Điện thoại', value: '028 1234 5678', icon: <InfoIcon /> },
          { type: 'Email', value: 'info@englishcenter.com', icon: <InfoIcon /> },
          { type: 'Giờ làm việc', value: 'Thứ 2 - Thứ 7: 8:00 - 21:00', icon: <InfoIcon /> }
        ],
        form: {
          title: 'Gửi tin nhắn cho chúng tôi',
          fields: ['Họ tên', 'Email', 'Số điện thoại', 'Nội dung']
        }
      }
    }
  };

  return contentMap[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    subtitle: 'Trang đang được phát triển',
    type: 'default',
    content: {
      message: 'Nội dung cho trang này đang được cập nhật. Vui lòng quay lại sau.'
    }
  };
};

const DynamicMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch menu item from API
        const response = await getMenuByIdAPI(slug);
        if (response.data?.data) {
          setMenuItem(response.data.data);
        } else {
          // Fallback to mock data
          setMenuItem({
            id: slug,
            label: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
            sectionId: slug,
            order: 1,
            isActive: true,
            isExternal: false,
            externalUrl: '',
            children: []
          });
        }

        // Get content based on slug
        const pageContent = getContentBySlug(slug);
        setContent(pageContent);
      } catch (error) {
        console.error('Error fetching menu item:', error);
        setError('Không tìm thấy trang này');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [slug]);

  const renderCoursesContent = () => (
    <Grid container spacing={4}>
      {content.content.courses.map((course: any) => (
        <Grid item xs={12} md={4} key={course.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={course.image || '/images/default-course.jpg'}
              alt={course.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip label={course.level} color="primary" size="small" />
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {course.price}
                </Typography>
              </Box>
              <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                {course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {course.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Thời gian:</strong> {course.duration}
              </Typography>
              <List dense>
                {course.features.map((feature: string, index: number) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                Đăng ký ngay
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderAboutContent = () => (
    <Box>
      <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
        {content.content.description}
      </Typography>

      <Grid container spacing={4} sx={{ my: 4 }}>
        {content.content.features.map((feature: string, index: number) => (
          <Grid item xs={12} md={6} key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="body1">{feature}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4, borderRadius: 2, mt: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Thống kê của chúng tôi
        </Typography>
        <Grid container spacing={4}>
          {content.content.stats.map((stat: any, index: number) => (
            <Grid item xs={6} md={3} key={index}>
              <Box textAlign="center">
                <Box sx={{ fontSize: 48, mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="h6">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  const renderEventsContent = () => (
    <Grid container spacing={3}>
      {content.content.events.map((event: any) => (
        <Grid item xs={12} md={6} key={event.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3" fontWeight="bold">
                  {event.title}
                </Typography>
                <Chip
                  label={event.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                  color={event.status === 'upcoming' ? 'warning' : 'default'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {event.description}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Ngày:</strong> {event.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Thời gian:</strong> {event.time}
                </Typography>
                <Typography variant="body2">
                  <strong>Địa điểm:</strong> {event.location}
                </Typography>
              </Box>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Đăng ký tham gia
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderContactContent = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Thông tin liên hệ
        </Typography>
        <List>
          {content.content.contactInfo.map((info: any, index: number) => (
            <ListItem key={index}>
              <ListItemIcon>
                {info.icon}
              </ListItemIcon>
              <ListItemText
                primary={info.type}
                secondary={info.value}
              />
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {content.content.form.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {content.content.form.fields.map((field: string) => (
                <Box key={field}>
                  <Typography variant="body2" gutterBottom>
                    {field}
                  </Typography>
                  <Box
                    sx={{
                      height: 40,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      bgcolor: 'grey.50'
                    }}
                  />
                </Box>
              ))}
              <Button variant="contained" sx={{ mt: 2 }}>
                Gửi tin nhắn
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDefaultContent = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" color="text.secondary">
        {content.content.message}
      </Typography>
    </Box>
  );

  const renderContent = () => {
    switch (content.type) {
      case 'courses':
        return renderCoursesContent();
      case 'about':
        return renderAboutContent();
      case 'events':
        return renderEventsContent();
      case 'contact':
        return renderContactContent();
      default:
        return renderDefaultContent();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !menuItem || !content) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Không tìm thấy trang này'}
        </Alert>
        <Typography variant="h4" gutterBottom>
          Trang không tồn tại
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" gutterBottom fontWeight="bold">
          {content.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {content.subtitle}
        </Typography>
      </Box>

      {renderContent()}
    </Container>
  );
};

export default DynamicMenuPage;
