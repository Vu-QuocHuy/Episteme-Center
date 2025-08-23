import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { useStudentManagement } from '../../hooks/features/useStudentManagement';
import { useStudentForm } from '../../hooks/features/useStudentForm';
import { StudentForm, StudentTable, StudentFilters, StudentViewDialog } from '../../components/features/student';
import { Student } from '../../types';
import { getStudentByIdAPI } from '../../services/api';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const StudentManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Custom hooks
  const {
    students,
    loading,
    loadingTable,
    // page,
    // totalPages,
    searchQuery,
    setSearchQuery,
    parentDetails,
    fetchStudents,
    deleteStudent,
    // handlePageChange,
  } = useStudentManagement();

  const {
    // form,
    // classEdits,
    // formErrors,
    formLoading,
    // formError,
    // handleChange,
    // handleClassEditChange,
    setFormData,
    resetForm,
    handleSubmit,
  } = useStudentForm();

  // Dialog handlers
  const handleOpenDialog = async (student: Student | null = null): Promise<void> => {
    setOpenDialog(true);
    if (student?.id) {
      try {
        const res = await getStudentByIdAPI(student.id);
        const payload: any = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        setSelectedStudent(payload);
        setFormData(payload || undefined);
      } catch (e) {
        // Fallback to existing row data if API fails
        setSelectedStudent(student);
        setFormData(student || undefined);
      }
    } else {
      setSelectedStudent(null);
      setFormData(undefined);
    }
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedStudent(null);
      resetForm();
    }, 100);
  };

  const handleFormSubmit = async (): Promise<void> => {
    const result = await handleSubmit(selectedStudent || undefined, () => {
      handleCloseDialog();
      fetchStudents();
    });

    if (result.success) {
      setSnackbar({
        open: true,
        message: selectedStudent ? 'Cập nhật học sinh thành công!' : 'Thêm học sinh thành công!',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: result.message || 'Có lỗi xảy ra',
        severity: 'error'
      });
    }
  };

  const handleOpenDeleteDialog = (student: Student): void => {
    setStudentToDelete(student);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (): void => {
    setStudentToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteStudent = async (): Promise<void> => {
    if (!studentToDelete) return;

    const result = await deleteStudent(studentToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  };

  const handleOpenViewDialog = (studentData: Student): void => {
    // Chỉ cần truyền ID và thông tin cơ bản để hiển thị loading
    setSelectedStudentForView({
      id: studentData.id,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender,
      dayOfBirth: studentData.dayOfBirth,
      address: studentData.address,
      userId: studentData.userId,
      parentId: studentData.parentId,
      classes: studentData.classes,
      role: studentData.role as any,
    } as unknown as Student);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setSelectedStudentForView(null);
    setOpenViewDialog(false);
  };

  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Học viên
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm học sinh
            </Button>
          </Box>

          <StudentFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <StudentTable
            students={students}
            loading={loadingTable}
            onEdit={(student: Student) => handleOpenDialog(student)}
            onDelete={(studentId: string) => {
              const student = students.find(s => s.id === studentId);
              if (student) handleOpenDeleteDialog(student);
            }}
            onViewDetails={handleOpenViewDialog}
          />
        </Box>
      </Box>

      <StudentForm
        open={openDialog}
        onClose={handleCloseDialog}
        student={selectedStudent}
        onSubmit={async () => {
          await handleFormSubmit();
        }}
        loading={formLoading}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteStudent}
        title="Xác nhận xóa học sinh"
        message={studentToDelete ? `Bạn có chắc chắn muốn xóa học sinh "${studentToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      <StudentViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        selectedStudent={selectedStudentForView as any}
        parentDetails={parentDetails}
      />

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </DashboardLayout>
  );
};

export default StudentManagement;
