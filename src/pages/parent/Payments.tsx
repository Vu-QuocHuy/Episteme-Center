import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Alert, Button,
  TextField,
  Paper, Tabs, Tab, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Search as SearchIcon, Receipt as ReceiptIcon, MoneyOff as MoneyOffIcon, Discount as DiscountIcon,
  History as HistoryIcon, CloudUpload as UploadIcon, Image as ImageIcon, Close as CloseIcon,
  HourglassEmpty as PendingIcon, CheckCircle as ApprovedIcon, Cancel as RejectedIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentByIdAPI } from '../../services/parents';
import { getPaymentsByStudentAPI, requestPaymentAPI } from '../../services/payments';
import { uploadFileAPI } from '../../services/files';
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
  paymentRequests?: Array<{
    id: number;
    amount: number;
    imageProof: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    processedAt?: string;
    rejectionReason?: string;
  }>;
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

  // Upload image states
  const [, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [imageUploading, setImageUploading] = useState<boolean>(false);

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
    setPaymentSuccess('');
    setSelectedImage(null);
    setPreviewImage('');
    setUploadedImageUrl('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentError('');
    setPaymentSuccess('');
    setSelectedImage(null);
    setPreviewImage('');
    setUploadedImageUrl('');
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPaymentError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPaymentError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setSelectedImage(file);

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to cloudinary
    try {
      setImageUploading(true);
      setPaymentError('');
      const uploadRes = await uploadFileAPI(file);
      setUploadedImageUrl(uploadRes.data.data.url);
      setSnackbar({ open: true, message: 'Tải ảnh thành công', severity: 'success' });
    } catch (error: any) {
      setPaymentError('Tải ảnh thất bại. Vui lòng thử lại.');
      setSelectedImage(null);
      setPreviewImage('');
      setUploadedImageUrl('');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage('');
    setUploadedImageUrl('');
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
    if (!uploadedImageUrl) {
      setPaymentError('Vui lòng tải lên ảnh bằng chứng thanh toán');
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
      imageProof: uploadedImageUrl
    };
    setPaymentConfirmData({ invoice: selectedInvoice, paymentData: confirmData as any });
    setPaymentConfirmOpen(true);
  };

  const handleConfirmPaymentFinal = async () => {
    if (!paymentConfirmData) return;
    setPaymentLoading(true);
    setPaymentConfirmOpen(false);
    setPaymentError('');
    setPaymentSuccess('');
    try {
      await requestPaymentAPI(paymentConfirmData.paymentData.paymentId, {
        amount: paymentConfirmData.paymentData.amount,
        imageProof: (paymentConfirmData.paymentData as any).imageProof
      });
      setPaymentSuccess('Gửi yêu cầu thanh toán thành công!');
      setSnackbar({ open: true, message: 'Yêu cầu thanh toán đã được gửi. Vui lòng chờ admin xác nhận.', severity: 'success' });
      handleClosePaymentDialog();
      await fetchPaymentData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu thanh toán';
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                            <Chip
                              label={getStatusLabel(invoice.status)}
                              color={getStatusColor(invoice.status)}
                              size="small"
                              variant="outlined"
                            />
                            {invoice.paymentRequests && invoice.paymentRequests.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                                {invoice.paymentRequests.map((req) => (
                                  <Tooltip
                                    key={req.id}
                                    title={
                                      req.status === 'pending'
                                        ? 'Yêu cầu thanh toán đang chờ admin duyệt'
                                        : req.status === 'approved'
                                        ? `Đã duyệt lúc ${new Date(req.processedAt || '').toLocaleString('vi-VN')}`
                                        : `Bị từ chối: ${req.rejectionReason || 'Không có lý do'}`
                                    }
                                  >
                                    <Chip
                                      icon={
                                        req.status === 'pending' ? <PendingIcon /> :
                                        req.status === 'approved' ? <ApprovedIcon /> :
                                        <RejectedIcon />
                                      }
                                      label={`${formatCurrency(req.amount)} - ${
                                        req.status === 'pending' ? 'Chờ duyệt' :
                                        req.status === 'approved' ? 'Đã duyệt' :
                                        'Bị từ chối'
                                      }`}
                                      size="small"
                                      color={
                                        req.status === 'pending' ? 'warning' :
                                        req.status === 'approved' ? 'success' :
                                        'error'
                                      }
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  </Tooltip>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="left">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'left' }}>
                            {invoice.status.toLowerCase() !== 'paid' &&
                             !invoice.paymentRequests?.some(req => req.status === 'pending') && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handlePayment(invoice)}
                              >
                                Thanh toán
                              </Button>
                            )}
                            {((invoice.paymentHistory && invoice.paymentHistory.length > 0) ||
                              (invoice.paymentRequests && invoice.paymentRequests.length > 0)) && (
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
            Gửi yêu cầu thanh toán
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

            <Grid item xs={12}>
              <TextField
                label="Số tiền thanh toán *"
                type="number"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                inputProps={{ min: 0, max: selectedInvoice?.remainingAmount }}
                required
                helperText="Nhập số tiền bạn đã thanh toán"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ảnh bằng chứng thanh toán *
              </Typography>
              <Box sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: '#f8fafc',
                position: 'relative'
              }}>
                {!previewImage ? (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="payment-proof-upload"
                      type="file"
                      onChange={handleImageSelect}
                      disabled={imageUploading}
                    />
                    <label htmlFor="payment-proof-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        startIcon={imageUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                        disabled={imageUploading}
                        sx={{ mb: 1 }}
                      >
                        {imageUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Ảnh chụp biên lai, hóa đơn chuyển khoản (PNG, JPG, tối đa 5MB)
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={previewImage}
                      alt="Payment proof"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        borderRadius: 1,
                        boxShadow: 2
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                      onClick={handleRemoveImage}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    {uploadedImageUrl && (
                      <Chip
                        icon={<ImageIcon />}
                        label="Đã tải lên"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                )}
              </Box>
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

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                Yêu cầu thanh toán sẽ được gửi đến admin để xác nhận. Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
              </Alert>
            </Grid>
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
            disabled={!paymentAmount || !uploadedImageUrl || paymentLoading || imageUploading}
            sx={{
              borderRadius: 2,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              px: 3
            }}
          >
            {paymentLoading ? 'Đang gửi...' : 'Gửi yêu cầu thanh toán'}
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
        message={`Bạn có chắc chắn muốn gửi yêu cầu thanh toán ${formatCurrency(paymentConfirmData?.paymentData.amount || 0)} cho hóa đơn học phí tháng ${paymentConfirmData?.invoice.month} của ${paymentConfirmData?.invoice.childName}?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={paymentLoading}
      />
    </DashboardLayout>
  );
};

export default Payments;
