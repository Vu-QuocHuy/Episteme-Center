import React from 'react';
import { Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination } from '@mui/material';
import PaymentHistoryModal from '../../../../components/common/PaymentHistoryModal';
import { getAllTeacherPaymentsAPI } from '../../../../services/api';

interface TeacherPayment {
  id: string;
  teacherId?: { id?: string; userId?: { id?: string; name?: string }; name?: string };
  teacher?: { id: string; name: string; email: string; phone: string };
  month?: number;
  year?: number;
  salaryPerLesson?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  classes?: Array<{ classId?: { name: string }; totalLessons?: number }>;
}

interface Props {}

const TeacherPaymentsTab: React.FC<Props> = () => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const [payments, setPayments] = React.useState<TeacherPayment[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all');

  const [historyOpen, setHistoryOpen] = React.useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = React.useState<TeacherPayment | null>(null);

  const fetchPayments = React.useCallback(async (page: number = 1) => {
    let params: any = { page, limit: 10 };
    if (paymentStatus !== 'all') params = { ...params, status: paymentStatus };
    if (periodType === 'month') params = { ...params, year: selectedYear, month: selectedMonth };
    else if (periodType === 'quarter') {
      const getQuarterMonths = (q: number) => q === 1 ? { startMonth: 1, endMonth: 3 } : q === 2 ? { startMonth: 4, endMonth: 6 } : q === 3 ? { startMonth: 7, endMonth: 9 } : { startMonth: 10, endMonth: 12 };
      const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
      params = { ...params, year: selectedYear, startMonth, endMonth };
    } else if (periodType === 'year') params = { ...params, year: selectedYear };
    else if (periodType === 'custom') {
      const year = new Date(customStart).getFullYear();
      const startMonth = new Date(customStart).getMonth() + 1;
      const endMonth = new Date(customEnd).getMonth() + 1;
      params = { ...params, year, startMonth, endMonth };
    }
    const res = await getAllTeacherPaymentsAPI(params);
    const data = (res as any)?.data?.data?.result || (res as any)?.data?.result || (res as any)?.data || [];
    const meta = (res as any)?.data?.data?.meta || (res as any)?.data?.meta || { page, totalPages: 1 };
    setPayments(Array.isArray(data) ? data : []);
    setPagination({ page: meta.page || page, totalPages: meta.totalPages || 1 });
  }, [paymentStatus, periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd]);

  React.useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  const onPageChange = (page: number) => fetchPayments(page);

  const openHistory = (payment: TeacherPayment) => {
    setSelectedPaymentForHistory(payment);
    setHistoryOpen(true);
  };
  const closeHistory = () => { setHistoryOpen(false); setSelectedPaymentForHistory(null); };
  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField select label="Trạng thái" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="paid">Đã thanh toán</MenuItem>
          <MenuItem value="pending">Chờ thanh toán</MenuItem>
          <MenuItem value="partial">Nhận một phần</MenuItem>
        </TextField>
        <TextField select label="Thời gian" value={periodType} onChange={(e) => setPeriodType(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="year">Năm</MenuItem>
          <MenuItem value="month">Tháng</MenuItem>
          <MenuItem value="quarter">Quý</MenuItem>
          <MenuItem value="custom">Tùy chọn</MenuItem>
        </TextField>
        {periodType === 'year' && (
          <TextField select label="Năm" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
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
            {payments.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <span>{p.teacher?.name || p.teacherId?.userId?.name || p.teacherId?.name || 'Chưa có tên'}</span>
                </TableCell>
                <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                <TableCell align="right">{(p.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="right">
                  {p.classes && Array.isArray(p.classes) ? p.classes.reduce((sum, c) => sum + (c.totalLessons || 0), 0) : 0}
                </TableCell>
                <TableCell align="right">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">
                  <Chip label={p.status === 'paid' ? 'Đã thanh toán' : p.status === 'partial' ? 'Nhận một phần' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán'} color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : p.status === 'pending' ? 'info' : 'error'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Chip label="Lịch sử" size="small" onClick={() => openHistory(p)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} color="primary" />
      </Box>

      {selectedPaymentForHistory && (
        <PaymentHistoryModal
          open={historyOpen}
          onClose={closeHistory}
          paymentData={selectedPaymentForHistory as any}
          title="Lịch sử thanh toán giáo viên"
          showPaymentDetails={true}
          teacherInfo={null as any}
        />
      )}
    </>
  );
};

export default TeacherPaymentsTab;
