import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Teacher } from '../../../types';

interface TeacherViewDialogProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  formatDateDDMMYYYY?: (date: string) => string;
}

const TeacherViewDialog: React.FC<TeacherViewDialogProps> = ({
  open,
  onClose,
  teacher,
  formatDateDDMMYYYY
}) => {
  if (!teacher) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          minHeight: '60vh'
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
            Chi tiết giáo viên
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Thông tin chi tiết về giáo viên và chuyên môn
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
        <Box sx={{ p: 4 }}>
          <Box>
            {/* Main Information Grid */}
            <Grid container spacing={3}>
              {/* Left Column - Personal Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Thông tin cá nhân
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {teacher.userId?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {teacher.userId?.email || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">
                          {teacher.userId?.phone || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1">
                          {teacher.userId?.address || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1">
                          {teacher.userId?.dayOfBirth ?
                            (formatDateDDMMYYYY ? formatDateDDMMYYYY(teacher.userId.dayOfBirth) : teacher.userId.dayOfBirth)
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Giới tính
                        </Typography>
                        <Typography variant="body1">
                          {teacher.userId?.gender === 'male' ? 'Nam' : teacher.userId?.gender === 'female' ? 'Nữ' : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Column - Professional Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Thông tin chuyên môn
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Trạng thái
                        </Typography>
                        <Chip
                          label={teacher.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          color={teacher.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Mô tả
                        </Typography>
                        <Typography variant="body1">
                          {teacher.description || 'Chưa có mô tả'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Ngày tạo
                        </Typography>
                        <Typography variant="body1">
                          {teacher.createdAt ?
                            (formatDateDDMMYYYY ? formatDateDDMMYYYY(teacher.createdAt) : teacher.createdAt)
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Cập nhật lần cuối
                        </Typography>
                        <Typography variant="body1">
                          {teacher.updatedAt ?
                            (formatDateDDMMYYYY ? formatDateDDMMYYYY(teacher.updatedAt) : teacher.updatedAt)
                            : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherViewDialog;
