import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Alert, Button,
  Avatar, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Payment as PaymentIcon, TrendingUp as TrendingUpIcon, AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getPaymentsAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';

interface PaymentTransaction {
  id: string;
  childName: string;
  className: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  description?: string;
}

interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalTransactions: number;
  paidTransactions: number;
  pendingTransactions: number;
  overdueTransactions: number;
}

interface PaymentData {
  transactions: PaymentTransaction[];
  summary: PaymentSummary;
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    transactions: [],
    summary: {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      totalTransactions: 0,
      paidTransactions: 0,
      pendingTransactions: 0,
      overdueTransactions: 0
    }
  });
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChild, setFilterChild] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchPaymentData();
    }
  }, [user]);

  const fetchPaymentData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getPaymentsAPI();
      if (response.data) {
        setPaymentData(response.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
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

  const handleViewPaymentDetails = (transaction: PaymentTransaction): void => {
    setSelectedTransaction(transaction);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = (): void => {
    setPaymentModalOpen(false);
    setSelectedTransaction(null);
  };

  const filteredTransactions = paymentData.transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesChild = filterChild === 'all' || transaction.childName === filterChild;
    const matchesSearch = searchQuery === '' ||
      transaction.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.className.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesChild && matchesSearch;
  });

  const uniqueChildren = Array.from(new Set(paymentData.transactions.map(t => t.childName)));

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
      <Box sx={commonStyles.container}>
        <Typography variant="h4" gutterBottom>
          Quản lý thanh toán
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MoneyIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(paymentData.summary.totalAmount)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng tiền
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
                    <Typography variant="h4">{formatCurrency(paymentData.summary.paidAmount)}</Typography>
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
                    <Typography variant="h4">{formatCurrency(paymentData.summary.pendingAmount)}</Typography>
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
                  <AccountBalanceIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(paymentData.summary.overdueAmount)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Quá hạn
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên con hoặc lớp học..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Trạng thái"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="paid">Đã thanh toán</MenuItem>
                    <MenuItem value="pending">Chờ thanh toán</MenuItem>
                    <MenuItem value="overdue">Quá hạn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Con</InputLabel>
                  <Select
                    value={filterChild}
                    label="Con"
                    onChange={(e) => setFilterChild(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {uniqueChildren.map(child => (
                      <MenuItem key={child} value={child}>{child}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Transactions Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lịch sử thanh toán
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Con</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell>Tháng/Năm</TableCell>
                    <TableCell align="right">Số tiền</TableCell>
                    <TableCell>Hạn thanh toán</TableCell>
                    <TableCell>Ngày thanh toán</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <PaymentIcon />
                          </Avatar>
                          {transaction.childName}
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.className}</TableCell>
                      <TableCell>
                        {transaction.month}/{transaction.year}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.dueDate)}
                      </TableCell>
                      <TableCell>
                        {transaction.paymentDate ? formatDate(transaction.paymentDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(transaction.status)}
                          color={getStatusColor(transaction.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleViewPaymentDetails(transaction)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredTransactions.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                  Không tìm thấy giao dịch thanh toán
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Modal */}
        {selectedTransaction && (
          <PaymentHistoryModal
            open={paymentModalOpen}
            onClose={handleClosePaymentModal}
            paymentData={{
              teacherInfo: {
                id: '',
                name: 'Phụ huynh',
                email: user?.email || ''
              },
              paymentDetails: {
                month: selectedTransaction.month,
                year: selectedTransaction.year,
                totalAmount: selectedTransaction.amount,
                paidAmount: selectedTransaction.status.toLowerCase() === 'paid' ? selectedTransaction.amount : 0,
                status: selectedTransaction.status,
                paymentDate: selectedTransaction.paymentDate,
                paymentMethod: selectedTransaction.paymentMethod,
                description: selectedTransaction.description
              },
              transactions: [{
                id: selectedTransaction.id,
                className: selectedTransaction.className,
                sessions: 1,
                amount: selectedTransaction.amount,
                date: selectedTransaction.paymentDate || selectedTransaction.dueDate
              }]
            }}
          />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Payments;
