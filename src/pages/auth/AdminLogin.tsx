import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Link as MuiLink
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Email,
  Lock,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { adminLoginValidationSchema } from '../../validations/loginValidation';


interface AdminLoginFormData {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    isSubmitting,
    setIsSubmitting,
    setValue,
    validate
  } = useForm<AdminLoginFormData>(
    {
      email: '',
      password: ''
    },
    adminLoginValidationSchema
  );

  // Clear errors when component unmounts
  useEffect(() => {
    clearError();
    setLoginError('');
    return () => {
      clearError();
    };
  }, [clearError]);

  // Simple autofill detection
  useEffect(() => {
    const detectAutofill = () => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;

      if (emailInput?.value && emailInput.value !== values.email) {
        setValue('email', emailInput.value);
      }
      if (passwordInput?.value && passwordInput.value !== values.password) {
        setValue('password', passwordInput.value);
      }
    };

    // Check immediately and periodically
    detectAutofill();
    const interval = setInterval(detectAutofill, 200);

    // Also listen for events
    const inputs = document.querySelectorAll('input[name="email"], input[name="password"]');
    inputs.forEach(input => {
      input.addEventListener('input', detectAutofill);
      input.addEventListener('change', detectAutofill);
      input.addEventListener('animationstart', detectAutofill); // For CSS animation detection
    });

    return () => {
      clearInterval(interval);
      inputs.forEach(input => {
        input.removeEventListener('input', detectAutofill);
        input.removeEventListener('change', detectAutofill);
        input.removeEventListener('animationstart', detectAutofill);
      });
    };
  }, [values.email, values.password, setValue]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    setLoginError('');

    const isValid = validate();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Use AuthContext login with admin flag (handles API call internally)
      const result = await login({
        email: values.email,
        password: values.password
      }, true); // Pass true to indicate admin login

      if (result && result.user) {
        // Verify this is actually an admin
        // Allow admin (role id 1) and teacher (role id 2)
        const roleId = typeof result.user.role === 'object' ? result.user.role?.id :
                      (result.user.role === 'admin' || result.user.role === 'Admin') ? 1 :
                      (result.user.role === 'teacher' || result.user.role === 'Teacher') ? 2 : 0;

        if (roleId !== 1 && roleId !== 2) {
          setLoginError('Chỉ có quản trị viên và giáo viên mới được phép đăng nhập tại đây');
          setIsSubmitting(false);
          return;
        }

        // Navigate to appropriate dashboard based on role
        if (roleId === 1) {
          navigate('/admin/dashboard', { replace: true });
        } else if (roleId === 2) {
          navigate('/teacher/dashboard', { replace: true });
        }
      } else {
        setLoginError('Email hoặc mật khẩu không chính xác');
      }
    } catch (error: any) {
      console.error('Admin login failed:', error);

      // Handle different error types
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        setLoginError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc CORS settings.');
      } else if (error?.response?.status === 401) {
        setLoginError('Email hoặc mật khẩu không chính xác');
      } else if (error?.response?.status === 403) {
        setLoginError('Bạn không có quyền truy cập hệ thống quản lý');
      } else if (error?.response?.status === 404) {
        setLoginError('Endpoint đăng nhập admin không tồn tại');
      } else {
        setLoginError(`Lỗi đăng nhập: ${error?.message || 'Có lỗi xảy ra khi đăng nhập'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* CSS for autofill detection */}
      <style>
        {`
          @keyframes onAutoFillStart {
            from { /*empty*/ }
            to { /*empty*/ }
          }
          input:-webkit-autofill {
            animation-name: onAutoFillStart;
            animation-duration: 0.001s;
          }
        `}
      </style>

      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        py: 3
      }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AdminPanelSettings sx={{ fontSize: 60, color: 'white', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            Hệ Thống Quản Lý
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Dành cho Quản trị viên & Giáo viên
          </Typography>
        </Box>

        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                Đăng nhập Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhập thông tin để truy cập bảng điều khiển
              </Typography>
              {import.meta.env.DEV && (
                <Typography variant="caption" sx={{
                  display: 'block',
                  mt: 1,
                  p: 1,
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                  borderRadius: 1
                }}>
                  🔧 Development: Sử dụng proxy để bypass CORS
                </Typography>
              )}
            </Box>

            {(authError || loginError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {loginError || authError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting}
                sx={{
                  mb: 3,
                  '& .MuiInputBase-root': {
                    '&.Mui-autofill:focus': {
                      backgroundColor: 'white !important',
                    }
                  },
                  '& .MuiInputBase-input': {
                    '&:-webkit-autofill': {
                      backgroundColor: 'white !important',
                      WebkitBoxShadow: '0 0 0 100px white inset !important',
                      WebkitTextFillColor: '#222 !important',
                      'color': '#222 !important',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                autoComplete="username"
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
                sx={{
                  mb: 4,
                  '& .MuiInputBase-root': {
                    '&.Mui-autofill:focus': {
                      backgroundColor: 'white !important',
                    }
                  },
                  '& .MuiInputBase-input': {
                    '&:-webkit-autofill': {
                      backgroundColor: 'white !important',
                      WebkitBoxShadow: '0 0 0 100px white inset !important',
                      WebkitTextFillColor: '#222 !important',
                      'color': '#222 !important',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mb: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1a3366 30%, #245088 90%)',
                  }
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Đăng nhập'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  hoặc
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <MuiLink
                  component={Link}
                  to="/login"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Đăng nhập tài khoản thường
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2024 English Center Management System
          </Typography>
        </Box>
      </Container>
    </Box>
    </>
  );
};

export default AdminLogin;
