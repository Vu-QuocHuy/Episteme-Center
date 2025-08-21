import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  Alert
} from '@mui/material';
import {
  Security,
  AdminPanelSettings,
  School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedAccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 3
    }}>
      <Container maxWidth="sm">
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <Security sx={{
              fontSize: 80,
              color: 'warning.main',
              mb: 3
            }} />

            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Truy cập bị từ chối
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Bạn đang cố gắng truy cập vào trang đăng nhập không phù hợp với vai trò của mình.
            </Typography>

            <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Hướng dẫn đăng nhập:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • <strong>Học sinh & Phụ huynh:</strong> Sử dụng trang đăng nhập chính
              </Typography>
              <Typography variant="body2">
                • <strong>Quản trị viên & Giáo viên:</strong> Sử dụng trang đăng nhập hệ thống quản lý
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<School />}
                onClick={() => navigate('/login')}
                sx={{ minWidth: 180 }}
              >
                Học sinh & Phụ huynh
              </Button>

              <Button
                variant="outlined"
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate('/staff/login')}
                sx={{ minWidth: 180 }}
              >
                Quản trị & Giáo viên
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Vui lòng chọn trang đăng nhập phù hợp với vai trò của bạn
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UnauthorizedAccess;
