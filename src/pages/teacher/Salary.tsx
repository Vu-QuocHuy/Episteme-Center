import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Alert, Button,
} from '@mui/material';
import {
  Payment as PaymentIcon, TrendingUp as TrendingUpIcon, AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon, AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getTeacherPaymentsAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';

interface PaymentInfo {
  id: string;
  teacherId: string;
  month: number;
  year: number;
  totalLessons: number;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  class?: {
    id: string;
    name: string;
  };
  histories?: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    note?: string;
  }>;
}

interface SalarySummary {
  totalEarned: number;
  totalPaid: number;
  pendingAmount: number;
  averageMonthlySalary: number;
  totalClasses: number;
  totalSessions: number;
}

interface SalaryData {
  payments: PaymentInfo[];
  summary: SalarySummary;
}

const Salary: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [salaryData, setSalaryData] = useState<SalaryData>({
    payments: [],
    summary: {
      totalEarned: 0,
      totalPaid: 0,
      pendingAmount: 0,
      averageMonthlySalary: 0,
      totalClasses: 0,
      totalSessions: 0
    }
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentInfo | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchSalaryData();
    }
  }, [user]);

  const fetchSalaryData = async (): Promise<void> => {
    if (!user?.id) {
      setError('Không tìm thấy thông tin giáo viên');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Gọi API với teacherId filter
      const paymentsResponse = await getTeacherPaymentsAPI({
        teacherId: user.id,
        page: 1,
        limit: 50 // Lấy nhiều records để có đủ dữ liệu
      });

      console.log('📊 Teacher Payments Response:', paymentsResponse);

      if (paymentsResponse.data?.data) {
        const payments = paymentsResponse.data.data.result || [];

        // Tính toán summary từ payments
        const summary = calculateSalarySummary(payments);

        setSalaryData({
          payments: payments,
          summary: summary
        });
      } else {
        setSalaryData({
          payments: [],
          summary: {
            totalEarned: 0,
            totalPaid: 0,
            pendingAmount: 0,
            averageMonthlySalary: 0,
            totalClasses: 0,
            totalSessions: 0
          }
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching salary data:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin lương');
    } finally {
      setLoading(false);
    }
  };

  const calculateSalarySummary = (payments: PaymentInfo[]): SalarySummary => {
    const totalEarned = payments.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
    const pendingAmount = totalEarned - totalPaid;

    // Tính average monthly salary (trung bình 6 tháng gần nhất)
    const recentPayments = payments
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 6);
    const averageMonthlySalary = recentPayments.length > 0
      ? recentPayments.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0) / recentPayments.length
      : 0;

    // Tính total classes và sessions từ payments
    const totalClasses = payments.filter(payment => payment.class).length;
    const totalSessions = payments.reduce((sum, payment) => sum + (payment.totalLessons || 0), 0);

    return {
      totalEarned,
      totalPaid,
      pendingAmount,
      averageMonthlySalary,
      totalClasses,
      totalSessions
    };
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  const handleViewPaymentDetails = (payment: PaymentInfo): void => {
    setSelectedPayment(payment);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = (): void => {
    setPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.container}>
        <Typography variant="h4" gutterBottom>
          Thông tin lương
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MoneyIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(salaryData.summary.totalEarned)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng thu nhập
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
                    <Typography variant="h4">{formatCurrency(salaryData.summary.totalPaid)}</Typography>
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
                  <TrendingUpIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(salaryData.summary.pendingAmount)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chờ thanh toán
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
                  <AccountBalanceIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(salaryData.summary.averageMonthlySalary)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lương TB/tháng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Payment History Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lịch sử thanh toán
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tháng/Năm</TableCell>
                    <TableCell>Học sinh</TableCell>
                    <TableCell>Lớp</TableCell>
                    <TableCell align="right">Số buổi</TableCell>
                    <TableCell align="right">Tổng lương</TableCell>
                    <TableCell align="right">Đã thanh toán</TableCell>
                    <TableCell align="right">Còn lại</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày thanh toán</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryData.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                          {payment.month}/{payment.year}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.student?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {payment.student?.email || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.class?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {payment.totalLessons}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(payment.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(payment.paidAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="warning.main">
                          {formatCurrency(payment.totalAmount - payment.paidAmount)}
                        </Typography>
                        {payment.discountAmount > 0 && (
                          <Typography variant="caption" color="error.main">
                            Giảm: {formatCurrency(payment.discountAmount)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(payment.status)}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.histories && payment.histories.length > 0
                          ? formatDate(payment.histories[0].paymentDate)
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleViewPaymentDetails(payment)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {salaryData.payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    Chưa có lịch sử thanh toán
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </CardContent>
        </Card>

        {/* Payment History Modal */}
        {selectedPayment && (
          <PaymentHistoryModal
            open={paymentModalOpen}
            onClose={handleClosePaymentModal}
            paymentData={{
              teacherInfo: {
                id: user?.id || '',
                name: user?.name || '',
                email: user?.email || ''
              },
              paymentDetails: {
                month: selectedPayment.month,
                year: selectedPayment.year,
                totalAmount: selectedPayment.totalAmount,
                paidAmount: selectedPayment.paidAmount,
                status: selectedPayment.status,
                paymentDate: selectedPayment.histories && selectedPayment.histories.length > 0
                  ? selectedPayment.histories[0].paymentDate
                  : undefined,
                paymentMethod: selectedPayment.histories && selectedPayment.histories.length > 0
                  ? selectedPayment.histories[0].paymentMethod
                  : undefined,
                description: selectedPayment.histories && selectedPayment.histories.length > 0
                  ? selectedPayment.histories[0].note
                  : undefined
              },
              transactions: selectedPayment.histories?.map(history => ({
                id: history.id,
                className: selectedPayment.class?.name || 'N/A',
                sessions: selectedPayment.totalLessons,
                amount: history.amount,
                date: history.paymentDate
              })) || []
            }}
          />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Salary;
