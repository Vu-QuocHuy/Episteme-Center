import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, IconButton, Button, Tooltip
} from '@mui/material';
import { History as HistoryIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { getPaymentsAPI, getTeacherPaymentsAPI, payTeacherAPI, getTotalPaymentsAPI, getTeacherByIdAPI } from '../../services/api';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface StudentPayment {
  id: string;
  studentId?: {
    userId?: { name: string; };
    name?: string;
  };
  classId?: { name: string; };
  month?: number;
  year?: number;
  attendedLessons?: number;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  status?: string;
}

interface TeacherPayment {
  id: string;
  teacherId?: {
    id?: string;
    userId?: { id?: string; name?: string; };
    name?: string;
  };
  month?: number;
  year?: number;
  salaryPerLesson?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  classes?: Array<{
    classId?: { name: string; };
    totalLessons?: number;
  }>;
}

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface TotalStatistics {
  totalStudentFees: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalTeacherSalary: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface TeacherDetailInfo {
  userId?: { email?: string; phone?: string; };
  email?: string;
  phone?: string;
}

interface TeacherPaymentConfirmData {
  teacher: TeacherPayment;
  paymentData: { amount: number; method: string; note: string; };
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const FinancialStatisticsPanel: React.FC = () => {
  const [periodType, setPeriodType] = useState<string>('year');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [tab, setTab] = useState<number>(0);
  const [customStart, setCustomStart] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPayment[]>([]);
  const [studentPaymentsLoaded, setStudentPaymentsLoaded] = useState<boolean>(false);
  const [studentPagination, setStudentPagination] = useState<PaginationState>({
    page: 1, limit: 10, totalPages: 1, totalResults: 0
  });
  const [teacherPagination, setTeacherPagination] = useState<PaginationState>({
    page: 1, limit: 10, totalPages: 1, totalResults: 0
  });
  const [totalStatistics, setTotalStatistics] = useState<TotalStatistics>({
    totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0, totalTeacherSalary: 0
  });

  // Modal states
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<StudentPayment | TeacherPayment | null>(null);
  const [teacherPaymentLoading, setTeacherPaymentLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [teacherPaymentConfirmOpen, setTeacherPaymentConfirmOpen] = useState<boolean>(false);
  const [teacherPaymentConfirmData, setTeacherPaymentConfirmData] = useState<TeacherPaymentConfirmData | null>(null);
  const [teacherDetailInfo, setTeacherDetailInfo] = useState<TeacherDetailInfo | null>(null);
  const [fixedTotalTeacherSalary, setFixedTotalTeacherSalary] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>('all');

  const paymentStatuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'partial', label: 'Đóng một phần' },
    { value: 'pending', label: 'Chờ thanh toán' },
  ];

  const getQuarterMonths = (quarter: number): { startMonth: number; endMonth: number } => {
    switch (quarter) {
      case 1: return { startMonth: 1, endMonth: 3 };
      case 2: return { startMonth: 4, endMonth: 6 };
      case 3: return { startMonth: 7, endMonth: 9 };
      case 4: return { startMonth: 10, endMonth: 12 };
      default: return { startMonth: 1, endMonth: 3 };
    }
  };

  const fetchTotalStatistics = async (): Promise<void> => {
    try {
      const totalPaymentsRes = await getTotalPaymentsAPI();
      const { total: totalStudentFees, paid: totalPaidAmount } = totalPaymentsRes.data;
      const totalRemainingAmount = totalStudentFees - totalPaidAmount;
      const totalTeacherSalary = teacherPayments.reduce((total, p) => total + (p.totalAmount ?? 0), 0);

      setTotalStatistics({
        totalStudentFees, totalPaidAmount, totalRemainingAmount, totalTeacherSalary
      });
    } catch (err) {
      console.error('Error fetching total statistics:', err);
    }
  };

  const fetchStudentPayments = async (page: number = 1): Promise<void> => {
    try {
      let params: any = { page, limit: 10 };
      if (paymentStatus !== 'all') params = { ...params, status: paymentStatus };
      if (periodType === 'month') params = { ...params, year: selectedYear, month: selectedMonth };
      else if (periodType === 'quarter') {
        const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
        params = { ...params, year: selectedYear, startMonth, endMonth };
      } else if (periodType === 'year') params = { ...params, year: selectedYear };
      else if (periodType === 'custom') {
        const year = new Date(customStart).getFullYear();
        const startMonth = new Date(customStart).getMonth() + 1;
        const endMonth = new Date(customEnd).getMonth() + 1;
        params = { ...params, year, startMonth, endMonth };
      }

      const res = await getPaymentsAPI(params);
      setStudentPayments(res.data || []);
      setStudentPagination({
        page, limit: 10, totalPages: (res as any).totalPages || 1,
        totalResults: (res as any).totalResults || (res.data ? res.data.length : 0)
      });
      setStudentPaymentsLoaded(true);
    } catch (err) {
      setStudentPayments([]);
      setStudentPagination({ page: 1, limit: 10, totalPages: 1, totalResults: 0 });
    } finally {
      // Loading completed
    }
  };

  const fetchTeacherPayments = async (page: number = 1): Promise<void> => {
    try {
      let params: any = { page, limit: 10 };
      if (paymentStatus !== 'all') params = { ...params, status: paymentStatus };
      if (periodType === 'month') params = { ...params, year: selectedYear, month: selectedMonth };
      else if (periodType === 'quarter') {
        const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
        params = { ...params, year: selectedYear, startMonth, endMonth };
      } else if (periodType === 'year') params = { ...params, year: selectedYear };
      else if (periodType === 'custom') {
        const year = new Date(customStart).getFullYear();
        const startMonth = new Date(customStart).getMonth() + 1;
        const endMonth = new Date(customEnd).getMonth() + 1;
        params = { ...params, year, startMonth, endMonth };
      }

      const res = await getTeacherPaymentsAPI(params);
      setTeacherPayments(res.data || []);
      setTeacherPagination({
        page, limit: 10, totalPages: (res as any).totalPages || 1,
        totalResults: (res as any).totalResults || (res.data ? res.data.length : 0)
      });
    } catch (err) {
      setTeacherPayments([]);
      setTeacherPagination({ page: 1, limit: 10, totalPages: 1, totalResults: 0 });
    } finally {
      // Loading completed
    }
  };

  useEffect(() => {
    fetchTeacherPayments(1);
    fetchTotalStatistics();
    setStudentPaymentsLoaded(false);
    setStudentPagination(prev => ({ ...prev, page: 1 }));
    setTeacherPagination(prev => ({ ...prev, page: 1 }));
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  useEffect(() => {
    if (tab === 1 && !studentPaymentsLoaded) {
      fetchStudentPayments(1);
    }
  }, [tab, periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  useEffect(() => {
    if (tab === 1) {
      fetchStudentPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  useEffect(() => {
    const fetchFixedTotalTeacherSalary = async (): Promise<void> => {
      try {
        const res = await getTeacherPaymentsAPI({ page: 1, limit: 10000 });
        const all = res.data || [];
        const total = all.reduce((sum: number, p: any) => sum + (p.totalAmount ?? 0), 0);
        setFixedTotalTeacherSalary(total);
      } catch (err) {
        setFixedTotalTeacherSalary(0);
      }
    };
    fetchFixedTotalTeacherSalary();
  }, []);

  useEffect(() => {
    if (paymentStatus !== 'all') {
      fetchStudentPayments(1);
      fetchTeacherPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
      setTeacherPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [paymentStatus]);

  const handleStudentPageChange = (_: React.ChangeEvent<unknown>, newPage: number): void => {
    fetchStudentPayments(newPage);
  };

  const handleTeacherPageChange = (_: React.ChangeEvent<unknown>, newPage: number): void => {
    fetchTeacherPayments(newPage);
  };

  const handleOpenPaymentHistory = async (payment: StudentPayment | TeacherPayment): Promise<void> => {
    setSelectedPaymentForHistory(payment);
    setPaymentHistoryModalOpen(true);
    const teacherId = (payment as TeacherPayment).teacherId?.id || (payment as TeacherPayment).teacherId?.userId?.id;
    if (teacherId) {
      try {
        const res = await getTeacherByIdAPI(teacherId);
        const teacherData = res.data || res;
        setTeacherDetailInfo(teacherData);
      } catch (err) {
        console.error('Error fetching teacher info:', err);
        setTeacherDetailInfo(null);
      }
    } else {
      setTeacherDetailInfo(null);
    }
  };

  const handleClosePaymentHistory = (): void => {
    setSelectedPaymentForHistory(null);
    setPaymentHistoryModalOpen(false);
  };





  const handleConfirmTeacherPaymentFinal = async (): Promise<void> => {
    if (!teacherPaymentConfirmData) return;

    setTeacherPaymentLoading(true);
    setTeacherPaymentConfirmOpen(false);

    try {
      const teacherId = teacherPaymentConfirmData.teacher.teacherId?.id || teacherPaymentConfirmData.teacher.teacherId?.userId?.id;
      if (!teacherId) {
        throw new Error('Không tìm thấy ID giáo viên');
      }
      await payTeacherAPI(
        teacherId,
        teacherPaymentConfirmData.paymentData,
        { month: teacherPaymentConfirmData.teacher.month, year: teacherPaymentConfirmData.teacher.year }
      );
      setSnackbar({ open: true, message: 'Thanh toán lương giáo viên thành công!', severity: 'success' });
      await fetchTeacherPayments();
      await fetchTotalStatistics();
    } catch (error: any) {
      console.error('Lỗi thanh toán lương giáo viên:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán lương giáo viên',
        severity: 'error'
      });
    } finally {
      setTeacherPaymentLoading(false);
      setTeacherPaymentConfirmData(null);
    }
  };



  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê tài chính
      </Typography>

      {/* Cards tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng lương giáo viên</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{fixedTotalTeacherSalary.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học phí</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">{totalStatistics.totalStudentFees.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{totalStatistics.totalPaidAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">{totalStatistics.totalRemainingAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bộ lọc thời gian */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth label="Loại thống kê" value={periodType} onChange={e => setPeriodType(e.target.value)}>
              <MenuItem value="month">Tháng</MenuItem>
              <MenuItem value="quarter">Quý</MenuItem>
              <MenuItem value="year">Năm</MenuItem>
              <MenuItem value="custom">Tùy chỉnh</MenuItem>
            </TextField>
          </Grid>
          {periodType !== 'custom' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Năm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'month' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Tháng" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'quarter' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Quý" value={selectedQuarter} onChange={e => setSelectedQuarter(Number(e.target.value))}>
                {quarters.map(q => <MenuItem key={q} value={q}>Quý {q}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'custom' && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth label="Trạng thái thanh toán" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
              {paymentStatuses.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs bảng chi tiết */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chi tiết giáo viên" />
          <Tab label="Chi tiết học sinh" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Giáo viên</TableCell>
                    <TableCell align="center">Tháng/Năm</TableCell>
                    <TableCell align="right">Lương/buổi</TableCell>
                    <TableCell align="right">Số buổi dạy</TableCell>
                    <TableCell align="right">Tổng lương</TableCell>
                    <TableCell align="right">Đã trả</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teacherPayments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {p.teacherId?.userId?.name || p.teacherId?.name || 'Chưa có tên'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                      <TableCell align="right">{(p.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="right">
                        {p.classes && Array.isArray(p.classes)
                          ? p.classes.reduce((sum, classItem) => sum + (classItem.totalLessons || 0), 0)
                          : 0
                        }
                      </TableCell>
                      <TableCell align="right">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.status === 'paid' ? 'Đã thanh toán' : p.status === 'partial' ? 'Nhận một phần' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán'}
                          color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : p.status === 'pending' ? 'info' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="primary" onClick={() => console.log('View detail:', p)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lịch sử thanh toán">
                          <IconButton size="small" color="info" onClick={() => handleOpenPaymentHistory(p)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {((p.totalAmount ?? 0) - (p.paidAmount ?? 0) > 0) && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => console.log('Payment for:', p)}
                          >
                            Thanh toán
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={teacherPagination.totalPages}
                page={teacherPagination.page}
                onChange={handleTeacherPageChange}
                color="primary"
              />
            </Box>
            </>
          )}
          {tab === 1 && (
            <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Học sinh</TableCell>
                    <TableCell>Lớp</TableCell>
                    <TableCell align="center">Tháng</TableCell>
                    <TableCell align="center">Số buổi học</TableCell>
                    <TableCell align="center">Số tiền gốc</TableCell>
                    <TableCell align="center">Giảm giá</TableCell>
                    <TableCell align="center">Số tiền cuối</TableCell>
                    <TableCell align="center">Đã đóng</TableCell>
                    <TableCell align="center">Còn thiếu</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {studentPayments.map((p) => (
                    <TableRow key={p.id} hover>
                        <TableCell>{p.studentId?.userId?.name || p.studentId?.name || 'Chưa có tên'}</TableCell>
                        <TableCell>{p.classId?.name || 'Chưa có tên lớp'}</TableCell>
                        <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                        <TableCell align="center">{p.attendedLessons || 0}</TableCell>
                      <TableCell align="center">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="center">{(p.discountAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.finalAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.remainingAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                            color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      <TableCell align="center">
                          <IconButton onClick={() => handleOpenPaymentHistory(p)}>
                            <HistoryIcon />
                          </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={studentPagination.totalPages}
                  page={studentPagination.page}
                  onChange={handleStudentPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </Paper>

             {/* Payment History Modal */}
       {selectedPaymentForHistory && (
         <PaymentHistoryModal
           open={paymentHistoryModalOpen}
           onClose={handleClosePaymentHistory}
           paymentData={selectedPaymentForHistory as any}
           title="Lịch sử thanh toán học phí"
           showPaymentDetails={true}
           teacherInfo={teacherDetailInfo as any}
         />
       )}

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      {/* Confirm Dialog for Teacher Payment */}
      <ConfirmDialog
        open={teacherPaymentConfirmOpen}
        onClose={() => setTeacherPaymentConfirmOpen(false)}
        onConfirm={handleConfirmTeacherPaymentFinal}
        title="Xác nhận thanh toán lương giáo viên"
        message={`Bạn có chắc chắn muốn thanh toán lương cho giáo viên ${teacherPaymentConfirmData?.teacher?.teacherId?.userId?.name || 'Giáo viên'} tháng ${teacherPaymentConfirmData?.teacher?.month}/${teacherPaymentConfirmData?.teacher?.year} với số tiền ${teacherPaymentConfirmData?.paymentData?.amount.toLocaleString()} ₫?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={teacherPaymentLoading}
      />
    </Box>
  );
};

export default FinancialStatisticsPanel;
