import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Avatar,
  Chip, LinearProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon, School as SchoolIcon, Person as PersonIcon,
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon, Class as ClassIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentChildrenAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';

interface ChildClass {
  id: string;
  name: string;
  teacher?: string;
  schedule?: string;
  status: string;
  grade?: string;
  section?: string;
  attendanceRate?: number;
  progress?: number;
}

interface Child {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate: number;
  classes: ChildClass[];
}

interface ChildrenData {
  children: Child[];
  totalChildren: number;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
}

const Children: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [childrenData, setChildrenData] = useState<ChildrenData>({
    children: [],
    totalChildren: 0,
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0
  });
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childDetailsOpen, setChildDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchChildrenData();
    }
  }, [user]);

  const fetchChildrenData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getParentChildrenAPI(user?.id || '');
      if (response.data) {
        setChildrenData(response.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin con');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'đang học':
        return 'success';
      case 'completed':
      case 'hoàn thành':
        return 'default';
      case 'pending':
      case 'chờ':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'đang học':
        return 'Đang học';
      case 'completed':
      case 'hoàn thành':
        return 'Hoàn thành';
      case 'pending':
      case 'chờ':
        return 'Chờ';
      default:
        return status;
    }
  };

  const handleViewChildDetails = (child: Child): void => {
    setSelectedChild(child);
    setChildDetailsOpen(true);
  };

  const handleCloseChildDetails = (): void => {
    setChildDetailsOpen(false);
    setSelectedChild(null);
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.container}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Quản lý con
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Thêm con
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FamilyIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{childrenData.totalChildren}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng số con
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{childrenData.totalClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng lớp học
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{childrenData.activeClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đang học
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ClassIcon sx={{ mr: 2, fontSize: 40, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="h4">{childrenData.completedClasses}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đã hoàn thành
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Children List */}
        <Grid container spacing={3}>
          {childrenData.children.map((child) => (
            <Grid item xs={12} md={6} key={child.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{child.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {child.grade && `${child.grade}${child.section ? ` - ${child.section}` : ''}`}
                        </Typography>
                        {child.dateOfBirth && (
                          <Typography variant="body2" color="textSecondary">
                            Sinh ngày: {formatDate(child.dateOfBirth)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Lớp đang học
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {child.activeClasses}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Tỷ lệ tham gia
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {child.attendanceRate}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Lớp đã hoàn thành
                      </Typography>
                      <Typography variant="h6" color="default">
                        {child.completedClasses}
                      </Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={child.attendanceRate}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleViewChildDetails(child)}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      startIcon={<ScheduleIcon />}
                    >
                      Lịch học
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {childrenData.children.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              Chưa có thông tin con
            </Typography>
          </Box>
        )}

        {/* Child Details Dialog */}
        <Dialog
          open={childDetailsOpen}
          onClose={handleCloseChildDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Chi tiết: {selectedChild?.name}
          </DialogTitle>
          <DialogContent>
            {selectedChild && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin cá nhân
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Họ tên"
                          secondary={selectedChild.name}
                        />
                      </ListItem>
                      {selectedChild.email && (
                        <ListItem>
                          <ListItemText
                            primary="Email"
                            secondary={selectedChild.email}
                          />
                        </ListItem>
                      )}
                      {selectedChild.phone && (
                        <ListItem>
                          <ListItemText
                            primary="Số điện thoại"
                            secondary={selectedChild.phone}
                          />
                        </ListItem>
                      )}
                      {selectedChild.dateOfBirth && (
                        <ListItem>
                          <ListItemText
                            primary="Ngày sinh"
                            secondary={formatDate(selectedChild.dateOfBirth)}
                          />
                        </ListItem>
                      )}
                      {selectedChild.grade && (
                        <ListItem>
                          <ListItemText
                            primary="Khối"
                            secondary={`${selectedChild.grade}${selectedChild.section ? ` - ${selectedChild.section}` : ''}`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Thống kê học tập
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Tổng số lớp"
                          secondary={selectedChild.totalClasses}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Lớp đang học"
                          secondary={selectedChild.activeClasses}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Lớp đã hoàn thành"
                          secondary={selectedChild.completedClasses}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Tỷ lệ tham gia"
                          secondary={`${selectedChild.attendanceRate}%`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Danh sách lớp học
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên lớp</TableCell>
                        <TableCell>Giáo viên</TableCell>
                        <TableCell>Lịch học</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Tỷ lệ tham gia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedChild.classes.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell>{classItem.name}</TableCell>
                          <TableCell>{classItem.teacher || '-'}</TableCell>
                          <TableCell>{classItem.schedule || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(classItem.status)}
                              color={getStatusColor(classItem.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {classItem.attendanceRate !== undefined ? `${classItem.attendanceRate}%` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseChildDetails}>Đóng</Button>
            <Button color="primary" variant="contained">
              Chỉnh sửa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
