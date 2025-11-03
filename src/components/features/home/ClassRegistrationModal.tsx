import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  EventNote as EventIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { getClassByIdAPI } from '../../../services/classes';
import { createRegistrationAPI } from '../../../services/registrations';

interface ClassRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  classId: string | null;
  className?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade?: number;
  section?: number;
  year?: number;
  description?: string;
  feePerLesson?: number;
  max_student?: number;
  room?: string;
  teacher?: {
    id: string;
    name: string;
    email?: string;
  };
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

const ClassRegistrationModal: React.FC<ClassRegistrationModalProps> = ({
  open,
  onClose,
  classId,
  className
}) => {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Fetch class info khi modal mở
  useEffect(() => {
    if (open && classId) {
      fetchClassInfo();
    }
    // Reset form và success state khi modal đóng
    if (!open) {
      setForm({ name: '', phone: '', email: '', address: '' });
      setSuccess(false);
      setError(null);
    }
  }, [open, classId]);

  const fetchClassInfo = async () => {
    if (!classId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getClassByIdAPI(classId);
      const data = response?.data?.data || response?.data;
      setClassInfo(data);
    } catch (err: any) {
      console.error('Error fetching class info:', err);
      setError('Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createRegistrationAPI({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        classId: classId || undefined,
        processed: false
      });

      setSuccess(true);
      setForm({ name: '', phone: '', email: '', address: '' });

      // Tự động đóng sau 2 giây
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError('Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDayOfWeekLabel = (day: string): string => {
    const days: { [key: string]: string } = {
      '1': 'Thứ 2',
      '2': 'Thứ 3',
      '3': 'Thứ 4',
      '4': 'Thứ 5',
      '5': 'Thứ 6',
      '6': 'Thứ 7',
      '7': 'Chủ nhật',
      '0': 'Chủ nhật'
    };
    return days[day] || `Thứ ${day}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Đăng ký tư vấn
            </Typography>
            {className && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {className}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : success ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'success.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3
            }}>
              <Typography variant="h1" sx={{ color: 'success.main' }}>✓</Typography>
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600} color="success.main">
              Đăng ký thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </Typography>
          </Box>
        ) : (
          <Grid container sx={{ minHeight: 400 }}>
            {/* Left side - Class Info */}
            <Grid item xs={12} md={6} sx={{
              bgcolor: 'grey.50',
              p: 3,
              borderRight: { md: '1px solid', borderColor: 'divider' }
            }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Thông tin lớp học
              </Typography>

              {classInfo ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Tên lớp */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SchoolIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        Tên lớp
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600} sx={{ pl: 3.5 }}>
                      {classInfo.name}
                    </Typography>
                    {classInfo.grade && classInfo.section && (
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5 }}>
                        Lớp {classInfo.grade}.{classInfo.section} • Năm {classInfo.year}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Giảng viên */}
                  {classInfo.teacher && (
                    <>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                            Giảng viên
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ pl: 3.5 }}>
                          {classInfo.teacher.name}
                        </Typography>
                      </Box>
                      <Divider />
                    </>
                  )}

                  {/* Lịch học */}
                  {classInfo.schedule && (
                    <>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EventIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                            Lịch học
                          </Typography>
                        </Box>
                        <Box sx={{ pl: 3.5, display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          {classInfo.schedule.days_of_week?.map((day, idx) => (
                            <Chip
                              key={idx}
                              label={getDayOfWeekLabel(day)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        {classInfo.schedule.time_slots && (
                          <Box sx={{ pl: 3.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {classInfo.schedule.time_slots.start_time} - {classInfo.schedule.time_slots.end_time}
                            </Typography>
                          </Box>
                        )}
                        {classInfo.schedule.start_date && classInfo.schedule.end_date && (
                          <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5, mt: 0.5 }}>
                            Từ {formatDate(classInfo.schedule.start_date)} đến {formatDate(classInfo.schedule.end_date)}
                          </Typography>
                        )}
                      </Box>
                      <Divider />
                    </>
                  )}

                  {/* Học phí */}
                  {classInfo.feePerLesson && classInfo.feePerLesson > 0 && (
                    <>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MoneyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                            Học phí
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600} color="error.main" sx={{ pl: 3.5 }}>
                          {classInfo.feePerLesson.toLocaleString('vi-VN')}đ / buổi
                        </Typography>
                      </Box>
                      <Divider />
                    </>
                  )}

                  {/* Mô tả */}
                  {classInfo.description && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                        Mô tả
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {classInfo.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có thông tin lớp học
                </Typography>
              )}
            </Grid>

            {/* Right side - Registration Form */}
            <Grid item xs={12} md={6} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Thông tin đăng ký
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  required
                  label="Họ và tên"
                  placeholder="Nhập họ và tên của bạn"
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <TextField
                  fullWidth
                  required
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  placeholder="Nhập email (không bắt buộc)"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ (không bắt buộc)"
                  value={form.address}
                  onChange={handleChange('address')}
                  disabled={submitting}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <Paper sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                  <Typography variant="body2" color="info.dark">
                    <strong>Lưu ý:</strong> Sau khi đăng ký, chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để tư vấn chi tiết về lớp học.
                  </Typography>
                </Paper>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={submitting || !form.name.trim() || !form.phone.trim()}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    }
                  }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Đang xử lý...
                    </>
                  ) : (
                    'ĐĂNG KÝ NGAY'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassRegistrationModal;
