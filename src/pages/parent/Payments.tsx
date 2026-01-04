import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Alert, Button,
  TextField,
  Paper, Tabs, Tab, InputAdornment, IconButton,
  CircularProgress, Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Search as SearchIcon, Receipt as ReceiptIcon, MoneyOff as MoneyOffIcon, Discount as DiscountIcon,
  History as HistoryIcon,
  QrCode2 as QrCodeIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  Paid as PaidIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentByIdAPI } from '../../services/parents';
import { getPaymentsByStudentAPI, getQRCodeAPI } from '../../services/payments';
import { commonStyles } from '../../utils/styles';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import BaseDialog from '../../components/common/BaseDialog';

interface PaymentTransaction {
  id: string;
  paymentId?: string; // Payment ID thực tế từ API
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
  const [paymentError, setPaymentError] = useState<string>('');

  // QR Code states
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);
  const [qrDialogOpen, setQrDialogOpen] = useState<boolean>(false);

  // History modal
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<PaymentTransaction | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

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

        // Lưu paymentId thực tế từ API (item.id)
        const paymentId = String(item?.id || '');

        return {
          id: paymentId || `${student.id}-${year}-${monthNum}-${item?.class?.id || 'unknown'}`,
          paymentId: paymentId, // Lưu paymentId riêng để dùng cho API
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
          paymentRequests: Array.isArray(item?.paymentRequests) ? item.paymentRequests : [],
          // Thêm các field gốc để modal có thể truy cập - ưu tiên lấy từ item (API response)
          student: item?.student || { id: student.id, name: student.name },
          class: item?.class,
          totalLessons: item?.totalLessons,
          totalAmount: item?.totalAmount,
        } as any;
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
    setPaymentError('');
    setQrCodeUrl('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentError('');
    setQrCodeUrl('');
  };

  const handleGenerateQRCode = async (paymentId: string, amount: number) => {
    if (!paymentId || !amount || amount <= 0) {
      setPaymentError('Số tiền thanh toán không hợp lệ');
      return;
    }

    try {
      setQrCodeLoading(true);
      setPaymentError('');

      const response = await getQRCodeAPI(amount, paymentId);

      // Response structure: { statusCode: 200, data: { qrUrl: "...", ... } }
      const qrUrl = response.data?.data?.qrUrl;
      if (qrUrl) {
        setQrCodeUrl(qrUrl);
        setQrDialogOpen(true); // Mở QR dialog
        setSnackbar({ open: true, message: 'Đã tạo mã QR. Vui lòng quét để thanh toán.', severity: 'success' });
      } else {
        setPaymentError('Không thể tạo mã QR');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo mã QR';
      setPaymentError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleCloseQRDialog = () => {
    setQrDialogOpen(false);
    // Đóng cả dialog nhập số tiền
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentError('');
    setQrCodeUrl('');
    // Tự động refresh danh sách thanh toán khi đóng dialog
    fetchPaymentData();
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

  const handleRegenerateQRCode = () => {
    if (!selectedInvoice) return;
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

    // Sử dụng paymentId thực tế từ API, fallback về id nếu không có
    const paymentId = selectedInvoice.paymentId || selectedInvoice.id;
    if (!paymentId) {
      setPaymentError('Không tìm thấy mã thanh toán');
      return;
    }

    handleGenerateQRCode(paymentId, amount);
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
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              {formatCurrency(0)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.finalAmount)}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.paidAmount)}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.remainingAmount)}</Typography></TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                            <Chip
                              label={getStatusLabel(invoice.status)}
                              color={getStatusColor(invoice.status)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="left">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'left' }}>
                            {invoice.status.toLowerCase() !== 'paid' && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handlePayment(invoice)}
                              >
                                Thanh toán
                              </Button>
                            )}
                            {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                              <Tooltip title="Xem lịch sử thanh toán">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenPaymentHistory(invoice)}
                              >
                                <HistoryIcon />
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
      <BaseDialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        title="Thanh toán học phí"
        subtitle={`${selectedInvoice?.childName} - ${selectedInvoice?.className} - Tháng ${selectedInvoice?.month}`}
        icon={<QrCodeIcon sx={{ fontSize: 28, color: 'white' }} />}
        maxWidth="sm"
        contentPadding={0}
        hideDefaultAction={true}
        actions={
          <>
            <Button
              onClick={handleClosePaymentDialog}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  bgcolor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleRegenerateQRCode}
              variant="contained"
              disabled={qrCodeLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
              startIcon={qrCodeLoading ? <CircularProgress size={20} color="inherit" /> : <QrCodeIcon />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#667eea',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  bgcolor: '#5a6fd8',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  bgcolor: '#ccc'
                }
              }}
            >
              {qrCodeLoading ? 'Đang xử lý...' : 'Tạo mã QR thanh toán'}
            </Button>
          </>
        }
      >
        <Box sx={{ p: 4, pt: 4, bgcolor: '#f9fafb', mt: 2 }}>
          {/* Summary Cards */}
          {selectedInvoice && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                      <AttachMoneyIcon fontSize="small" /> Tổng số tiền
                    </Box>
                    <Box sx={{ fontWeight: 700, fontSize: 18 }}>
                      {formatCurrency((selectedInvoice.originalAmount || 0) - (selectedInvoice.discountAmount || 0))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                      <PaidIcon fontSize="small" /> Đã thanh toán
                    </Box>
                    <Box sx={{ fontWeight: 700, fontSize: 18, color: 'success.main' }}>
                      {formatCurrency(selectedInvoice.paidAmount || 0)}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                      <WalletIcon fontSize="small" /> Còn lại
                    </Box>
                    <Box sx={{ fontWeight: 700, fontSize: 18, color: 'error.main' }}>
                      {formatCurrency(selectedInvoice.remainingAmount || 0)}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Số tiền thanh toán"
                  type="number"
                  fullWidth
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  inputProps={{ min: 0, max: selectedInvoice?.remainingAmount }}
                  required
                  placeholder="Nhập số tiền bạn muốn thanh toán"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>
                  }}
                  helperText={selectedInvoice ? `Tối đa: ${formatCurrency(selectedInvoice.remainingAmount || 0)}` : undefined}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      }
                    }
                  }}
                />
              </Grid>

              {paymentError && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>{paymentError}</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </BaseDialog>

      {/* QR Code Dialog */}
      <BaseDialog
        open={qrDialogOpen}
        onClose={handleCloseQRDialog}
        title="Quét mã QR để thanh toán"
        subtitle="Mở app ngân hàng và quét mã dưới đây"
        icon={<QrCodeIcon sx={{ fontSize: 48, color: 'white' }} />}
        maxWidth="sm"
        contentPadding={4}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
      >
          {qrCodeUrl ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              {/* QR Code với animation */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  animation: 'fadeIn 0.5s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'scale(0.9)' },
                    to: { opacity: 1, transform: 'scale(1)' }
                  }
                }}
              >
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code Payment"
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </Box>
            </Box>
          ) : (
            <CircularProgress size={60} />
          )}
      </BaseDialog>

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
    </DashboardLayout>
  );
};

export default Payments;
