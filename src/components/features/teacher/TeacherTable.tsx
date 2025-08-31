import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Teacher } from '../../../types';

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onViewDetails: (teacher: Teacher) => void;
  loading?: boolean;
}



const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false
}) => {
  const theme = useTheme();





  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (teachers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có giáo viên nào</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          backgroundColor: 'white',
          '& .MuiTableBody-root .MuiTableCell-root': {
            color: 'black !important'
          },
          '& .MuiTableBody-root .MuiTypography-root': {
            color: 'inherit !important'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Họ và tên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Số điện thoại</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lương/buổi</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Bằng cấp</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Chuyên môn</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Tiêu biểu</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers && Array.isArray(teachers) && teachers.map((teacher) => (
              <TableRow key={teacher.id || teacher.teacher_id} hover sx={{
                '& .MuiTableCell-root': { color: '#000000 !important' },
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                  color: '#000000 !important'
                }
              }}>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.name || teacher.userId?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.email || teacher.userId?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.phone || teacher.userId?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.salaryPerLesson ? `${teacher.salaryPerLesson.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {teacher.qualifications?.length > 0 ? (
                    <Box>
                      {teacher.qualifications.map((q, idx) => (
                        <Typography key={idx} variant="body2" sx={{ display: 'block' }}>
                          {q}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      {teacher.experience ? `${teacher.experience} năm kinh nghiệm` : 'Chưa cập nhật'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {teacher.specializations?.length > 0 ? (
                    <Box>
                      {teacher.specializations.map((s, idx) => (
                        <Typography key={idx} variant="body2" sx={{ display: 'block' }}>
                          {s}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      {teacher.specialization || 'Không xác định'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: teacher.isActive ? '#4caf50' : '#f44336',
                      color: 'white',
                      borderRadius: '20px',
                      '&:hover': {
                        backgroundColor: teacher.isActive ? '#45a049' : '#d32f2f'
                      }
                    }}
                  >
                    {teacher.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: teacher.typical ? '#ff9800' : '#9e9e9e',
                      color: 'white',
                      borderRadius: '20px',
                      '&:hover': {
                        backgroundColor: teacher.typical ? '#f57c00' : '#757575'
                      }
                    }}
                  >
                    {teacher.typical ? 'Tiêu biểu' : 'Thường'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(teacher)}
                      sx={{ color: 'grey.600' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(teacher)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(teacher)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!teachers || !Array.isArray(teachers) || teachers.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu giáo viên
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TeacherTable;
