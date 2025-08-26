import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Alert, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, Tabs, Tab, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Search as SearchIcon, Receipt as ReceiptIcon, MoneyOff as MoneyOffIcon, Discount as DiscountIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentByIdAPI, getPaymentsByStudentAPI, payTuitionAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface PaymentTransaction {
  id: string;
  childName: string;
  className: string;
  month: string | number;
  year?: number;
  attendedLessons: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate?: string;
  paymentDate?: string;
  paymentMethod?: string;
  description?: string;
  paymentHistory?: any[];
}

interface PaymentData {
  invoices: PaymentTransaction[];
}

interface PaymentConfirmData {
  invoice: PaymentTransaction;
  paymentData: {
    paymentId: string;
    amount: number;
    method: string;
    note: string;
  };
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentData>({ invoices: [] });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  // History modal
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<PaymentTransaction | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // Confirm dialog
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState<boolean>(false);
  const [paymentConfirmData, setPaymentConfirmData] = useState<PaymentConfirmData | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentData();
    }
  }, [user]);

  const fetchPaymentData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // 1) Lấy danh sách con của phụ huynh
      const parentId = (user as any)?.parentId || localStorage.getItem('parent_id') || user?.id || '';
      const parentRes = await getParentByIdAPI(String(parentId));
      const parentPayload: any = (parentRes as any)?.data?.data ?? (parentRes as any)?.data ?? {};
      const students: Array<{ id: string; name: string }> = Array.isArray(parentPayload?.students) ? parentPayload.students : [];

      // 2) Gọi API thanh toán theo từng học sinh song song
      const paymentsArrays = await Promise.all(students.map(async (stu) => {
        try {
          const resp = await getPaymentsByStudentAPI(String(stu.id), { page: 1, limit: 2 });
          const data: any = (resp as any)?.data?.data ?? (resp as any)?.data ?? {};
          const list: any[] = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
          return list.map((item: any) => ({ item, student: stu }));
        } catch (e) {
          return [] as Array<{ item: any; student: { id: string; name: string } }>;
        }
      }));

      const flat = paymentsArrays.flat();

      // 3) Map dữ liệu về dạng invoice chi tiết cho UI cũ
      const invoices: PaymentTransaction[] = flat.map(({ item, student }) => {
        const monthNum = Number(item?.month) || 0;
        const year = Number(item?.year) || new Date().getFullYear();
        const attendedLessons = Number(item?.totalLessons) || 0;
        const originalAmount = Number(item?.totalAmount) || 0;
        const discountAmount = Number(item?.discountAmount) || 0;
        const paidAmount = Number(item?.paidAmount) || 0;
        const finalAmount = Math.max(0, originalAmount - discountAmount);
        const remainingAmount = Math.max(0, finalAmount - paidAmount);
        return {
          id: String(item?.id || `${student.id}-${year}-${monthNum}-${item?.class?.id || 'unknown'}`),
          childName: student?.name || item?.student?.name || '-',
          className: item?.class?.name || '-',
          month: `${monthNum}/${year}`,
          year,
          attendedLessons,
          originalAmount,
          discountAmount,
          finalAmount,
          paidAmount,
          remainingAmount,
          status: String(item?.status || 'pending'),
          paymentHistory: Array.isArray(item?.histories) ? item.histories : [],
        };
      });

      setPaymentData({ invoices });
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'đã thanh toán':
        return 'success';
      case 'pending':
      case 'chờ thanh toán':
        return 'warning';
      case 'overdue':
      case 'quá hạn':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'đã thanh toán':
        return 'Đã thanh toán';
      case 'pending':
      case 'chờ thanh toán':
        return 'Chờ thanh toán';
      case 'overdue':
      case 'quá hạn':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const allInvoices = paymentData.invoices;
  const summary = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalDiscount = 0;
    let unpaidInvoices = 0;
    let paidInvoices = 0;
    let partialInvoices = 0;
    allInvoices.forEach((inv) => {
      totalPaid += inv.paidAmount || 0;
      totalUnpaid += inv.remainingAmount || 0;
      totalDiscount += inv.discountAmount || 0;
      const st = String(inv.status || '').toLowerCase();
      if (st === 'paid') paidInvoices++;
      else if (st === 'partial') partialInvoices++;
      else unpaidInvoices++;
    });
    return {
      totalPaid,
      totalUnpaid,
      totalDiscount,
      unpaidInvoices,
      paidInvoices,
      partialInvoices,
      totalInvoices: allInvoices.length
    };
  }, [allInvoices]);

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((invoice) => {
      const matchesSearch = searchQuery === '' ||
        invoice.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.className.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTab === 0) return matchesSearch;
      if (selectedTab === 1) return matchesSearch && invoice.status.toLowerCase() !== 'paid' && invoice.status.toLowerCase() !== 'partial';
      if (selectedTab === 2) return matchesSearch && invoice.status.toLowerCase() === 'partial';
      if (selectedTab === 3) return matchesSearch && invoice.status.toLowerCase() === 'paid';
      return matchesSearch;
    });
  }, [allInvoices, searchQuery, selectedTab]);

  const handleTabChange = (_e: any, newVal: number) => setSelectedTab(newVal);

  const handlePayment = (invoice: PaymentTransaction) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(String(invoice.remainingAmount || 0));
    setPaymentNote('');
    setPaymentMethod('cash');
    setPaymentError('');
    setPaymentSuccess('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentNote('');
    setPaymentMethod('cash');
    setPaymentError('');
    setPaymentSuccess('');
  };

  const handleOpenPaymentHistory = (payment: PaymentTransaction) => {
    setSelectedPaymentForHistory(payment);
    setPaymentHistoryModalOpen(true);
  };

  const handleClosePaymentHistory = () => {
    setSelectedPaymentForHistory(null);
    setPaymentHistoryModalOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice || !paymentAmount) {
      setPaymentError('Vui lòng nhập số tiền thanh toán');
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Số tiền thanh toán không hợp lệ');
      return;
    }
    const maxAmount = selectedInvoice.remainingAmount;
    if (amount > maxAmount) {
      setPaymentError('Số tiền thanh toán không được vượt quá số tiền còn lại');
      return;
    }
    const confirmData = {
      paymentId: selectedInvoice.id,
      amount,
      method: paymentMethod,
      note: paymentNote || `Thanh toán học phí tháng ${selectedInvoice.month}`
    };
    setPaymentConfirmData({ invoice: selectedInvoice, paymentData: confirmData });
    setPaymentConfirmOpen(true);
  };

  const handleConfirmPaymentFinal = async () => {
    if (!paymentConfirmData) return;
    setPaymentLoading(true);
    setPaymentConfirmOpen(false);
    setPaymentError('');
    setPaymentSuccess('');
    try {
      await payTuitionAPI(paymentConfirmData.paymentData);
      setPaymentSuccess('Thanh toán thành công!');
      setSnackbar({ open: true, message: 'Thanh toán thành công!', severity: 'success' });
      handleClosePaymentDialog();
      await fetchPaymentData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi thanh toán';
      setPaymentError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setPaymentLoading(false);
      setPaymentConfirmData(null);
    }
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
      <Box sx={{ ...commonStyles.pageContainer, paddingLeft: '2%', paddingRight: '2%' }}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý học phí
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xem và quản lý hóa đơn học phí của con bạn
          </Typography>

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ReceiptIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{summary.totalInvoices}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tổng hóa đơn
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
                    <PaymentIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{formatCurrency(summary.totalPaid)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Đã thanh toán
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
                    <MoneyOffIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{formatCurrency(summary.totalUnpaid)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Chưa thanh toán
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
                    <DiscountIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{formatCurrency(summary.totalDiscount)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tổng giảm giá
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={`Tất cả (${allInvoices.length})`} />
            <Tab label={`Chưa thanh toán (${summary.unpaidInvoices})`} />
            <Tab label={`Thanh toán một phần (${summary.partialInvoices})`} />
            <Tab label={`Đã thanh toán (${summary.paidInvoices})`} />
          </Tabs>

          {/* Search */}
          <Paper sx={commonStyles.searchContainer}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên con hoặc tên lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={commonStyles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Payment Transactions Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách hóa đơn
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tên con</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tháng</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số buổi học</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tiền gốc</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Giảm giá</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tiền cuối</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đã thanh toán</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Còn lại</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} sx={commonStyles.tableRow}>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invoice.childName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{invoice.className}</Typography>
                        </TableCell>
                        <TableCell align="center">{invoice.month}</TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{`${invoice.attendedLessons} buổi`}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.originalAmount)}</Typography></TableCell>
                        <TableCell align="center">
                          {invoice.discountAmount > 0 ? (
                            <Chip
                              label={`-${formatCurrency(invoice.discountAmount)}`}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.finalAmount)}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.paidAmount)}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.remainingAmount)}</Typography></TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(invoice.status)}
                            color={getStatusColor(invoice.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="left">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'left' }}>
                            {invoice.status.toLowerCase() !== 'paid' ? (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handlePayment(invoice)}
                              >
                                Thanh toán
                              </Button>
                            ) : null}
                            {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenPaymentHistory(invoice)}
                                title="Xem lịch sử thanh toán"
                              >
                                <HistoryIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredInvoices.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="textSecondary">
                    Không tìm thấy giao dịch thanh toán
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          <Typography variant="h5" fontWeight={600} color="#1e293b">
            Thanh toán học phí
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedInvoice?.childName} - {selectedInvoice?.className}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Thông tin hóa đơn:
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1, mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(selectedInvoice?.originalAmount || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Giảm giá:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(selectedInvoice?.discountAmount || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Đã thanh toán:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      {formatCurrency(selectedInvoice?.paidAmount || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Còn thiếu:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} color="error.main">
                      {formatCurrency(selectedInvoice?.remainingAmount || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số tiền thanh toán"
                type="number"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Phương thức thanh toán"
                >
                  <MenuItem value="cash">Tiền mặt</MenuItem>
                  <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                  <MenuItem value="card">Thẻ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi chú"
                fullWidth
                multiline
                minRows={2}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ghi chú về khoản thanh toán (tùy chọn)"
              />
            </Grid>
            {paymentError && (
              <Grid item xs={12}>
                <Alert severity="error">{paymentError}</Alert>
              </Grid>
            )}
            {paymentSuccess && (
              <Grid item xs={12}>
                <Alert severity="success">{paymentSuccess}</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button
            onClick={handleClosePaymentDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmPayment}
            variant="contained"
            disabled={!paymentAmount || paymentLoading}
            sx={{
              borderRadius: 2,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              px: 3
            }}
          >
            {paymentLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment History Modal */}
      {selectedPaymentForHistory && (
        <PaymentHistoryModal
          open={paymentHistoryModalOpen}
          onClose={handleClosePaymentHistory}
          paymentData={selectedPaymentForHistory as any}
          title="Lịch sử thanh toán học phí"
          showPaymentDetails={true}
        />
      )}

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      {/* Confirm Dialog for Payment */}
      <ConfirmDialog
        open={paymentConfirmOpen}
        onClose={() => setPaymentConfirmOpen(false)}
        onConfirm={handleConfirmPaymentFinal}
        title="Xác nhận thanh toán"
        message={`Bạn có chắc chắn muốn thanh toán ${formatCurrency(paymentConfirmData?.paymentData.amount || 0)} cho hóa đơn học phí tháng ${paymentConfirmData?.invoice.month} của ${paymentConfirmData?.invoice.childName}?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={paymentLoading}
      />
    </DashboardLayout>
  );
};

export default Payments;
