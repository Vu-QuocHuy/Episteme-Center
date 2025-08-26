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

import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

// Custom hooks
import { Teacher } from '../../types';
import { useTeacherManagement } from '../../hooks/features/useTeacherManagement';
import { useTeacherForm } from '../../hooks/features/useTeacherForm';
import { createTeacherAPI, updateTeacherAPI } from '../../services/api';

// Components
import TeacherForm from '../../components/features/teacher/TeacherForm';
import TeacherTable from '../../components/features/teacher/TeacherTable';
import TeacherFilters from '../../components/features/teacher/TeacherFilters';
import TeacherViewDialog from '../../components/features/teacher/TeacherViewDialog';

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
    selectedTeacher: teacherDetail,
    loading,
    loadingDetail,
    totalRecords,
    searchQuery,
    setSearchQuery,
    isActiveFilter,
    setIsActiveFilter,
    fetchTeachers,
    getTeacherById,
    deleteTeacher
  } = useTeacherManagement();

  // Teacher form hook
  const {
    loading: formLoading,
    setFormData,
    resetForm,
  } = useTeacherForm();

  // Local state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Dialog handlers
  const handleOpenDialog = async (teacher: Teacher): Promise<void> => {
    // Chỉnh sửa teacher - Gọi API để lấy thông tin chi tiết
    const detailData = await getTeacherById(teacher.id);
    setSelectedTeacher(teacher);

    // Sử dụng dữ liệu từ API response để set form
    if (detailData) {
      // Map API response to form structure (sử dụng type assertion vì form cần structure cũ)
      const formData = {
        id: detailData.id,
        userId: {
          id: detailData.id,
          name: detailData.name,
          email: detailData.email,
          phone: detailData.phone,
          gender: detailData.gender,
          dayOfBirth: detailData.dayOfBirth,
          address: detailData.address,
          role: 'teacher' as const,
          avatar: detailData.avatar || undefined,
        },
        isActive: detailData.isActive,
        description: detailData.description,
        qualifications: detailData.qualifications,
        specializations: detailData.specializations,
        salary: detailData.salary,
        workExperience: detailData.workExperience,
      } as Teacher;
      setFormData(formData);
    } else {
      setFormData(teacher);
    }
    setOpenDialog(true);
  };

  const handleOpenAddDialog = (): void => {
    // Tạo mới teacher
    setSelectedTeacher(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedTeacher(null);
    }, 300);
  };

  const handleOpenViewDialog = async (teacher: Teacher): Promise<void> => {
    await getTeacherById(teacher.id);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setOpenViewDialog(false);
  };

  const handleAskDeleteTeacher = (teacher: Teacher): void => {
    console.log('🔍 Teacher to delete:', teacher);
    console.log('🔍 Teacher ID:', teacher.id);
    setTeacherToDelete(teacher);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (): void => {
    setOpenDeleteDialog(false);
    setTeacherToDelete(null);
  };

  const handleFormSubmit = async (teacherData: Partial<Teacher>): Promise<void> => {
    try {
      if (selectedTeacher) {
        // Update existing teacher
        await updateTeacherAPI(selectedTeacher.id, teacherData as any);
        setSnackbar({ open: true, message: 'Cập nhật giáo viên thành công!', severity: 'success' });
      } else {
        // Create new teacher
        await createTeacherAPI(teacherData as any);
        setSnackbar({ open: true, message: 'Tạo giáo viên thành công!', severity: 'success' });
      }

      handleCloseDialog();
      if (fetchTeachers) {
        fetchTeachers();
      }
    } catch (error: any) {
      console.error('API call failed:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo viên';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteTeacher = async (): Promise<void> => {
    if (!teacherToDelete || !deleteTeacher) return;

    const teacherId = teacherToDelete.id || teacherToDelete.teacher_id;
    console.log('🗑️ Deleting teacher with ID:', teacherId);
    const result = await deleteTeacher(teacherId);

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
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Giáo viên
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={commonStyles.primaryButton}
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
            teachers={teachers}
            loading={loading}
            onEdit={handleOpenDialog}
            onDelete={handleAskDeleteTeacher}
            onViewDetails={handleOpenViewDialog}
          />
        </Box>
      </Box>

      {/* Dialogs */}
      <TeacherForm
        open={openDialog}
        onClose={handleCloseDialog}
        teacher={selectedTeacher}
        onSubmit={handleFormSubmit}
        loading={formLoading || loadingDetail}
      />

      <TeacherViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        teacher={teacherDetail}
        loading={loadingDetail}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteTeacher}
        title="Xác nhận xóa giáo viên"
        message={teacherToDelete?.userId?.name ? `Bạn có chắc chắn muốn xóa giáo viên "${teacherToDelete.userId.name}"? Hành động này không thể hoàn tác.` : 'Bạn có chắc chắn muốn xóa giáo viên này? Hành động này không thể hoàn tác.'}
        loading={loading}
      />

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </DashboardLayout>
  );
};

export default TeacherManagement;
