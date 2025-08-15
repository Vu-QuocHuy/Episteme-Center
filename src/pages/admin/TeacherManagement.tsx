import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

// Custom hooks
import { Teacher } from '../../types';
import { useTeacherManagement } from '../../hooks/features/useTeacherManagement';
import { useTeacherForm } from '../../hooks/features/useTeacherForm';

// Components
import TeacherForm from '../../components/features/teacher/TeacherForm';
import TeacherTable from '../../components/features/teacher/TeacherTable';
import TeacherFilters from '../../components/features/teacher/TeacherFilters';
import TeacherViewDialog from '../../components/features/teacher/TeacherViewDialog';

// Utils


interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface Summary {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  totalSalary: number;
}

const TeacherManagement: React.FC = () => {
  // Teacher management hook
  const {
    teachers,
    loading,
    loadingTable,
    totalRecords,
    searchQuery,
    setSearchQuery,
    isActiveFilter,
    setIsActiveFilter,
    fetchTeachers,
    deleteTeacher
  } = useTeacherManagement();

  // Teacher form hook
  const {
    loading: formLoading,
    setFormData,
    resetForm,
    handleSubmit
  } = useTeacherForm();

  // Local state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<Teacher | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Dialog handlers
  const handleOpenDialog = (teacher: Teacher | null = null): void => {
    setSelectedTeacher(teacher);
    setFormData(teacher || undefined);
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedTeacher(null);
      resetForm();
    }, 100);
  };

  const handleOpenViewDialog = (teacherData: Teacher): void => {
    setSelectedTeacherForView(teacherData);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setSelectedTeacherForView(null);
    setOpenViewDialog(false);
  };

  const handleOpenDeleteDialog = (teacher: Teacher): void => {
    setTeacherToDelete(teacher);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (): void => {
    setTeacherToDelete(null);
    setOpenDeleteDialog(false);
  };



  // Action handlers
  const handleFormSubmit = async (): Promise<void> => {
    const result = await handleSubmit(selectedTeacher || undefined, () => {
      handleCloseDialog();
      if (fetchTeachers) {
        fetchTeachers();
      }
    });

    if (result.success) {
      setSnackbar({ open: true, message: result.message || 'Thành công', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: result.message || 'Có lỗi xảy ra', severity: 'error' });
    }
  };

  const handleDeleteTeacher = async (): Promise<void> => {
    if (!teacherToDelete || !deleteTeacher) return;

    const result = await deleteTeacher(teacherToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  };

  // Calculate summary
  const summary: Summary = {
    totalTeachers: totalRecords,
    activeTeachers: teachers?.filter((t: any) => t.isActive).length || 0,
    inactiveTeachers: teachers?.filter((t: any) => !t.isActive).length || 0,
    totalSalary: teachers?.reduce((sum: number, t: any) => sum + (t.salaryPerLesson || 0), 0) || 0
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" component="h1">
                Quản lý giáo viên
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: COLORS.primary.main }}
              >
                Thêm giáo viên
              </Button>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng giáo viên"
                  value={summary.totalTeachers}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Đang hoạt động"
                  value={summary.activeTeachers}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Ngừng hoạt động"
                  value={summary.inactiveTeachers}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng lương"
                  value={new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(summary.totalSalary)}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Filters */}
            <TeacherFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isActiveFilter={isActiveFilter || ''}
              setIsActiveFilter={setIsActiveFilter || (() => {})}
            />

            {/* Table */}
            <TeacherTable
              teachers={teachers || []}
              loading={loadingTable}
              onEdit={(teacher: any) => handleOpenDialog(teacher)}
              onDelete={(teacherId: string) => {
                const teacher = teachers?.find((t: any) => t.id === teacherId);
                if (teacher) {
                  handleOpenDeleteDialog(teacher);
                }
              }}
              onViewDetails={(teacher: any) => handleOpenViewDialog(teacher)}
              onViewClasses={() => {}}
            />

            {/* Dialogs */}
            <TeacherForm
              open={openDialog}
              onClose={handleCloseDialog}
              teacher={selectedTeacher as any}
              onSubmit={handleFormSubmit}
              loading={formLoading}
            />

            <TeacherViewDialog
              open={openViewDialog}
              onClose={handleCloseViewDialog}
              teacher={selectedTeacherForView as any}
            />

            <ConfirmDialog
              open={openDeleteDialog}
              onClose={handleCloseDeleteDialog}
              onConfirm={handleDeleteTeacher}
              title="Xác nhận xóa giáo viên"
              message={teacherToDelete ? `Bạn có chắc chắn muốn xóa giáo viên "${teacherToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
              loading={loading}
            />

            <NotificationSnackbar
              open={snackbar.open}
              message={snackbar.message}
              severity={snackbar.severity}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherManagement;
