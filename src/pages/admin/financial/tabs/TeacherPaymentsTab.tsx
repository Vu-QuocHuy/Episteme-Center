import React from 'react';
import { Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination } from '@mui/material';

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

interface Props {
  payments: TeacherPayment[];
  pagination: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
  // filters
  periodType: string;
  setPeriodType: (v: string) => void;
  selectedYear: number;
  setSelectedYear: (v: number) => void;
  selectedMonth: number;
  setSelectedMonth: (v: number) => void;
  selectedQuarter: number;
  setSelectedQuarter: (v: number) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
  paymentStatus: string;
  setPaymentStatus: (v: string) => void;
  years: number[];
  months: number[];
  quarters: number[];
  onOpenHistory: (payment: any) => void;
}

const TeacherPaymentsTab: React.FC<Props> = ({
  payments,
  pagination,
  onPageChange,
  periodType,
  setPeriodType,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedQuarter,
  setSelectedQuarter,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  paymentStatus,
  setPaymentStatus,
  years,
  months,
  quarters,
  onOpenHistory,
}) => {
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
                  <Chip label="Lịch sử" size="small" onClick={() => onOpenHistory(p)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} color="primary" />
      </Box>
    </>
  );
};

export default TeacherPaymentsTab;
