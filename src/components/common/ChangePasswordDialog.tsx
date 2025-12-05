import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { changePasswordAPI } from '../../services/auth';
import { validateChangePassword, type ChangePasswordData, type ChangePasswordErrors } from '../../validations/commonValidation';
import NotificationSnackbar from './NotificationSnackbar';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleTogglePasswordVisibility = (field: 'current' | 'newPassword' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate form data
      const validationErrors = validateChangePassword(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Call API
      await changePasswordAPI(
        formData.current,
        formData.newPassword,
        formData.confirm
      );

      // Reset form
      setFormData({
        current: '',
        newPassword: '',
        confirm: '',
      });
      setErrors({});

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'Đổi mật khẩu thành công!',
        severity: 'success',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog after a short delay to allow snackbar to show
      setTimeout(() => {
        handleClose();
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        current: '',
        newPassword: '',
        confirm: '',
      });
      setErrors({});
      setError('');
      onClose();
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LockIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Đổi mật khẩu
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Vui lòng nhập thông tin để đổi mật khẩu
            </Typography>
          </Box>
        </Box>
        {/* Đã có nút Hủy ở footer nên không cần nút đóng (X) trên header */}
      </DialogTitle>

      <DialogContent
        sx={{
          px: 4,
          pt: 3,
          pb: 4,
          bgcolor: '#f9fafb',
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: 'white',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
          }}
        >
          <TextField
            fullWidth
            label="Mật khẩu hiện tại"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.current}
            onChange={(e) => handleInputChange('current', e.target.value)}
            error={!!errors.current}
            helperText={errors.current}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('current')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Mật khẩu mới"
            type={showPasswords.newPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('newPassword')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Xác nhận mật khẩu mới"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirm}
            onChange={(e) => handleInputChange('confirm', e.target.value)}
            error={!!errors.confirm}
            helperText={errors.confirm}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: '#64748b',
            color: '#64748b',
            '&:hover': {
              borderColor: '#475569',
              bgcolor: '#f1f5f9'
            }
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb'
            }
          }}
        >
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Button>
      </DialogActions>
    </Dialog>

    <NotificationSnackbar
      open={snackbar.open}
      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      message={snackbar.message}
      severity={snackbar.severity}
    />
    </>
  );
};

export default ChangePasswordDialog;
