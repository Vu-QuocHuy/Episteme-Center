import React from 'react';
import { Box, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography, Badge, Chip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { History as HistoryIcon, Payment as PaymentIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import PaymentHistoryModal from '../../../../components/common/PaymentHistoryModal';
import { getAllPaymentsAPI, payStudentAPI, exportPaymentsReportAPI, processPaymentRequestAPI } from '../../../../services/payments';
import * as XLSX from 'xlsx';

interface PaymentRequest {
  id: number;
  amount: number;
  imageProof: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt: string | null;
  processedBy: any;
  rejectionReason: string | null;
}

interface PaymentHistory {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  createdAt: string;
  createdBy: any;
}

interface StudentPayment {
  id: string;
  month: number;
  year: number;
  totalLessons: number;
  paidAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  student: { id: string; name: string; email?: string; phone?: string };
  class: { id: string; name: string };
  paymentRequests?: PaymentRequest[];
  histories?: PaymentHistory[];
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
  const [exportLoading, setExportLoading] = React.useState<boolean>(false);

  // Payment Request Dialog States
  const [openRequestDialog, setOpenRequestDialog] = React.useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = React.useState<PaymentRequest | null>(null);
  const [selectedPaymentForRequest, setSelectedPaymentForRequest] = React.useState<StudentPayment | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState<string>('');
  const [requestProcessing, setRequestProcessing] = React.useState<boolean>(false);

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
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
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

      // Backend returns JSON: { statusCode, message, data: { meta, result } }
      const res = await exportPaymentsReportAPI(filters);
      const data = (res as any)?.data?.data || (res as any)?.data || {};
      const list = Array.isArray(data.result) ? (data.result as StudentPayment[]) : [];

      const rows = list.map((p) => ({
        'Học sinh': p.student?.name || '',
        'Lớp': p.class?.name || '',
        'Tháng/Năm': `${p.month}/${p.year}`,
        'Số buổi học': p.totalLessons || 0,
        'Số tiền gốc (₫)': p.totalAmount || 0,
        'Giảm giá (₫)': p.discountAmount || 0,
        'Số tiền cuối (₫)': (p.totalAmount || 0) - (p.discountAmount || 0),
        'Đã đóng (₫)': p.paidAmount || 0,
        'Còn thiếu (₫)': ((p.totalAmount || 0) - (p.discountAmount || 0)) - (p.paidAmount || 0),
        'Trạng thái': p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng',
      }));
      const totalLessons = rows.reduce((s, r) => s + Number((r as any)['Số buổi học'] || 0), 0);
      const totalOriginal = rows.reduce((s, r) => s + Number((r as any)['Số tiền gốc (₫)'] || 0), 0);
      const totalDiscount = rows.reduce((s, r) => s + Number((r as any)['Giảm giá (₫)'] || 0), 0);
      const totalFinal = rows.reduce((s, r) => s + Number((r as any)['Số tiền cuối (₫)'] || 0), 0);
      const totalPaid = rows.reduce((s, r) => s + Number((r as any)['Đã đóng (₫)'] || 0), 0);
      const totalRemaining = rows.reduce((s, r) => s + Number((r as any)['Còn thiếu (₫)'] || 0), 0);
      rows.push({
        'Học sinh': 'Tổng',
        'Lớp': '',
        'Tháng/Năm': '',
        'Số buổi học': totalLessons,
        'Số tiền gốc (₫)': totalOriginal,
        'Giảm giá (₫)': totalDiscount,
        'Số tiền cuối (₫)': totalFinal,
        'Đã đóng (₫)': totalPaid,
        'Còn thiếu (₫)': totalRemaining,
        'Trạng thái': '',
      } as any);

      const ws = XLSX.utils.json_to_sheet(rows);
      const colWidths = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(k.length, ...rows.map(r => String((r as any)[k] ?? '').length)) + 2 }));
      (ws as any)['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ChiTietHocSinh');
      const now = new Date();
      XLSX.writeFile(wb, `BaoCao_HocSinh_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.xlsx`);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      alert('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.');
    } finally {
      setExportLoading(false);
    }
  };

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

  // Payment Request Handlers
  const onOpenRequestDialog = (request: PaymentRequest, payment: StudentPayment) => {
    setSelectedRequest(request);
    setSelectedPaymentForRequest(payment);
    setRejectionReason('');
    setOpenRequestDialog(true);
  };

  const onCloseRequestDialog = () => {
    setOpenRequestDialog(false);
    setSelectedRequest(null);
    setSelectedPaymentForRequest(null);
    setRejectionReason('');
  };

  const handleApproveRequest = async () => {
    console.log('=== handleApproveRequest START ===');
    console.log('selectedRequest:', selectedRequest);

    if (!selectedRequest) {
      console.error('❌ selectedRequest is null or undefined');
      return;
    }

    console.log('Request ID:', selectedRequest.id);
    console.log('Request ID type:', typeof selectedRequest.id);

    setRequestProcessing(true);
    try {
      console.log('🔄 Calling processPaymentRequestAPI with action: approve');
      const response = await processPaymentRequestAPI(String(selectedRequest.id), 'approve');
      console.log('✅ API Response:', response);

      onCloseRequestDialog();
      await fetchPayments(pagination.page);
      console.log('✅ Payment request approved successfully');
    } catch (error: any) {
      console.error('❌ Lỗi khi phê duyệt yêu cầu:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      });
      alert(`Có lỗi xảy ra khi phê duyệt yêu cầu: ${error?.response?.data?.message || error?.message || 'Vui lòng thử lại.'}`);
    } finally {
      setRequestProcessing(false);
      console.log('=== handleApproveRequest END ===');
    }
  };

  const handleRejectRequest = async () => {
    console.log('=== handleRejectRequest START ===');
    console.log('selectedRequest:', selectedRequest);
    console.log('rejectionReason:', rejectionReason);

    if (!selectedRequest || !rejectionReason.trim()) {
      console.error('❌ Missing required data:', {
        hasSelectedRequest: !!selectedRequest,
        rejectionReasonLength: rejectionReason?.trim()?.length || 0
      });
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    console.log('Request ID:', selectedRequest.id);
    console.log('Request ID type:', typeof selectedRequest.id);

    setRequestProcessing(true);
    try {
      console.log('🔄 Calling processPaymentRequestAPI with action: reject');
      const response = await processPaymentRequestAPI(String(selectedRequest.id), 'reject', rejectionReason);
      console.log('✅ API Response:', response);

      onCloseRequestDialog();
      await fetchPayments(pagination.page);
      console.log('✅ Payment request rejected successfully');
    } catch (error: any) {
      console.error('❌ Lỗi khi từ chối yêu cầu:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      });
      alert(`Có lỗi xảy ra khi từ chối yêu cầu: ${error?.response?.data?.message || error?.message || 'Vui lòng thử lại.'}`);
    } finally {
      setRequestProcessing(false);
      console.log('=== handleRejectRequest END ===');
    }
  };
  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
              {quarters.map((q) => (<MenuItem key={q} value={q}>Quý {q}</MenuItem>))}
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
        <Box>
          <Button
            variant="outlined"
            startIcon={exportLoading ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={exportToExcel}
            disabled={exportLoading}
          >
            {exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
        </Box>
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
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: p.status === 'paid' ? '#2e7d32' : p.status === 'partial' ? '#f9a825' : '#c62828',
                      border: `1px solid ${p.status === 'paid' ? '#2e7d32' : p.status === 'partial' ? '#f9a825' : '#c62828'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Tooltip title="Lịch sử thanh toán">
                      <IconButton onClick={() => onOpenHistory(p)}>
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    {p.status !== 'paid' && (
                      <Tooltip title="Thanh toán">
                        <IconButton color="primary" onClick={() => onOpenPayDialog(p)}>
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {p.paymentRequests && p.paymentRequests.some(req => req.status === 'pending') && (
                      <Tooltip title="Xử lý yêu cầu thanh toán">
                        <IconButton
                          color="warning"
                          onClick={() => {
                            const pendingRequest = p.paymentRequests!.find(req => req.status === 'pending');
                            if (pendingRequest) onOpenRequestDialog(pendingRequest, p);
                          }}
                        >
                          <Badge badgeContent={p.paymentRequests.filter(req => req.status === 'pending').length} color="error">
                            <ApproveIcon />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} />
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

      {/* Payment Request Dialog */}
      <Dialog open={openRequestDialog} onClose={onCloseRequestDialog} maxWidth="md" fullWidth>
        <DialogTitle>Xử lý yêu cầu thanh toán</DialogTitle>
        <DialogContent>
          {selectedRequest && selectedPaymentForRequest && (
            <Box>
              {/* Student & Payment Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom>Thông tin học phí</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Học sinh:</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPaymentForRequest.student?.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Lớp học:</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPaymentForRequest.class?.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tháng/Năm:</Typography>
                    <Typography variant="body1">{selectedPaymentForRequest.month}/{selectedPaymentForRequest.year}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Số tiền cần đóng:</Typography>
                    <Typography variant="body1" color="primary" fontWeight={600}>
                      {((selectedPaymentForRequest.totalAmount || 0) - (selectedPaymentForRequest.discountAmount || 0) - (selectedPaymentForRequest.paidAmount || 0)).toLocaleString()} ₫
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Payment Request Details */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
                <Typography variant="h6" gutterBottom>Thông tin yêu cầu thanh toán</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Số tiền yêu cầu:</Typography>
                    <Typography variant="body1" fontWeight={600} color="warning.dark">
                      {selectedRequest.amount.toLocaleString()} ₫
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Thời gian gửi:</Typography>
                    <Typography variant="body1">
                      {new Date(selectedRequest.requestedAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                    <Chip
                      label={selectedRequest.status === 'pending' ? 'Đang chờ duyệt' : selectedRequest.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                      color={selectedRequest.status === 'pending' ? 'warning' : selectedRequest.status === 'approved' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Payment Proof Image */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Ảnh chứng từ:</Typography>
                  <Box
                    component="img"
                    src={selectedRequest.imageProof}
                    alt="Chứng từ thanh toán"
                    sx={{
                      width: '100%',
                      maxHeight: 400,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.9 }
                    }}
                    onClick={() => window.open(selectedRequest.imageProof, '_blank')}
                  />
                </Box>
              </Box>

              {/* Rejection Reason Input (for reject action) */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Lý do từ chối (nếu từ chối)"
                  multiline
                  rows={3}
                  fullWidth
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu thanh toán..."
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseRequestDialog} variant="outlined" disabled={requestProcessing}>
            Đóng
          </Button>
          <Button
            onClick={handleRejectRequest}
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            disabled={requestProcessing || !rejectionReason.trim()}
          >
            {requestProcessing ? <CircularProgress size={20} /> : 'Từ chối'}
          </Button>
          <Button
            onClick={handleApproveRequest}
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            disabled={requestProcessing}
          >
            {requestProcessing ? <CircularProgress size={20} /> : 'Phê duyệt'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentPaymentsTab;
