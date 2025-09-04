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
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  School as EducationIcon,
  Work as WorkIcon,
  AttachMoney as SalaryIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Teacher } from '../../../types';

interface TeacherViewDialogProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  loading?: boolean;
  formatDateDDMMYYYY?: (date: string) => string;
}

const TeacherViewDialog: React.FC<TeacherViewDialogProps> = ({
  open,
  onClose,
  teacher,
  loading = false,
  formatDateDDMMYYYY
}) => {
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

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
            {/* Personal Information - Full Width */}
            <Grid item xs={12}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
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
                    {/* Left Column */}
                    <Grid item xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Họ và tên
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {teacher.name || teacher.userId?.name || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {teacher.email || teacher.userId?.email || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1">
                            {teacher.phone || teacher.userId?.phone || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Địa chỉ
                          </Typography>
                          <Typography variant="body1">
                            {teacher.address || teacher.userId?.address || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Ngày sinh
                          </Typography>
                          <Typography variant="body1">
                            {(() => {
                              const birthDate = teacher.dayOfBirth || teacher.userId?.dayOfBirth;
                              if (!birthDate) return 'N/A';

                              if (formatDateDDMMYYYY) {
                                return formatDateDDMMYYYY(birthDate);
                              }

                              // Fallback formatting if formatDateDDMMYYYY is not provided
                              try {
                                const date = new Date(birthDate);
                                if (isNaN(date.getTime())) return 'N/A';

                                const day = date.getDate().toString().padStart(2, '0');
                                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                const year = date.getFullYear();

                                return `${day}/${month}/${year}`;
                              } catch (error) {
                                return 'N/A';
                              }
                            })()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Giới tính
                          </Typography>
                          <Typography variant="body1">
                            {(teacher.gender || teacher.userId?.gender) === 'male' ? 'Nam' :
                             (teacher.gender || teacher.userId?.gender) === 'female' ? 'Nữ' : 'N/A'}
                          </Typography>
                        </Grid>
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
                            Giáo viên tiêu biểu
                          </Typography>
                          <Chip
                            label={teacher.typical ? 'Tiêu biểu' : 'Thường'}
                            color={teacher.typical ? 'warning' : 'default'}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* Professional Information - 2 Columns */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Left Column */}
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
                    Bằng cấp, chuyên môn
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Grid container spacing={2}>
                      {teacher.salary && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SalaryIcon sx={{ fontSize: 18 }} />
                            Mức lương
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(teacher.salary)}
                          </Typography>
                        </Grid>
                      )}
                      {teacher.workExperience && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon sx={{ fontSize: 18 }} />
                            Kinh nghiệm làm việc
                          </Typography>
                          <Typography variant="body1">
                            {teacher.workExperience} năm
                          </Typography>
                        </Grid>
                      )}

                      {/* Bằng cấp */}
                      {teacher.qualifications && teacher.qualifications.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EducationIcon sx={{ fontSize: 18 }} />
                            Bằng cấp
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {teacher.qualifications.map((qualification, index) => (
                              <Chip
                                key={index}
                                label={qualification}
                                color="secondary"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {/* Chuyên môn */}
                      {teacher.specializations && teacher.specializations.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{
                              width: 4,
                              height: 18,
                              bgcolor: '#667eea',
                              borderRadius: 2
                            }} />
                            Chuyên môn
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {teacher.specializations.map((specialization, index) => (
                              <Chip
                                key={index}
                                label={specialization}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Column */}
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
                    Mô tả
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Typography variant="body1">
                      {teacher.description || 'Chưa có mô tả'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Additional Information Sections - 2 Columns */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Introduction Section - Left Column */}
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
                    <DescriptionIcon sx={{ fontSize: 20 }} />
                    Giới thiệu
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Typography variant="body1">
                      {teacher.introduction || ''}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Work Experience Section - Right Column */}
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
                    <WorkIcon sx={{ fontSize: 20 }} />
                    Kinh nghiệm làm việc
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Typography variant="body1">
                      {teacher.workExperience || ''}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid #e0e6ed',
        backgroundColor: '#f8f9fa'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          startIcon={<CloseIcon />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherViewDialog;
