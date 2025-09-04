import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { getParentByIdAPI } from '../../../services/api';
import { Parent } from '../../../types';

const formatGender = (gender?: string) => {
  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Không xác định';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

interface ParentViewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedParent: Parent | null;
}

const ParentViewDialog: React.FC<ParentViewDialogProps> = ({ open, onClose, selectedParent }) => {
  const [parentData, setParentData] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParent = async () => {
      if (!open || !selectedParent?.id) {
        setParentData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getParentByIdAPI(selectedParent.id);
        const payload = (response as any)?.data?.data ?? (response as any)?.data ?? response;
        if (payload) {
          const normalized: any = {
            ...payload,
            students: Array.isArray(payload.students) ? payload.students : [],
          };
          setParentData(normalized as Parent);
        } else {
          setError('Không thể tải thông tin phụ huynh');
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error fetching parent details:', err);
        setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin phụ huynh');
      } finally {
        setLoading(false);
      }
    };

    fetchParent();
  }, [open, selectedParent?.id]);

  const handleClose = () => {
    setParentData(null);
    setError(null);
    onClose();
  };

  if (!selectedParent) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          minHeight: '50vh'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Chi tiết phụ huynh
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Thông tin chi tiết phụ huynh và danh sách con
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ViewIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', p: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        ) : parentData ? (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed', height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                    Thông tin cá nhân
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#667eea' }}>
                          {parentData.name || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {parentData.email || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {parentData.phone || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate((parentData as any).dayOfBirth) || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Giới tính
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatGender((parentData as any).gender) || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {parentData.address || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed', height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                    Danh sách con
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {parentData.students && parentData.students.length > 0 ? (
                      <Grid container spacing={1}>
                        {parentData.students.map((student: any, idx: number) => (
                          <Grid item xs={12} key={student?.id || `child-${idx}`}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {student?.name || 'Không rõ tên'}
                            </Typography>
                            {student?.email && (
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có con
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button
          onClick={handleClose}
          sx={{ px: 3, py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#667eea', color: 'white', '&:hover': { bgcolor: '#5a6fd8' } }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParentViewDialog;
