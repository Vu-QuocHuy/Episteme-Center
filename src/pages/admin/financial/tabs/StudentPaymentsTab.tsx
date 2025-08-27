import React from 'react';
import { Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography } from '@mui/material';
import { History as HistoryIcon, Payment as PaymentIcon } from '@mui/icons-material';
import PaymentHistoryModal from '../../../../components/common/PaymentHistoryModal';
import { getAllPaymentsAPI, payStudentAPI } from '../../../../services/api';

interface StudentPayment {
  id: string;
  month: number;
  year: number;
  totalLessons: number;
  paidAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  student: { id: string; name: string };
  class: { id: string; name: string };
}

interface Props {
  onTotalsChange?: (totals: { totalStudentFees: number; totalPaidAmount: number; totalRemainingAmount: number }) => void;
}

const StudentPaymentsTab: React.FC<Props> = ({ onTotalsChange }) => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const [payments, setPayments] = React.useState<StudentPayment[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all');

  const [historyOpen, setHistoryOpen] = React.useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = React.useState<StudentPayment | null>(null);

  const [openPayDialog, setOpenPayDialog] = React.useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = React.useState<StudentPayment | null>(null);
  const [studentPaymentForm, setStudentPaymentForm] = React.useState<{ amount: string; method: string; note: string }>({ amount: '', method: 'cash', note: '' });
  const [studentPaymentLoading, setStudentPaymentLoading] = React.useState<boolean>(false);

  const computeAndEmitTotals = React.useCallback((list: StudentPayment[]) => {
    const totalStudentFees = list.reduce((t, p) => t + (p.totalAmount ?? 0), 0);
    const totalPaidAmount = list.reduce((t, p) => t + (p.paidAmount ?? 0), 0);
    const totalRemainingAmount = list.reduce((t, p) => t + ((p.totalAmount ?? 0) - (p.discountAmount ?? 0) - (p.paidAmount ?? 0)), 0);
    if (onTotalsChange) onTotalsChange({ totalStudentFees, totalPaidAmount, totalRemainingAmount });
  }, [onTotalsChange]);

  const fetchPayments = React.useCallback(async (page: number = 1) => {
    let params: any = { page, limit: 10 };
    const filters: any = {};
    if (paymentStatus !== 'all') filters.status = paymentStatus;
    if (periodType === 'month') {
      filters.month = selectedMonth;
      filters.year = selectedYear;
    } else if (periodType === 'quarter') {
      const getQuarterMonths = (q: number) => q === 1 ? { startMonth: 1, endMonth: 3 } : q === 2 ? { startMonth: 4, endMonth: 6 } : q === 3 ? { startMonth: 7, endMonth: 9 } : { startMonth: 10, endMonth: 12 };
      const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
      filters.startMonth = startMonth;
      filters.endMonth = endMonth;
      filters.year = selectedYear;
    } else if (periodType === 'year') {
      filters.year = selectedYear;
    } else if (periodType === 'custom') {
      const year = new Date(customStart).getFullYear();
      const startMonth = new Date(customStart).getMonth() + 1;
      const endMonth = new Date(customEnd).getMonth() + 1;
      filters.startMonth = startMonth;
      filters.endMonth = endMonth;
      filters.year = year;
    }
    if (Object.keys(filters).length > 0) params.filters = JSON.stringify(filters);
    const res = await getAllPaymentsAPI(params);
    const responseData = (res as any)?.data?.data || (res as any)?.data || {};
    const data = responseData;
    if (data && data.result) {
      setPayments(data.result);
      const meta = data.meta;
      setPagination({ page: meta?.page || page, totalPages: meta?.totalPages || 1 });
      computeAndEmitTotals(data.result);
    } else {
      setPayments([]);
      setPagination({ page, totalPages: 1 });
      computeAndEmitTotals([]);
    }
  }, [paymentStatus, periodType, selectedMonth, selectedYear, selectedQuarter, customStart, customEnd, computeAndEmitTotals]);

  React.useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  const onPageChange = (page: number) => fetchPayments(page);

  const onOpenHistory = (payment: any) => {
    setSelectedPaymentForHistory(payment);
    setHistoryOpen(true);
  };
  const onCloseHistory = () => { setHistoryOpen(false); setSelectedPaymentForHistory(null); };

  const onOpenPayDialog = (payment: any) => {
    const remainingAmount = (payment.totalAmount || 0) - (payment.discountAmount || 0) - (payment.paidAmount || 0);
    setSelectedPayment(payment);
    setStudentPaymentForm({ amount: remainingAmount.toString(), method: 'cash', note: '' });
    setOpenPayDialog(true);
  };
  const onClosePayDialog = () => { setOpenPayDialog(false); setSelectedPayment(null); setStudentPaymentForm({ amount: '', method: 'cash', note: '' }); };

  const handleChangeStudentPaymentField = (key: 'amount' | 'method' | 'note', value: string) => {
    setStudentPaymentForm(prev => ({ ...prev, [key]: value }));
  };
  const handleSubmitStudentPayment = async (): Promise<void> => {
    if (!selectedPayment || !studentPaymentForm.amount) return;
    setStudentPaymentLoading(true);
    try {
      await payStudentAPI((selectedPayment as any).id, {
        amount: Number(studentPaymentForm.amount),
        method: studentPaymentForm.method,
        note: studentPaymentForm.note
      });
      onClosePayDialog();
      await fetchPayments(pagination.page);
    } finally {
      setStudentPaymentLoading(false);
    }
  };
  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField select label="Trạng thái" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="paid">Đã thanh toán</MenuItem>
          <MenuItem value="pending">Chờ thanh toán</MenuItem>
          <MenuItem value="partial">Đóng một phần</MenuItem>
        </TextField>
        <TextField select label="Thời gian" value={periodType} onChange={(e) => setPeriodType(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="year">Năm</MenuItem>
          <MenuItem value="month">Tháng</MenuItem>
          <MenuItem value="quarter">Quý</MenuItem>
          <MenuItem value="custom">Tùy chọn</MenuItem>
        </TextField>
        {periodType === 'year' && (
          <TextField select label="Năm" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
            {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
          </TextField>
        )}
        {periodType === 'month' && (
          <>
            <TextField select label="Năm" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
              {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
            </TextField>
            <TextField select label="Tháng" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} sx={{ minWidth: 120 }}>
              {months.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
            </TextField>
          </>
        )}
        {periodType === 'quarter' && (
          <>
            <TextField select label="Năm" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
              {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
            </TextField>
            <TextField select label="Quý" value={selectedQuarter} onChange={(e) => setSelectedQuarter(Number(e.target.value))} sx={{ minWidth: 120 }}>
              {quarters.map((q) => (<MenuItem key={q} value={q}>Q{q}</MenuItem>))}
            </TextField>
          </>
        )}
        {periodType === 'custom' && (
          <>
            <TextField label="Từ ngày" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ minWidth: 150 }} InputLabelProps={{ shrink: true }} />
            <TextField label="Đến ngày" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ minWidth: 150 }} InputLabelProps={{ shrink: true }} />
          </>
        )}
      </Box>

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
            {payments.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.student?.name || 'Chưa có tên'}</TableCell>
                <TableCell>{p.class?.name || 'Chưa có tên lớp'}</TableCell>
                <TableCell align="center">{p.month}/{p.year}</TableCell>
                <TableCell align="center">{p.totalLessons || 0}</TableCell>
                <TableCell align="center">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{(p.discountAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{((p.totalAmount ?? 0) - (p.discountAmount ?? 0)).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{(((p.totalAmount ?? 0) - (p.discountAmount ?? 0)) - (p.paidAmount ?? 0)).toLocaleString()} ₫</TableCell>
                <TableCell align="center">
                  <Chip label={p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'} color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'error'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Lịch sử thanh toán"><IconButton onClick={() => onOpenHistory(p)}><HistoryIcon /></IconButton></Tooltip>
                    {p.status !== 'paid' && (
                      <Tooltip title="Thanh toán"><IconButton color="primary" onClick={() => onOpenPayDialog(p)}><PaymentIcon /></IconButton></Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} color="primary" />
      </Box>

      {/* Payment History Modal */}
      {selectedPaymentForHistory && (
        <PaymentHistoryModal
          open={historyOpen}
          onClose={onCloseHistory}
          paymentData={selectedPaymentForHistory as any}
          title="Lịch sử thanh toán học phí"
          showPaymentDetails={true}
          teacherInfo={null as any}
        />
      )}

      {/* Student Payment Dialog */}
      <Dialog open={openPayDialog} onClose={onClosePayDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thanh toán học phí</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedPayment?.student?.name} - {selectedPayment?.class?.name}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <TextField label="Số tiền thanh toán" type="number" fullWidth value={studentPaymentForm.amount} onChange={(e) => handleChangeStudentPaymentField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <TextField select fullWidth label="Phương thức thanh toán" value={studentPaymentForm.method} onChange={(e) => handleChangeStudentPaymentField('method', e.target.value)}>
              <MenuItem value="cash">Tiền mặt</MenuItem>
              <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
              <MenuItem value="card">Thẻ</MenuItem>
            </TextField>
            <TextField label="Ghi chú" fullWidth value={studentPaymentForm.note} onChange={(e) => handleChangeStudentPaymentField('note', e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClosePayDialog} variant="outlined">Hủy</Button>
          <Button onClick={handleSubmitStudentPayment} variant="contained" disabled={!studentPaymentForm.amount || studentPaymentLoading}>
            {studentPaymentLoading ? <CircularProgress size={20} /> : 'Thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentPaymentsTab;
