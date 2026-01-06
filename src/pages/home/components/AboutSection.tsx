import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const AboutSection: React.FC = () => {
  return (
    <Box id="about-section" sx={{ mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 'bold',
            color: '#000',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 2
          }}
        >
          Về chúng tôi
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 0,
            fontSize: { xs: '1rem', md: '1.2rem' },
            fontWeight: 300
          }}
        >
          Tìm hiểu thêm về Episteme
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(229,57,53,0.2)'
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#e53935',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                10+
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Năm kinh nghiệm
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Phục vụ hàng nghìn học viên với chất lượng giảng dạy hàng đầu
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(25,118,210,0.2)'
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                500+
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Học viên đã tin tưởng
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Cộng đồng học viên năng động và luôn phát triển
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(76,175,80,0.2)'
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#4caf50',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                95%
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Tỷ lệ hài lòng
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Cam kết chất lượng đào tạo xuất sắc được công nhận
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,152,0,0.2)'
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#ff9800',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                20+
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Giáo viên chuyên nghiệp
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Đội ngũ giảng viên giàu kinh nghiệm và tâm huyết
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutSection;
