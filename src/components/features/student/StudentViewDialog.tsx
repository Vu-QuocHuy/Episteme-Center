import React from 'react';
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
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
// Helper functions
const renderParent = (studentId: string, parentDetails: Record<string, string>) => {
  if (!studentId) return '-';
  const parentName = parentDetails[studentId];
  if (parentName) {
    return parentName;
  }
  return 'Không có phụ huynh';
};

const formatGender = (gender?: string) => {
  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Không xác định';
};
import { Student } from '../../../types';

interface StudentViewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedStudent: Student | null;
  parentDetails: Record<string, string>;
}

const StudentViewDialog: React.FC<StudentViewDialogProps> = ({
  open,
  onClose,
  selectedStudent,
  parentDetails,
}) => {
  if (!selectedStudent) return null;

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
            Chi tiết học sinh
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Thông tin chi tiết về học sinh và lớp học
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
          {/* Main Information Grid */}
          <Grid container spacing={3}>
            {/* Left Column - Personal Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e6ed',
                height: '100%'
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
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Họ và tên
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#667eea' }}>
                        {selectedStudent.userId?.name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedStudent.userId?.email}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedStudent.userId?.phone}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Ngày sinh
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedStudent.userId?.dayOfBirth}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Giới tính
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatGender(selectedStudent.userId?.gender)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedStudent.userId?.address}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column - Family & Class Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e6ed',
                height: '100%'
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
                  Thông tin gia đình & học tập
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      border: '1px solid #2196f3'
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Phụ huynh
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#1976d2' }}>
                        {renderParent(selectedStudent.id, parentDetails)}
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                      border: '1px solid #9c27b0'
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Số lớp đang học
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                        {selectedStudent.classes ? selectedStudent.classes.length : 0}
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      border: '1px solid #4caf50'
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Trạng thái học tập
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                        {selectedStudent.classes && selectedStudent.classes.length > 0 ? 'Đang học' : 'Chưa đăng ký lớp'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Full Width - Class Details */}
            {selectedStudent.classes && selectedStudent.classes.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed'
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
                    Danh sách lớp học
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Grid container spacing={2}>
                      {selectedStudent.classes.map((cls, index) => (
                        <Grid item xs={12} md={4} key={String(cls.classId?.id || cls.classId || `view-class-${index}`)}>
                          <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            background: cls.status === 'active'
                              ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                              : 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                            border: `2px solid ${cls.status === 'active' ? '#4caf50' : '#ff9800'}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <Typography variant="subtitle2" sx={{
                              fontWeight: 600,
                              mb: 1,
                              color: cls.status === 'active' ? '#2e7d32' : '#e65100'
                            }}>
                              {cls.classId?.name || `Lớp ${cls.classId?.grade || ''}.${cls.classId?.section || ''}`}
                            </Typography>
                            <Typography variant="body2" sx={{
                              fontWeight: 500,
                              color: cls.status === 'active' ? '#2e7d32' : '#e65100',
                              mb: 1
                            }}>
                              {cls.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                            </Typography>
                            {cls.discountPercent && (
                              <Typography variant="caption" sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                fontWeight: 600
                              }}>
                                Giảm {cls.discountPercent}%
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button
          onClick={onClose}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#667eea',
            color: 'white',
            '&:hover': { bgcolor: '#5a6fd8' }
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentViewDialog;
