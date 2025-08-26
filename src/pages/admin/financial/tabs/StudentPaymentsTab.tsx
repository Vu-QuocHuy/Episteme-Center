import React from 'react';
import { Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, IconButton, Tooltip } from '@mui/material';
import { History as HistoryIcon, Payment as PaymentIcon } from '@mui/icons-material';

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
  payments: StudentPayment[];
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
  onOpenPayDialog: (payment: any) => void;
}

const StudentPaymentsTab: React.FC<Props> = ({
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
  onOpenPayDialog,
}) => {
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
    </>
  );
};

export default StudentPaymentsTab;
