import React from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Pagination, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Card, CardContent } from '@mui/material';
import FormDialog from '../../../../components/common/forms/FormDialog';
import { getAllTransactionsAPI, createTransactionAPI, updateTransactionAPI, deleteTransactionAPI, getAllTransactionCategoriesAPI, createTransactionCategoryAPI, getTransactionCategoryByIdAPI, updateTransactionCategoryAPI, deleteTransactionCategoryAPI, exportTransactionsReportAPI } from '../../../../services/api';
import { Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: { id: number; name: string; type: 'revenue' | 'expense' };
  transaction_at?: string;
  transactionAt?: string;
}

interface Props {}

const OtherTransactionsTab: React.FC<Props> = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'revenue' | 'expense'>('all');

  const [openTransactionDialog, setOpenTransactionDialog] = React.useState<boolean>(false);
  const [transactionForm, setTransactionForm] = React.useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [transactionLoading, setTransactionLoading] = React.useState<boolean>(false);
  const [openEditTransactionDialog, setOpenEditTransactionDialog] = React.useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = React.useState<Transaction | null>(null);
  const [editTransactionForm, setEditTransactionForm] = React.useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [editTransactionLoading, setEditTransactionLoading] = React.useState<boolean>(false);
  const [openDeleteTransactionDialog, setOpenDeleteTransactionDialog] = React.useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);
  const [deleteTransactionLoading, setDeleteTransactionLoading] = React.useState<boolean>(false);

  const [categories, setCategories] = React.useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState<boolean>(false);
  void categoriesLoading; // silence unused variable until used
  const [openCategoryManagementDialog, setOpenCategoryManagementDialog] = React.useState<boolean>(false);
  const [openCategoryDialog, setOpenCategoryDialog] = React.useState<boolean>(false);
  const [categoryForm, setCategoryForm] = React.useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = React.useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<any | null>(null);
  const [editCategoryForm, setEditCategoryForm] = React.useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [editCategoryLoading, setEditCategoryLoading] = React.useState<boolean>(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = React.useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<any | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = React.useState<boolean>(false);
  const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);

  const fetchOtherTransactions = React.useCallback(async (pageNum = 1) => {
    // Build date range based on selected period
    let startDate: string | undefined;
    let endDate: string | undefined;

    // Helper: format to MM/DD/YYYY
    const toMDY = (y: number, m: number, d: number) => {
      const mm = m < 10 ? `0${m}` : `${m}`;
      const dd = d < 10 ? `0${d}` : `${d}`;
      return `${mm}/${dd}/${y}`;
    };

    if (periodType === 'year') {
      startDate = toMDY(selectedYear, 1, 1);
      endDate = toMDY(selectedYear, 12, 31);
    } else if (periodType === 'month') {
      const year = selectedYear;
      const month = selectedMonth;
      const lastDay = new Date(year, month, 0).getDate();
      startDate = toMDY(year, month, 1);
      endDate = toMDY(year, month, lastDay);
    } else if (periodType === 'quarter') {
      const q = selectedQuarter;
      const year = selectedYear;
      const startMonth = q === 1 ? 1 : q === 2 ? 4 : q === 3 ? 7 : 10;
      const endMonth = q === 1 ? 3 : q === 2 ? 6 : q === 3 ? 9 : 12;
      const lastDay = new Date(year, endMonth, 0).getDate();
      startDate = toMDY(year, startMonth, 1);
      endDate = toMDY(year, endMonth, lastDay);
    } else if (periodType === 'custom') {
      // customStart/customEnd are YYYY-MM-DD → convert to MM/DD/YYYY
      if (customStart) {
        const [y, m, d] = customStart.split('-').map(Number);
        startDate = toMDY(y, m, d);
      }
      if (customEnd) {
        const [y, m, d] = customEnd.split('-').map(Number);
        endDate = toMDY(y, m, d);
      }
    }

    const params: any = { page: pageNum, limit: 10 };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (typeFilter !== 'all') params.type = typeFilter;

    const res = await getAllTransactionsAPI(params);
    const data = (res as any)?.data;
    if (data?.data?.result && Array.isArray(data.data.result)) {
      setTransactions(data.data.result);
      const meta = data.data.meta;
      setPagination({ page: meta?.page || pageNum, totalPages: meta?.totalPages || 1 });
    } else {
      setTransactions([]);
      setPagination({ page: 1, totalPages: 1 });
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, typeFilter]);

  const fetchCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await getAllTransactionCategoriesAPI({ page: 1, limit: 1000 });
      let data: any[] = [];
      if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) data = (res as any).data.data;
      else if ((res as any)?.data && Array.isArray((res as any).data)) data = (res as any).data;
      else if ((res as any)?.data?.data?.result && Array.isArray((res as any).data.data.result)) data = (res as any).data.data.result;
      else if ((res as any)?.data?.result && Array.isArray((res as any).data.result)) data = (res as any).data.result;
      setCategories(Array.isArray(data) ? data : []);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchOtherTransactions(1); /* fetchCategories(); */ }, [fetchOtherTransactions, fetchCategories]);
  React.useEffect(() => { fetchOtherTransactions(1); }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, typeFilter, fetchOtherTransactions]);
  const exportToExcel = async () => {
    // Reuse current date range logic to pass as query for export
    let startDate: string | undefined;
    let endDate: string | undefined;
    const toMDY = (y: number, m: number, d: number) => {
      const mm = m < 10 ? `0${m}` : `${m}`;
      const dd = d < 10 ? `0${d}` : `${d}`;
      return `${mm}/${dd}/${y}`;
    };
    if (periodType === 'year') {
      startDate = toMDY(selectedYear, 1, 1);
      endDate = toMDY(selectedYear, 12, 31);
    } else if (periodType === 'month') {
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      startDate = toMDY(selectedYear, selectedMonth, 1);
      endDate = toMDY(selectedYear, selectedMonth, lastDay);
    } else if (periodType === 'quarter') {
      const startMonth = selectedQuarter === 1 ? 1 : selectedQuarter === 2 ? 4 : selectedQuarter === 3 ? 7 : 10;
      const endMonth = selectedQuarter === 1 ? 3 : selectedQuarter === 2 ? 6 : selectedQuarter === 3 ? 9 : 12;
      const lastDay = new Date(selectedYear, endMonth, 0).getDate();
      startDate = toMDY(selectedYear, startMonth, 1);
      endDate = toMDY(selectedYear, endMonth, lastDay);
    } else if (periodType === 'custom') {
      if (customStart) {
        const [y, m, d] = customStart.split('-').map(Number);
        startDate = toMDY(y, m, d);
      }
      if (customEnd) {
        const [y, m, d] = customEnd.split('-').map(Number);
        endDate = toMDY(y, m, d);
      }
    }

    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (typeFilter !== 'all') params.type = typeFilter;

    const res = await exportTransactionsReportAPI(params);
    const payload = (res as any)?.data?.data || (res as any)?.data || {};
    const list = Array.isArray(payload.result) ? payload.result as Transaction[] : transactions;

    const rows = list.map((t) => ({
      'Danh mục': t.category?.name || '-',
      'Loại': t.category?.type === 'revenue' ? 'Thu' : 'Chi',
      'Mô tả': t.description || '-',
      'Ngày': (t.transactionAt || t.transaction_at) ? new Date(t.transactionAt || (t.transaction_at as string)).toLocaleDateString('vi-VN') : '-',
      'Số tiền (₫)': t.amount || 0,
    }));
    const totalAmount = rows.reduce((s, r) => s + Number((r as any)['Số tiền (₫)'] || 0), 0);
    rows.push({
      'Danh mục': 'Tổng',
      'Loại': '',
      'Mô tả': '',
      'Ngày': '',
      'Số tiền (₫)': totalAmount,
    } as any);
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(k.length, ...rows.map(r => String((r as any)[k] ?? '').length)) + 2 }));
    (ws as any)['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ThuChiKhac');
    const now = new Date();
    XLSX.writeFile(wb, `BaoCao_ThuChiKhac_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.xlsx`);
  };

  const onPageChange = (p: number) => fetchOtherTransactions(p);
  const handleOpenTransactionDialog = async () => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setOpenTransactionDialog(true);
  };
  const handleCloseTransactionDialog = () => setOpenTransactionDialog(false);
  const handleChangeTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => setTransactionForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category_id) return;
    setTransactionLoading(true);
    try {
      await createTransactionAPI({ amount: Number(transactionForm.amount), category_id: transactionForm.category_id, description: transactionForm.description });
      setOpenTransactionDialog(false);
      setTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setTransactionToEdit(transaction);
    setEditTransactionForm({
      amount: transaction.amount.toString(),
      category_id: transaction.category.id.toString(),
      description: transaction.description || ''
    });
    setOpenEditTransactionDialog(true);
  };
  const handleCloseEditTransactionDialog = () => setOpenEditTransactionDialog(false);
  const handleChangeEditTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => setEditTransactionForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitEditTransaction = async () => {
    if (!transactionToEdit || !editTransactionForm.amount || !editTransactionForm.category_id) return;
    setEditTransactionLoading(true);
    try {
      await updateTransactionAPI(transactionToEdit.id, { amount: Number(editTransactionForm.amount), category_id: editTransactionForm.category_id, description: editTransactionForm.description });
      setOpenEditTransactionDialog(false);
      setTransactionToEdit(null);
      setEditTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
    } finally {
      setEditTransactionLoading(false);
    }
  };
  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setOpenDeleteTransactionDialog(true);
  };
  const handleCloseDeleteTransactionDialog = () => setOpenDeleteTransactionDialog(false);
  const handleConfirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setDeleteTransactionLoading(true);
    try {
      await deleteTransactionAPI(transactionToDelete.id);
      setOpenDeleteTransactionDialog(false);
      setTransactionToDelete(null);
      await fetchOtherTransactions(1);
    } finally {
      setDeleteTransactionLoading(false);
    }
  };

  const handleOpenCategoryManagementDialog = async () => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setOpenCategoryManagementDialog(true);
  };
  const handleCloseCategoryManagementDialog = () => setOpenCategoryManagementDialog(false);
  const handleOpenCreateCategoryFromManagement = () => { setOpenCategoryManagementDialog(false); setOpenCategoryDialog(true); };
  const handleChangeCategoryField = (key: 'type' | 'name', value: string) => setCategoryForm(prev => ({ ...prev, [key]: value }));
  const handleCloseCategoryDialog = () => setOpenCategoryDialog(false);
  const handleSubmitCategory = async () => {
    if (!categoryForm.name || !categoryForm.type) return;
    setCategoryLoading(true);
    try {
      await createTransactionCategoryAPI({ type: categoryForm.type, name: categoryForm.name });
      setOpenCategoryDialog(false);
      setCategoryForm({ type: 'expense', name: '' });
      await fetchCategories();
      setOpenCategoryManagementDialog(true);
    } finally {
      setCategoryLoading(false);
    }
  };
  const handleCloseDeleteCategoryDialog = () => { setOpenDeleteCategoryDialog(false); setCategoryToDelete(null); };
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteCategoryLoading(true);
    try {
      await deleteTransactionCategoryAPI(categoryToDelete.id);
      setOpenDeleteCategoryDialog(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const handleAskDeleteCategory = (id: number | string, name: string) => {
    setCategoryToDelete({ id, name });
    setOpenDeleteCategoryDialog(true);
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField select label="Loại" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="revenue">Thu</MenuItem>
            <MenuItem value="expense">Chi</MenuItem>
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
              <TextField label="Từ ngày" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
              <TextField label="Đến ngày" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
            </>
          )}
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>Xuất Excel</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleOpenCategoryManagementDialog} sx={{ borderRadius: 2 }}>Quản lý danh mục</Button>
          <Button variant="outlined" onClick={handleOpenTransactionDialog} sx={{ borderRadius: 2 }}>Tạo hóa đơn</Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Số tiền</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t, idx) => (
              <TableRow key={t.id || idx} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{t.category?.name || '-'}</Typography></TableCell>
                <TableCell><Chip label={t.category?.type === 'revenue' ? 'Thu' : 'Chi'} color={t.category?.type === 'revenue' ? 'success' : 'error'} size="small" /></TableCell>
                <TableCell><Typography variant="body2">{t.description || '-'}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{(t.transactionAt || t.transaction_at) ? new Date(t.transactionAt || (t.transaction_at as string)).toLocaleDateString('vi-VN') : '-'}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={600} color={t.category?.type === 'revenue' ? 'success.main' : 'error.main'}>{t.amount ? t.amount.toLocaleString() : '0'} ₫</Typography></TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Chỉnh sửa"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => handleEditTransaction(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteTransaction(t)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} />
      </Box>

      {/* Dialog tạo thu chi khác */}
      <FormDialog
        open={openTransactionDialog}
        onClose={handleCloseTransactionDialog}
        title="Tạo thu/chi khác"
        subtitle="Nhập thông tin khoản thu/chi (tiền điện, nước, dịch vụ,...)"
        onSubmit={handleSubmitTransaction}
        loading={transactionLoading}
        submitText="Lưu"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Số tiền" type="number" fullWidth value={transactionForm.amount} onChange={(e) => handleChangeTransactionField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={transactionForm.category_id} onChange={(e) => handleChangeTransactionField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline minRows={2} value={transactionForm.description} onChange={(e) => handleChangeTransactionField('description', e.target.value)} />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog chỉnh sửa thu chi khác */}
      <FormDialog
        open={openEditTransactionDialog}
        onClose={handleCloseEditTransactionDialog}
        title="Chỉnh sửa thu/chi khác"
        subtitle="Cập nhật thông tin khoản thu/chi"
        onSubmit={handleSubmitEditTransaction}
        loading={editTransactionLoading}
        submitText="Cập nhật"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Số tiền" type="number" fullWidth value={editTransactionForm.amount} onChange={(e) => handleChangeEditTransactionField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={editTransactionForm.category_id} onChange={(e) => handleChangeEditTransactionField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline minRows={2} value={editTransactionForm.description} onChange={(e) => handleChangeEditTransactionField('description', e.target.value)} />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog tạo danh mục */}
      <FormDialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        title="Tạo danh mục"
        subtitle="Nhập thông tin danh mục thu/chi"
        onSubmit={handleSubmitCategory}
        loading={categoryLoading}
        submitText="Lưu"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Loại" value={categoryForm.type} onChange={(e) => handleChangeCategoryField('type', e.target.value)} required>
              <MenuItem value="revenue">Thu</MenuItem>
              <MenuItem value="expense">Chi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tên danh mục" fullWidth value={categoryForm.name} onChange={(e) => handleChangeCategoryField('name', e.target.value)} required />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog quản lý danh mục - beautiful UI */}
      <Dialog open={openCategoryManagementDialog} onClose={handleCloseCategoryManagementDialog} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 4, px: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Quản lý danh mục</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>Quản lý các danh mục thu chi của hệ thống</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3, boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{Array.isArray(categories) ? categories.length : 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Tổng số danh mục</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: 3, boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{Array.isArray(categories) ? categories.filter(c => c.type === 'revenue').length : 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Danh mục thu</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: 3, boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{Array.isArray(categories) ? categories.filter(c => c.type === 'expense').length : 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Danh mục chi</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="#1e293b">Danh sách danh mục</Typography>
                  <Typography variant="body2" color="text.secondary">Quản lý và chỉnh sửa các danh mục thu chi</Typography>
                </Box>
                <Button variant="contained" onClick={handleOpenCreateCategoryFromManagement}
                  sx={{ borderRadius: 3, bgcolor: '#667eea', px: 3, py: 1, fontWeight: 600, '&:hover': { bgcolor: '#5a6fd8', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }, transition: 'all 0.2s ease' }}>
                  Tạo danh mục
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Tên danh mục</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Loại</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(categories) && categories.length > 0 ? categories.map((category, idx) => (
                      <TableRow key={category.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600} color="#1e293b">{category.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={category.type === 'revenue' ? 'Thu' : 'Chi'} color={category.type === 'revenue' ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                            <Tooltip title="Chỉnh sửa danh mục">
                              <IconButton size="small" color="primary" onClick={async () => {
                                setCategoryToEdit(category);
                                try {
                                  const res = await getTransactionCategoryByIdAPI(String(category.id));
                                  const data = (res as any)?.data?.data || (res as any)?.data || {};
                                  setEditCategoryForm({ type: data.type || category.type, name: data.name || category.name });
                                } catch (_) {
                                  setEditCategoryForm({ type: category.type, name: category.name });
                                }
                                setOpenEditCategoryDialog(true);
                              }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa danh mục">
                              <IconButton size="small" color="error" onClick={() => handleAskDeleteCategory(category.id, category.name)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">Chưa có danh mục nào</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end' }}>
          <Button onClick={handleCloseCategoryManagementDialog} sx={{ borderRadius: 3, px: 4, py: 1.5, bgcolor: '#64748b', color: 'white', fontWeight: 600, '&:hover': { bgcolor: '#475569' } }}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa danh mục */}
      <FormDialog
        open={openEditCategoryDialog}
        onClose={() => setOpenEditCategoryDialog(false)}
        title="Chỉnh sửa danh mục"
        subtitle="Cập nhật thông tin danh mục"
        onSubmit={async () => {
          if (!categoryToEdit) return;
          setEditCategoryLoading(true);
          try {
            await updateTransactionCategoryAPI(String(categoryToEdit.id), { type: editCategoryForm.type, name: editCategoryForm.name });
            setOpenEditCategoryDialog(false);
            setCategoryToEdit(null);
            await fetchCategories();
          } finally {
            setEditCategoryLoading(false);
          }
        }}
        loading={editCategoryLoading}
        submitText="Cập nhật"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Loại" value={editCategoryForm.type} onChange={(e) => setEditCategoryForm(prev => ({ ...prev, type: e.target.value as 'revenue' | 'expense' }))} required>
              <MenuItem value="revenue">Thu</MenuItem>
              <MenuItem value="expense">Chi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tên danh mục" fullWidth value={editCategoryForm.name} onChange={(e) => setEditCategoryForm(prev => ({ ...prev, name: e.target.value }))} required />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog xác nhận xóa hóa đơn */}
      <Dialog open={openDeleteTransactionDialog} onClose={handleCloseDeleteTransactionDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa hóa đơn "{transactionToDelete?.description || 'Không có mô tả'}" với số tiền {transactionToDelete?.amount ? transactionToDelete.amount.toLocaleString() : '0'} ₫?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteTransactionDialog} disabled={deleteTransactionLoading}>Hủy</Button>
          <Button onClick={handleConfirmDeleteTransaction} color="error" variant="contained" disabled={deleteTransactionLoading}>
            {deleteTransactionLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa danh mục */}
      <Dialog open={openDeleteCategoryDialog} onClose={handleCloseDeleteCategoryDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name || ''}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCategoryDialog} disabled={deleteCategoryLoading}>Hủy</Button>
          <Button onClick={handleConfirmDeleteCategory} color="error" variant="contained" disabled={deleteCategoryLoading}>
            {deleteCategoryLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OtherTransactionsTab;
