import React from 'react';
import { useFooterSettings } from '../../hooks/useFooterSettings';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook as FacebookIcon, YouTube as YouTubeIcon,
    Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { COLORS } from '../../utils/colors';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinks {
  about: FooterLink[];
  courses: FooterLink[];
  support: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();
  const { footerSettings, loading } = useFooterSettings();

  const footerLinks: FooterLinks = {
    about: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Đội ngũ giảng viên', href: '/teachers' },
      { label: 'Cơ sở vật chất', href: '/facilities' },
      { label: 'Tuyển dụng', href: '/careers' },
    ],
    courses: [
      { label: 'Tiếng Anh Giao Tiếp', href: '/courses/communication' },
      { label: 'Luyện Thi IELTS', href: '/courses/ielts' },
      { label: 'Tiếng Anh Doanh Nghiệp', href: '/courses/business' },
      { label: 'Tiếng Anh Trẻ Em', href: '/courses/kids' },
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Liên hệ', href: '/contact' },
    ],
  };

  if (loading) return null;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo và thông tin liên hệ */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {footerSettings.companyName || 'Episteme'}
            </Typography>
            {footerSettings.description && (
              <Typography variant="body2" color="grey.400" paragraph>
                {footerSettings.description}
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              {footerSettings.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: COLORS.primary.main }} />
                  <Typography variant="body2">{footerSettings.phone}</Typography>
                </Box>
              )}
              {footerSettings.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: COLORS.primary.main }} />
                  <Typography variant="body2">{footerSettings.email}</Typography>
                </Box>
              )}
              {footerSettings.address && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1, color: COLORS.primary.main }} />
                  <Typography variant="body2">{footerSettings.address}</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Links */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Về chúng tôi
                </Typography>
                {footerLinks.about.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary.main } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Khóa học
                </Typography>
                {footerLinks.courses.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary.main } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Hỗ trợ
                </Typography>
                {footerLinks.support.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary.main } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.800' }} />

        {/* Social media và copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {currentYear} {footerSettings.companyName || 'Episteme'}. All rights reserved.
          </Typography>
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            {footerSettings.facebookUrl && (
              <IconButton color="inherit" aria-label="Facebook" href={footerSettings.facebookUrl} target="_blank" rel="noopener">
                <FacebookIcon />
              </IconButton>
            )}
            {footerSettings.youtubeUrl && (
              <IconButton color="inherit" aria-label="YouTube" href={footerSettings.youtubeUrl} target="_blank" rel="noopener">
                <YouTubeIcon />
              </IconButton>
            )}
            {footerSettings.zaloUrl && (
              <IconButton color="inherit" aria-label="Zalo" href={footerSettings.zaloUrl} target="_blank" rel="noopener">
                <img src="/images/zalo-icon.svg" alt="Zalo" style={{ width: 24, height: 24 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
