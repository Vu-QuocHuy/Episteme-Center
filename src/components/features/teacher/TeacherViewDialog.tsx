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
  List,
  ListItem,
  ListItemText,
  Divider,
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
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1">
                          {teacher.dayOfBirth ?
                            (formatDateDDMMYYYY ? formatDateDDMMYYYY(teacher.dayOfBirth) : teacher.dayOfBirth)
                            : teacher.userId?.dayOfBirth ?
                            (formatDateDDMMYYYY ? formatDateDDMMYYYY(teacher.userId.dayOfBirth) : teacher.userId.dayOfBirth)
                            : 'N/A'}
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

            {/* Additional Information Sections */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Description Section */}
              {teacher.description && (
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
                      <DescriptionIcon sx={{ fontSize: 20 }} />
                      Mô tả
                    </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e6ed'
                    }}>
                      <Typography variant="body1">
                        {teacher.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Qualifications Section */}
              {teacher.qualifications && teacher.qualifications.length > 0 && (
                <Grid item xs={12} md={6}>
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
                      <EducationIcon sx={{ fontSize: 20 }} />
                      Bằng cấp
                    </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e6ed'
                    }}>
                      <List dense>
                        {teacher.qualifications.map((qualification, index) => (
                          <React.Fragment key={index}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText
                                primary={qualification}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  sx: { fontWeight: 500 }
                                }}
                              />
                            </ListItem>
                            {index < teacher.qualifications!.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Specializations Section */}
              {teacher.specializations && teacher.specializations.length > 0 && (
                <Grid item xs={12} md={6}>
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
                      Chuyên môn
                    </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e6ed',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
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
                  </Paper>
                </Grid>
              )}
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
