import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { HomeContent } from '../../types';
import { mockHomeContent } from '../../utils/mockData';

const DynamicHome: React.FC = () => {
  const [homeContent, setHomeContent] = useState<HomeContent[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    setHomeContent(mockHomeContent);
  }, []);

  const renderHeroSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 12,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h2" component="h1" gutterBottom>
              Chào mừng đến với Trung tâm Anh ngữ
            </Typography>
            <Typography variant="h5" gutterBottom>
              Nơi khơi dậy tiềm năng ngôn ngữ của bạn
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
              Trung tâm Anh ngữ chúng tôi cam kết mang đến chất lượng giáo dục tốt nhất với đội ngũ giảng viên giàu kinh nghiệm.
            </Typography>
            <Button variant="contained" size="large" sx={{ mt: 2 }}>
              Bắt đầu ngay
            </Button>
          </Container>
        </Box>
      );
    }

    return content.map((item, index) => (
      <Box
        key={item.id || index}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            {item.title}
          </Typography>
          {item.subtitle && (
            <Typography variant="h5" gutterBottom>
              {item.subtitle}
            </Typography>
          )}
          {item.description && (
            <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
              {item.description}
            </Typography>
          )}
          {item.buttonText && item.buttonLink && (
            <Button variant="contained" size="large" href={item.buttonLink} sx={{ mt: 2 }}>
              {item.buttonText}
            </Button>
          )}
        </Container>
      </Box>
    ));
  };

  const renderAboutSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center">
              Về chúng tôi
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center' }}>
              Trung tâm Anh ngữ được thành lập năm 2010 với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất.
            </Typography>
          </Container>
        </Box>
      );
    }

    return content.map((item, index) => (
      <Box key={item.id || index} sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom textAlign="center">
            {item.title}
          </Typography>
          {item.subtitle && (
            <Typography variant="h5" gutterBottom textAlign="center" color="text.secondary">
              {item.subtitle}
            </Typography>
          )}
          {item.description && (
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center', mb: 4 }}>
              {item.description}
            </Typography>
          )}
          {item.content && (
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </Box>
          )}
        </Container>
      </Box>
    ));
  };

  const renderServicesSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center">
              Dịch vụ của chúng tôi
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center', mb: 6 }}>
              Chúng tôi cung cấp các khóa học tiếng Anh chất lượng cao cho mọi lứa tuổi.
            </Typography>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom textAlign="center">
            Dịch vụ của chúng tôi
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' }, gap: 4, mt: 6 }}>
            {content.map((item, index) => (
              <Box key={item.id || index} sx={{ textAlign: 'center', p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {item.title}
                </Typography>
                {item.subtitle && (
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    {item.subtitle}
                  </Typography>
                )}
                {item.description && (
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {item.description}
                  </Typography>
                )}
                {item.buttonText && item.buttonLink && (
                  <Button variant="outlined" href={item.buttonLink}>
                    {item.buttonText}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  };

  const renderFeaturesSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center">
              Tính năng nổi bật
            </Typography>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom textAlign="center">
            Tính năng nổi bật
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' }, gap: 4, mt: 6 }}>
            {content.map((item, index) => (
              <Box key={item.id || index} sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {item.title}
                </Typography>
                {item.subtitle && (
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    {item.subtitle}
                  </Typography>
                )}
                {item.description && (
                  <Typography variant="body1">
                    {item.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  };

  const renderTestimonialsSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center">
              Đánh giá từ học viên
            </Typography>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom textAlign="center">
            Đánh giá từ học viên
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' }, gap: 4, mt: 6 }}>
            {content.map((item, index) => (
              <Box key={item.id || index} sx={{ textAlign: 'center', p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                {item.subtitle && (
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    {item.subtitle}
                  </Typography>
                )}
                {item.description && (
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "{item.description}"
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  };

  const renderContactSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" gutterBottom textAlign="center">
              Liên hệ với chúng tôi
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center' }}>
              Đội ngũ tư vấn viên chuyên nghiệp sẽ giúp bạn chọn khóa học phù hợp.
            </Typography>
          </Container>
        </Box>
      );
    }

    return content.map((item, index) => (
      <Box key={item.id || index} sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom textAlign="center">
            {item.title}
          </Typography>
          {item.subtitle && (
            <Typography variant="h5" gutterBottom textAlign="center" color="text.secondary">
              {item.subtitle}
            </Typography>
          )}
          {item.description && (
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center', mb: 4 }}>
              {item.description}
            </Typography>
          )}
          {item.content && (
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </Box>
          )}
          {item.buttonText && item.buttonLink && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button variant="contained" size="large" href={item.buttonLink}>
                {item.buttonText}
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    ));
  };

  const renderFooterSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 4, bgcolor: 'grey.900', color: 'white' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" textAlign="center">
              © 2024 Trung tâm Anh ngữ. Tất cả quyền được bảo lưu.
            </Typography>
          </Container>
        </Box>
      );
    }

    return content.map((item, index) => (
      <Box key={item.id || index} sx={{ py: 4, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          {item.title && (
            <Typography variant="h6" gutterBottom textAlign="center">
              {item.title}
            </Typography>
          )}
          {item.description && (
            <Typography variant="body2" textAlign="center" sx={{ mb: 2 }}>
              {item.description}
            </Typography>
          )}
          {item.content && (
            <Box sx={{
              '& h4': { color: 'white', fontSize: '1.1rem', fontWeight: 'bold', mb: 2 },
              '& ul': { listStyle: 'none', padding: 0, margin: 0 },
              '& li': { marginBottom: '0.5rem' },
              '& a': { color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } },
              '& p': { color: 'grey.300', marginBottom: '0.5rem' }
            }}>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </Box>
          )}
        </Container>
      </Box>
    ));
  };

  return (
    <Box>
      {renderHeroSection(homeContent.filter(item => item.section === 'hero'))}
      {renderAboutSection(homeContent.filter(item => item.section === 'about'))}
      {renderServicesSection(homeContent.filter(item => item.section === 'services'))}
      {renderFeaturesSection(homeContent.filter(item => item.section === 'features'))}
      {renderTestimonialsSection(homeContent.filter(item => item.section === 'testimonials'))}
      {renderContactSection(homeContent.filter(item => item.section === 'contact'))}
      {renderFooterSection(homeContent.filter(item => item.section === 'footer'))}
    </Box>
  );
};

export default DynamicHome;
