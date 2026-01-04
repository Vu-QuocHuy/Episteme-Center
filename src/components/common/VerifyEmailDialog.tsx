import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { sendVerifyEmailAPI, verifyEmailAPI } from '../../services/auth';
import { validateOtpCode } from '../../validations/forgotPasswordValidation';
import NotificationSnackbar from './NotificationSnackbar';
import BaseDialog from './BaseDialog';

interface VerifyEmailDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess?: () => void;
}

type StepType = 'confirm' | 'verify';

const VerifyEmailDialog: React.FC<VerifyEmailDialogProps> = ({
  open,
  onClose,
  userEmail,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<StepType>('confirm');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep('confirm');
      setVerificationCode('');
      setCodeError('');
      setError('');
      setResendCountdown(0);
    }
  }, [open]);

  const handleSendCode = async () => {
    try {
      setSendingCode(true);
      setError('');

      await sendVerifyEmailAPI();

      // Move to verify step
      setCurrentStep('verify');
      setResendCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    try {
      setSendingCode(true);
      setError('');

      await sendVerifyEmailAPI();

      setResendCountdown(60); // Reset countdown
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã. Vui lòng thử lại.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    setCodeError('');

    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');
      setCodeError('');

      // Validate code
      const validationError = validateOtpCode(verificationCode);
      if (validationError) {
        setCodeError(validationError);
        return;
      }

      // Call API
      await verifyEmailAPI(verificationCode);

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'Xác thực email thành công!',
        severity: 'success',
      });

      // Call success callback and close dialog
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !sendingCode) {
      setCurrentStep('confirm');
      setVerificationCode('');
      setCodeError('');
      setError('');
      setResendCountdown(0);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <BaseDialog
        open={open}
        onClose={handleClose}
        title={currentStep === 'confirm' ? 'Xác thực email' : 'Nhập mã xác thực'}
        subtitle={currentStep === 'confirm'
          ? 'Gửi mã xác thực đến email của bạn'
          : 'Nhập mã 6 chữ số đã được gửi đến email'}
        icon={<VerifiedUserIcon sx={{ fontSize: 24, color: 'white' }} />}
        maxWidth="sm"
        error={error || null}
        loading={sendingCode && currentStep === 'confirm'}
        hideDefaultAction={true}
        actions={
          <>
            <Button
              onClick={currentStep === 'verify' ? () => setCurrentStep('confirm') : handleClose}
              disabled={loading || sendingCode}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {currentStep === 'verify' ? 'Quay lại' : 'Hủy'}
            </Button>
            {currentStep === 'confirm' ? (
              <Button
                onClick={handleSendCode}
                disabled={sendingCode}
                variant="contained"
                startIcon={sendingCode ? <CircularProgress size={20} /> : <EmailIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                {sendingCode ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </Button>
            ) : (
              <Button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                {loading ? 'Đang xác thực...' : 'Xác thực'}
              </Button>
            )}
          </>
        }
      >
        {currentStep === 'confirm' ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                bgcolor: 'white',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <EmailIcon sx={{ color: '#667eea', fontSize: 28 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Email sẽ nhận mã xác thực:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {userEmail}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#f0f9ff', borderRadius: 2, p: 2, border: '1px solid #bae6fd' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  <strong>Lưu ý:</strong> Mã xác thực có hiệu lực trong 5 phút.
                  Vui lòng kiểm tra hộp thư đến và thư mục spam của bạn.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                bgcolor: 'white',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Chúng tôi đã gửi mã xác thực 6 chữ số đến:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
                  {userEmail}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Mã xác thực"
                value={verificationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                error={!!codeError}
                helperText={codeError || 'Nhập mã 6 chữ số'}
                disabled={loading}
                autoFocus
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '8px',
                    fontWeight: 600,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedUserIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    }
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Không nhận được mã?
                </Typography>
                <Button
                  size="small"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || sendingCode}
                  startIcon={<RefreshIcon />}
                  sx={{
                    color: resendCountdown > 0 ? 'text.secondary' : '#667eea',
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: 'transparent',
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {resendCountdown > 0
                    ? `Gửi lại sau ${formatTime(resendCountdown)}`
                    : 'Gửi lại mã'
                  }
                </Button>
              </Box>
            </Box>
          )}
      </BaseDialog>

      <NotificationSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};

export default VerifyEmailDialog;


