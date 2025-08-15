import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useHomeContentManagement } from '../../hooks/features/useHomeContentManagement';
import { HomeContent } from '../../types';

const DynamicHome: React.FC = () => {
  const { activeContent, loading, error } = useHomeContentManagement();

  const renderHeroSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Container maxWidth="lg">
            <Typography variant="h2" component="h1" gutterBottom>
              Chào mừng đến với Trung tâm Anh ngữ
            </Typography>
            <Typography variant="h5" gutterBottom>
              Nơi khơi dậy tiềm năng ngôn ngữ của bạn
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
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          background: item.imageUrl
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${item.imageUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
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
            <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px' }}>
              {item.description}
            </Typography>
          )}
          {item.buttonText && item.buttonLink && (
            <Button
              variant="contained"
              size="large"
              href={item.buttonLink}
              sx={{ mt: 2 }}
            >
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
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Về chúng tôi
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ maxWidth: '800px', mx: 'auto' }}>
              Trung tâm Anh ngữ chúng tôi cam kết mang đến chất lượng giáo dục tốt nhất
              với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại.
            </Typography>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          {content.map((item, index) => (
            <Box key={item.id || index} sx={{ mb: 4 }}>
              <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
                {item.title}
              </Typography>
              {item.subtitle && (
                <Typography variant="h5" textAlign="center" color="text.secondary" gutterBottom>
                  {item.subtitle}
                </Typography>
              )}
              {item.description && (
                <Typography variant="body1" textAlign="center" sx={{ maxWidth: '800px', mx: 'auto', mb: 3 }}>
                  {item.description}
                </Typography>
              )}
              {item.content && (
                <Box
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  sx={{ maxWidth: '800px', mx: 'auto' }}
                />
              )}
            </Box>
          ))}
        </Container>
      </Box>
    );
  };

  const renderServicesSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Dịch vụ của chúng tôi
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {[
                { title: 'Tiếng Anh Giao tiếp', desc: 'Khóa học tiếng Anh giao tiếp thực tế' },
                { title: 'Luyện thi IELTS', desc: 'Chuẩn bị tốt nhất cho kỳ thi IELTS' },
                { title: 'Tiếng Anh Trẻ em', desc: 'Phương pháp học phù hợp với trẻ em' }
              ].map((service, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Dịch vụ của chúng tôi
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {content.map((item, index) => (
              <Grid item xs={12} md={4} key={item.id || index}>
                <Card sx={{ height: '100%' }}>
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.imageUrl}
                      alt={item.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {item.title}
                    </Typography>
                    {item.subtitle && (
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        {item.subtitle}
                      </Typography>
                    )}
                    {item.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {item.description}
                      </Typography>
                    )}
                    {item.buttonText && item.buttonLink && (
                      <Button
                        variant="outlined"
                        href={item.buttonLink}
                        fullWidth
                      >
                        {item.buttonText}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  };

  const renderFeaturesSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Điểm nổi bật
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {[
                { title: 'Giảng viên chất lượng', desc: 'Đội ngũ giảng viên giàu kinh nghiệm' },
                { title: 'Phương pháp hiện đại', desc: 'Áp dụng công nghệ giảng dạy tiên tiến' },
                { title: 'Môi trường học tập', desc: 'Cơ sở vật chất hiện đại, thoải mái' }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box textAlign="center">
                    <Typography variant="h5" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </Box>
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
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Điểm nổi bật
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {content.map((item, index) => (
              <Grid item xs={12} md={4} key={item.id || index}>
                <Box textAlign="center">
                  {item.imageUrl && (
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                  <Typography variant="h5" component="h3" gutterBottom>
                    {item.title}
                  </Typography>
                  {item.subtitle && (
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {item.subtitle}
                    </Typography>
                  )}
                  {item.description && (
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  };

  const renderTestimonialsSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Phản hồi từ học viên
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {[
                { name: 'Nguyễn Văn A', content: 'Khóa học rất bổ ích, giảng viên nhiệt tình' },
                { name: 'Trần Thị B', content: 'Phương pháp giảng dạy hiện đại và hiệu quả' },
                { name: 'Lê Văn C', content: 'Môi trường học tập rất tốt, kết quả như mong đợi' }
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" paragraph>
                        "{testimonial.content}"
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        - {testimonial.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Phản hồi từ học viên
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {content.map((item, index) => (
              <Grid item xs={12} md={4} key={item.id || index}>
                <Card>
                  <CardContent>
                    {item.description && (
                      <Typography variant="body1" paragraph>
                        "{item.description}"
                      </Typography>
                    )}
                    {item.content && (
                      <Typography variant="body1" paragraph>
                        {item.content}
                      </Typography>
                    )}
                    <Typography variant="subtitle1" color="primary">
                      - {item.title}
                    </Typography>
                    {item.subtitle && (
                      <Typography variant="body2" color="text.secondary">
                        {item.subtitle}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  };

  const renderContactSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Liên hệ với chúng tôi
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất.
            </Typography>
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Button variant="contained" size="large">
                Liên hệ ngay
              </Button>
            </Box>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          {content.map((item, index) => (
            <Box key={item.id || index} textAlign="center">
              <Typography variant="h3" component="h2" gutterBottom>
                {item.title}
              </Typography>
              {item.subtitle && (
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  {item.subtitle}
                </Typography>
              )}
              {item.description && (
                <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}>
                  {item.description}
                </Typography>
              )}
              {item.content && (
                <Box
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}
                />
              )}
              {item.buttonText && item.buttonLink && (
                <Button
                  variant="contained"
                  size="large"
                  href={item.buttonLink}
                >
                  {item.buttonText}
                </Button>
              )}
            </Box>
          ))}
        </Container>
      </Box>
    );
  };

  const renderFooterSection = (content: HomeContent[]) => {
    if (!content || content.length === 0) {
      return (
        <Box sx={{ py: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" textAlign="center">
              © 2024 Trung tâm Anh ngữ. Tất cả quyền được bảo lưu.
            </Typography>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          {content.map((item, index) => (
            <Box key={item.id || index} textAlign="center">
              {item.title && (
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
              )}
              {item.description && (
                <Typography variant="body2" paragraph>
                  {item.description}
                </Typography>
              )}
              {item.content && (
                <Box
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  sx={{ color: 'white' }}
                />
              )}
            </Box>
          ))}
        </Container>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Đang tải nội dung...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" color="error" textAlign="center">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      {renderHeroSection(activeContent.hero)}
      {renderAboutSection(activeContent.about)}
      {renderServicesSection(activeContent.services)}
      {renderFeaturesSection(activeContent.features)}
      {renderTestimonialsSection(activeContent.testimonials)}
      {renderContactSection(activeContent.contact)}
      {renderFooterSection(activeContent.footer)}
    </Box>
  );
};

export default DynamicHome;

