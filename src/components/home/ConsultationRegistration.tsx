import React, { useState } from 'react';
import { Box, Grid, Typography, TextField, Button, Paper, Snackbar, Alert } from '@mui/material';
import { createRegistrationAPI } from '../../services/api';

const ConsultationRegistration: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success'|'error'}>({ open: false, message: '', severity: 'success' });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setSnackbar({ open: true, message: 'Vui lòng nhập Họ tên và Số điện thoại', severity: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      await createRegistrationAPI({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        processed: false
      });
      setSnackbar({ open: true, message: 'Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ sớm.', severity: 'success' });
      setForm({ name: '', phone: '', email: '', address: '' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Đăng ký thất bại. Vui lòng thử lại.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
      <Grid container maxWidth="lg" sx={{ mx: 'auto' }} spacing={4} alignItems="center">
        <Grid item xs={12} md={7}>
          <Box component="img" src="/images/regist.JPG" alt="consultation" sx={{ width: '100%', borderRadius: 2, display: { xs: 'none', md: 'block' } }} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h4" color="error" fontWeight={800} sx={{ mb: 2, textAlign: 'center' }}>
              ĐĂNG KÝ NHẬN TƯ VẤN
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField placeholder="Họ Tên" value={form.name} onChange={handleChange('name')} fullWidth />
              <TextField placeholder="Số điện thoại" value={form.phone} onChange={handleChange('phone')} fullWidth />
              <TextField placeholder="Email" value={form.email} onChange={handleChange('email')} fullWidth />
              <TextField placeholder="Địa chỉ" value={form.address} onChange={handleChange('address')} fullWidth />
              <Button variant="contained" color="error" size="large" onClick={handleSubmit} disabled={submitting} sx={{ mt: 1 }}>
                ĐĂNG KÝ NGAY
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsultationRegistration;
