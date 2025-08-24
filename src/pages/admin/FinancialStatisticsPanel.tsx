import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, IconButton, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { History as HistoryIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
// import { getPaymentsAPI, getTeacherPaymentsAPI, payTeacherAPI, getTotalPaymentsAPI, getTeacherByIdAPI } from '../../services/api';
import { getAllTransactionsAPI, createTransactionAPI, updateTransactionAPI, deleteTransactionAPI, getAllPaymentsAPI, createTransactionCategoryAPI, getAllTransactionCategoriesAPI, deleteTransactionCategoryAPI, updateTransactionCategoryAPI, getAllTeacherPaymentsAPI } from '../../services/api';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormDialog from '../../components/common/forms/FormDialog';
// NOTE: Payments/teacher APIs under development; calls commented out to avoid 404s

interface StudentPayment {
  id: string;
  month: number;
  year: number;
  totalLessons: number;
  paidAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  class: {
    id: string;
    name: string;
  };
  histories: any[];
}

interface TeacherPayment {
  id: string;
  teacherId?: {
    id?: string;
    userId?: { id?: string; name?: string; };
    name?: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  month?: number;
  year?: number;
  salaryPerLesson?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  classes?: Array<{
    classId?: { name: string; };
    totalLessons?: number;
  }>;
}

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface TotalStatistics {
  totalStudentFees: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalTeacherSalary: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface TeacherDetailInfo {
  userId?: { email?: string; phone?: string; };
  email?: string;
  phone?: string;
}

interface TeacherPaymentConfirmData {
  teacher: TeacherPayment;
  paymentData: { amount: number; method: string; note: string; };
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: {
    id: number;
    name: string;
    type: 'revenue' | 'expense';
  };
  transaction_at: string;
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const FinancialStatisticsPanel: React.FC = () => {
  const [periodType, setPeriodType] = useState<string>('year');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [tab, setTab] = useState<number>(0);
  // Other transactions (manual revenues/expenses)
  const [otherTransactions, setOtherTransactions] = useState<Transaction[]>([]);
  const [otherPage, setOtherPage] = useState<number>(1);
  const [otherTotalPages, setOtherTotalPages] = useState<number>(1);
  const [openOtherDialog, setOpenOtherDialog] = useState<boolean>(false);
  const [otherForm, setOtherForm] = useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [otherLoading, setOtherLoading] = useState<boolean>(false);

  // Category dialog states
  const [openCategoryDialog, setOpenCategoryDialog] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);

  // Category management dialog states
  const [openCategoryManagementDialog, setOpenCategoryManagementDialog] = useState<boolean>(false);
  const [categoryManagementLoading, setCategoryManagementLoading] = useState<boolean>(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState<boolean>(false);

  // Edit category dialog states
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [editCategoryLoading, setEditCategoryLoading] = useState<boolean>(false);

  // Transaction dialog states
  const [openTransactionDialog, setOpenTransactionDialog] = useState<boolean>(false);
  const [transactionForm, setTransactionForm] = useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);

  // Edit transaction dialog states
  const [openEditTransactionDialog, setOpenEditTransactionDialog] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [editTransactionForm, setEditTransactionForm] = useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [editTransactionLoading, setEditTransactionLoading] = useState<boolean>(false);

  // Delete transaction dialog states
  const [openDeleteTransactionDialog, setOpenDeleteTransactionDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [deleteTransactionLoading, setDeleteTransactionLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [customStart, setCustomStart] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPayment[]>([]);
  const [studentPaymentsLoaded, setStudentPaymentsLoaded] = useState<boolean>(false);
  const [studentPagination, setStudentPagination] = useState<PaginationState>({
    page: 1, limit: 10, totalPages: 1, totalResults: 0
  });
  const [teacherPagination, setTeacherPagination] = useState<PaginationState>({
    page: 1, limit: 10, totalPages: 1, totalResults: 0
  });
  const [totalStatistics, setTotalStatistics] = useState<TotalStatistics>({
    totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0, totalTeacherSalary: 0
  });

  // Modal states
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<StudentPayment | TeacherPayment | null>(null);
  const [teacherPaymentLoading, setTeacherPaymentLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [teacherPaymentConfirmOpen, setTeacherPaymentConfirmOpen] = useState<boolean>(false);
  const [teacherPaymentConfirmData, setTeacherPaymentConfirmData] = useState<TeacherPaymentConfirmData | null>(null);
  const [teacherDetailInfo, setTeacherDetailInfo] = useState<TeacherDetailInfo | null>(null);
  const [fixedTotalTeacherSalary, setFixedTotalTeacherSalary] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>('all');

  const paymentStatuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'partial', label: 'Đóng một phần' },
    { value: 'pending', label: 'Chờ thanh toán' },
  ];

  const getQuarterMonths = (quarter: number): { startMonth: number; endMonth: number } => {
    switch (quarter) {
      case 1: return { startMonth: 1, endMonth: 3 };
      case 2: return { startMonth: 4, endMonth: 6 };
      case 3: return { startMonth: 7, endMonth: 9 };
      case 4: return { startMonth: 10, endMonth: 12 };
      default: return { startMonth: 1, endMonth: 3 };
    }
  };

  // Fetch other transactions
  const fetchOtherTransactions = async (pageNum = 1): Promise<void> => {
    try {
      const res = await getAllTransactionsAPI({ page: pageNum, limit: 10 });
      console.log('📊 Get All Transactions API Response:', res);

      const data = res?.data;
      if (data?.data?.result && Array.isArray(data.data.result)) {
        setOtherTransactions(data.data.result);
        const meta = data.data.meta;
      setOtherTotalPages(meta?.totalPages || 1);
      setOtherPage(meta?.page || pageNum);
      } else {
        console.warn('⚠️ Unexpected response format:', data);
        setOtherTransactions([]);
        setOtherTotalPages(1);
        setOtherPage(1);
      }
    } catch (e) {
      console.error('❌ Error fetching transactions:', e);
      setOtherTransactions([]);
      setOtherTotalPages(1);
      setOtherPage(1);
    }
  };

  const handleOpenOtherDialog = (): void => setOpenOtherDialog(true);
  const handleCloseOtherDialog = (): void => setOpenOtherDialog(false);
  const handleChangeOtherField = (key: 'amount' | 'category_id' | 'description', value: string) => setOtherForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitOther = async (): Promise<void> => {
    if (!otherForm.amount || !otherForm.category_id) return;
    setOtherLoading(true);
    try {
      await createTransactionAPI({ amount: Number(otherForm.amount), category_id: otherForm.category_id, description: otherForm.description });
      setOpenOtherDialog(false);
      setOtherForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
      setSnackbar({ open: true, message: 'Tạo thu/chi thành công', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Tạo thu/chi thất bại', severity: 'error' });
    } finally {
      setOtherLoading(false);
    }
  };

  // Category dialog handlers
  const handleOpenCategoryDialog = (): void => setOpenCategoryDialog(true);
  const handleCloseCategoryDialog = (): void => setOpenCategoryDialog(false);
  const handleChangeCategoryField = (key: 'type' | 'name', value: string) => setCategoryForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitCategory = async (): Promise<void> => {
    if (!categoryForm.name || !categoryForm.type) return;
    setCategoryLoading(true);
    try {
      await createTransactionCategoryAPI({ type: categoryForm.type as 'revenue' | 'expense', name: categoryForm.name });
      setOpenCategoryDialog(false);
      setCategoryForm({ type: 'expense', name: '' });
      setSnackbar({ open: true, message: 'Tạo danh mục thành công', severity: 'success' });
      // Refresh categories list
      fetchCategories();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Tạo danh mục thất bại', severity: 'error' });
    } finally {
      setCategoryLoading(false);
    }
  };

  // Category management dialog handlers
  const handleOpenCategoryManagementDialog = (): void => setOpenCategoryManagementDialog(true);
  const handleCloseCategoryManagementDialog = (): void => setOpenCategoryManagementDialog(false);
  const handleOpenCreateCategoryFromManagement = (): void => {
    setOpenCategoryManagementDialog(false);
    setOpenCategoryDialog(true);
  };

  // Delete category handlers
  const handleDeleteCategory = (category: any): void => {
    setCategoryToDelete(category);
    setOpenDeleteCategoryDialog(true);
  };

  const handleCloseDeleteCategoryDialog = (): void => {
    setOpenDeleteCategoryDialog(false);
    setCategoryToDelete(null);
  };

  const handleConfirmDeleteCategory = async (): Promise<void> => {
    if (!categoryToDelete) return;

    setDeleteCategoryLoading(true);
    try {
      await deleteTransactionCategoryAPI(categoryToDelete.id);
      setSnackbar({ open: true, message: 'Xóa danh mục thành công', severity: 'success' });
      handleCloseDeleteCategoryDialog();
      // Refresh categories list
      fetchCategories();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Xóa danh mục thất bại', severity: 'error' });
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  // Edit category handlers
  const handleEditCategory = (category: any): void => {
    setCategoryToEdit(category);
    setEditCategoryForm({
      type: category.type,
      name: category.name
    });
    setOpenEditCategoryDialog(true);
  };

  const handleCloseEditCategoryDialog = (): void => {
    setOpenEditCategoryDialog(false);
    setCategoryToEdit(null);
    setEditCategoryForm({ type: 'expense', name: '' });
  };

  const handleChangeEditCategoryField = (key: 'type' | 'name', value: string) => {
    setEditCategoryForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitEditCategory = async (): Promise<void> => {
    if (!categoryToEdit || !editCategoryForm.name || !editCategoryForm.type) return;

    setEditCategoryLoading(true);
    try {
      await updateTransactionCategoryAPI(categoryToEdit.id, {
        type: editCategoryForm.type as 'revenue' | 'expense',
        name: editCategoryForm.name
      });
      setSnackbar({ open: true, message: 'Cập nhật danh mục thành công', severity: 'success' });
      handleCloseEditCategoryDialog();
      // Refresh categories list
      fetchCategories();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Cập nhật danh mục thất bại', severity: 'error' });
    } finally {
      setEditCategoryLoading(false);
    }
  };

  // Transaction dialog handlers
  const handleOpenTransactionDialog = (): void => {
    setOpenTransactionDialog(true);
    fetchCategories(); // Fetch categories when opening dialog
  };
  const handleCloseTransactionDialog = (): void => setOpenTransactionDialog(false);

  // Edit transaction handlers
  const handleEditTransaction = (transaction: Transaction): void => {
    setTransactionToEdit(transaction);
    setEditTransactionForm({
      amount: String(transaction.amount),
      category_id: String(transaction.category.id),
      description: transaction.description || ''
    });
    setOpenEditTransactionDialog(true);
    fetchCategories(); // Fetch categories when opening dialog
  };

  const handleCloseEditTransactionDialog = (): void => {
    setOpenEditTransactionDialog(false);
    setTransactionToEdit(null);
    setEditTransactionForm({ amount: '', category_id: '', description: '' });
  };

  const handleChangeEditTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => {
    setEditTransactionForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitEditTransaction = async (): Promise<void> => {
    if (!transactionToEdit || !editTransactionForm.amount || !editTransactionForm.category_id || editTransactionForm.category_id === '') {
      setSnackbar({ open: true, message: 'Vui lòng nhập đầy đủ thông tin', severity: 'error' });
      return;
    }

    setEditTransactionLoading(true);
    try {
      const transactionData = {
        amount: Number(editTransactionForm.amount),
        category_id: editTransactionForm.category_id,
        description: editTransactionForm.description
      };
      console.log('📤 Updating transaction data:', transactionData);

      await updateTransactionAPI(transactionToEdit.id, transactionData);
      handleCloseEditTransactionDialog();
      await fetchOtherTransactions(otherPage);
      setSnackbar({ open: true, message: 'Cập nhật hóa đơn thành công', severity: 'success' });
    } catch (e: any) {
      console.error('❌ Transaction update error:', e);
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Cập nhật hóa đơn thất bại', severity: 'error' });
    } finally {
      setEditTransactionLoading(false);
    }
  };

  // Delete transaction handlers
  const handleDeleteTransaction = (transaction: Transaction): void => {
    setTransactionToDelete(transaction);
    setOpenDeleteTransactionDialog(true);
  };

  const handleCloseDeleteTransactionDialog = (): void => {
    setOpenDeleteTransactionDialog(false);
    setTransactionToDelete(null);
  };

  const handleConfirmDeleteTransaction = async (): Promise<void> => {
    if (!transactionToDelete) return;

    setDeleteTransactionLoading(true);
    try {
      await deleteTransactionAPI(transactionToDelete.id);
      setSnackbar({ open: true, message: 'Xóa hóa đơn thành công', severity: 'success' });
      handleCloseDeleteTransactionDialog();
      await fetchOtherTransactions(otherPage);
    } catch (e: any) {
      console.error('❌ Transaction deletion error:', e);
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Xóa hóa đơn thất bại', severity: 'error' });
    } finally {
      setDeleteTransactionLoading(false);
    }
  };
  const handleChangeTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => {
    console.log('🔍 Transaction field change:', { key, value });
    setTransactionForm(prev => ({ ...prev, [key]: value }));
  };
  const handleSubmitTransaction = async (): Promise<void> => {
    console.log('🔍 Transaction Form Data:', transactionForm);
    console.log('🔍 Validation Check:', {
      hasAmount: !!transactionForm.amount,
      hasCategoryId: !!transactionForm.category_id,
      amount: transactionForm.amount,
      category_id: transactionForm.category_id,
      description: transactionForm.description
    });

    if (!transactionForm.amount || !transactionForm.category_id || transactionForm.category_id === '') {
      console.log('❌ Validation failed - missing required fields');
      console.log('❌ Validation details:', {
        amount: transactionForm.amount,
        category_id: transactionForm.category_id,
        amountValid: !!transactionForm.amount,
        categoryValid: !!transactionForm.category_id && transactionForm.category_id !== ''
      });
      setSnackbar({ open: true, message: 'Vui lòng nhập đầy đủ số tiền và chọn danh mục', severity: 'error' });
      return;
    }

    setTransactionLoading(true);
    try {
      const transactionData = {
        amount: Number(transactionForm.amount),
        category_id: transactionForm.category_id,
        description: transactionForm.description
      };
      console.log('📤 Sending transaction data to API:', transactionData);

      await createTransactionAPI(transactionData);
      setOpenTransactionDialog(false);
      setTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
      setSnackbar({ open: true, message: 'Tạo hóa đơn thành công', severity: 'success' });
    } catch (e: any) {
      console.error('❌ Transaction creation error:', e);
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Tạo hóa đơn thất bại', severity: 'error' });
    } finally {
      setTransactionLoading(false);
    }
  };

  // Fetch categories for transaction form
  const fetchCategories = async (): Promise<void> => {
    setCategoriesLoading(true);
    try {
      const res = await getAllTransactionCategoriesAPI({ page: 1, limit: 1000 });
      console.log('📊 Categories API Response:', res);

      // Handle response format: { statusCode: 200, message: "", data: [...] }
      let data = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        // Direct array in data field
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        // Direct array response
        data = res.data;
      } else if (res?.data?.data?.result && Array.isArray(res.data.data.result)) {
        // Paginated response
        data = res.data.data.result;
      } else if (res?.data?.result && Array.isArray(res.data.result)) {
        // Alternative paginated response
        data = res.data.result;
      }

      console.log('📊 Parsed categories data:', data);
      console.log('📊 Categories structure:', data.map((cat: any) => ({ id: cat.id, name: cat.name, type: cat.type })));
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchTotalStatistics = async (): Promise<void> => {
    // Compute from local state
    const totalStudentFees = studentPayments.reduce((total, p) => total + (p.totalAmount ?? 0), 0);
    const totalPaidAmount = studentPayments.reduce((total, p) => total + (p.paidAmount ?? 0), 0);
    const totalRemainingAmount = studentPayments.reduce((total, p) => {
      const finalAmount = (p.totalAmount ?? 0) - (p.discountAmount ?? 0);
      return total + (finalAmount - (p.paidAmount ?? 0));
    }, 0);
      const totalTeacherSalary = teacherPayments.reduce((total, p) => total + (p.totalAmount ?? 0), 0);

      setTotalStatistics({
      totalStudentFees,
      totalPaidAmount,
      totalRemainingAmount,
      totalTeacherSalary
      });
  };

  const fetchStudentPayments = async (page: number = 1): Promise<void> => {
    try {
      let params: any = { page, limit: 10 };

      // Build filters object based on current filters
      const filters: any = {};
      if (paymentStatus !== 'all') filters.status = paymentStatus;
      if (periodType === 'month') {
        filters.month = selectedMonth;
        filters.year = selectedYear;
      } else if (periodType === 'quarter') {
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

      // Add filters to params if not empty
      if (Object.keys(filters).length > 0) {
        params.filters = JSON.stringify(filters);
      }

      console.log('📊 Fetching student payments with params:', params);
      const res = await getAllPaymentsAPI(params);
      const data = res?.data?.data || res?.data;

      if (data && data.result) {
        setStudentPayments(data.result);
        const meta = data.meta;
      setStudentPagination({
          page: meta?.page || page,
          limit: meta?.limit || 10,
          totalPages: meta?.totalPages || 1,
          totalResults: meta?.totalItems || 0
        });
      } else {
        setStudentPayments([]);
        setStudentPagination({
          page, limit: 10, totalPages: 1,
          totalResults: 0
        });
      }
      setStudentPaymentsLoaded(true);
    } catch (err) {
      console.error('Error fetching student payments:', err);
      setStudentPayments([]);
      setStudentPagination({ page: 1, limit: 10, totalPages: 1, totalResults: 0 });
    } finally {
      // Loading completed
    }
  };

  const fetchTeacherPayments = async (page: number = 1): Promise<void> => {
    try {
      let params: any = { page, limit: 10 };
      if (paymentStatus !== 'all') params = { ...params, status: paymentStatus };
      if (periodType === 'month') params = { ...params, year: selectedYear, month: selectedMonth };
      else if (periodType === 'quarter') {
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
      const teacherPaymentsData = res?.data?.data?.result || res?.data?.result || res?.data || [];
      const paginationData = res?.data?.data?.meta || res?.data?.meta || { page, limit: 10, totalPages: 1, totalResults: 0 };

      setTeacherPayments(teacherPaymentsData);
      setTeacherPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || 10,
        totalPages: paginationData.totalPages || 1,
        totalResults: paginationData.totalItems || paginationData.totalResults || 0
      });
    } catch (err) {
      console.error('Error fetching teacher payments:', err);
      setTeacherPayments([]);
      setTeacherPagination({ page: 1, limit: 10, totalPages: 1, totalResults: 0 });
    } finally {
      // Loading completed
    }
  };

  useEffect(() => {
    fetchTeacherPayments(1);
    setStudentPaymentsLoaded(false);
    setStudentPagination(prev => ({ ...prev, page: 1 }));
    setTeacherPagination(prev => ({ ...prev, page: 1 }));
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories when dialogs open
  useEffect(() => {
    if (openOtherDialog || openTransactionDialog || openCategoryManagementDialog) {
      fetchCategories();
    }
  }, [openOtherDialog, openTransactionDialog, openCategoryManagementDialog]);

  // Fetch categories when transaction dialog opens specifically
  useEffect(() => {
    if (openTransactionDialog) {
      fetchCategories();
    }
  }, [openTransactionDialog]);

  useEffect(() => {
    if (tab === 1 && !studentPaymentsLoaded) {
      fetchStudentPayments(1);
    }
  }, [tab, periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  useEffect(() => {
    if (tab === 1) {
      fetchStudentPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  // Update total statistics when student payments change
  useEffect(() => {
    fetchTotalStatistics();
  }, [studentPayments, teacherPayments]);

  useEffect(() => {
    // Temporarily skip fetching teacher totals from API
        setFixedTotalTeacherSalary(0);
  }, []);

  useEffect(() => {
    if (paymentStatus !== 'all') {
      fetchStudentPayments(1);
      fetchTeacherPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
      setTeacherPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [paymentStatus]);

  const handleStudentPageChange = (_: React.ChangeEvent<unknown>, newPage: number): void => {
    fetchStudentPayments(newPage);
  };

  const handleTeacherPageChange = (_: React.ChangeEvent<unknown>, newPage: number): void => {
    fetchTeacherPayments(newPage);
  };

  const handleOpenPaymentHistory = async (payment: StudentPayment | TeacherPayment): Promise<void> => {
    setSelectedPaymentForHistory(payment);
    setPaymentHistoryModalOpen(true);
    // Skipping teacher info fetch while API under development
        setTeacherDetailInfo(null);
  };

  const handleClosePaymentHistory = (): void => {
    setSelectedPaymentForHistory(null);
    setPaymentHistoryModalOpen(false);
  };





  const handleConfirmTeacherPaymentFinal = async (): Promise<void> => {
    if (!teacherPaymentConfirmData) return;

    setTeacherPaymentLoading(true);
    setTeacherPaymentConfirmOpen(false);

    try {
      // Payment API not available; show placeholder success
      setSnackbar({ open: true, message: 'Chức năng đang phát triển', severity: 'info' });
      await fetchTeacherPayments();
      await fetchTotalStatistics();
    } catch (error: any) {
      console.error('Lỗi thanh toán lương giáo viên:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán lương giáo viên',
        severity: 'error'
      });
    } finally {
      setTeacherPaymentLoading(false);
      setTeacherPaymentConfirmData(null);
    }
  };



  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê tài chính
      </Typography>

      {/* Cards tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng lương giáo viên</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{fixedTotalTeacherSalary.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học phí</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">{totalStatistics.totalStudentFees.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{totalStatistics.totalPaidAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">{totalStatistics.totalRemainingAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bộ lọc thời gian */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50', boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth label="Loại thống kê" value={periodType} onChange={e => setPeriodType(e.target.value)}>
              <MenuItem value="month">Tháng</MenuItem>
              <MenuItem value="quarter">Quý</MenuItem>
              <MenuItem value="year">Năm</MenuItem>
              <MenuItem value="custom">Tùy chỉnh</MenuItem>
            </TextField>
          </Grid>
          {periodType !== 'custom' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Năm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'month' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Tháng" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'quarter' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Quý" value={selectedQuarter} onChange={e => setSelectedQuarter(Number(e.target.value))}>
                {quarters.map(q => <MenuItem key={q} value={q}>Quý {q}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'custom' && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth label="Trạng thái thanh toán" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
              {paymentStatuses.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs bảng chi tiết */}
      <Paper sx={{ mb: 3, boxShadow: 'none' }}>
        <Tabs value={tab} onChange={(_, v) => {
          setTab(v);
          if (v === 2) fetchOtherTransactions(1);
        }}>
          <Tab label="Chi tiết giáo viên" />
          <Tab label="Chi tiết học sinh" />
          <Tab label="Thu chi khác" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <>
            {/* Filter controls for teacher payments */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                select
                label="Trạng thái"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="paid">Đã thanh toán</MenuItem>
                <MenuItem value="pending">Chờ thanh toán</MenuItem>
                <MenuItem value="partial">Nhận một phần</MenuItem>
              </TextField>

              <TextField
                select
                label="Thời gian"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="year">Năm</MenuItem>
                <MenuItem value="month">Tháng</MenuItem>
                <MenuItem value="quarter">Quý</MenuItem>
                <MenuItem value="custom">Tùy chọn</MenuItem>
              </TextField>

              {periodType === 'year' && (
                <TextField
                  select
                  label="Năm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  sx={{ minWidth: 120 }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </TextField>
              )}

              {periodType === 'month' && (
                <>
                  <TextField
                    select
                    label="Năm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Tháng"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </TextField>
                </>
              )}

              {periodType === 'quarter' && (
                <>
                  <TextField
                    select
                    label="Năm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Quý"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    {quarters.map((quarter) => (
                      <MenuItem key={quarter} value={quarter}>Q{quarter}</MenuItem>
                    ))}
                  </TextField>
                </>
              )}

              {periodType === 'custom' && (
                <>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    sx={{ minWidth: 150 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    sx={{ minWidth: 150 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}

              <Button
                variant="contained"
                onClick={() => fetchTeacherPayments(1)}
                sx={{ minWidth: 100 }}
              >
                Lọc
              </Button>
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
                  {teacherPayments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {p.teacher?.name || p.teacherId?.userId?.name || p.teacherId?.name || 'Chưa có tên'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.teacher?.email || ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                      <TableCell align="right">{(p.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="right">
                        {p.classes && Array.isArray(p.classes)
                          ? p.classes.reduce((sum, classItem) => sum + (classItem.totalLessons || 0), 0)
                          : 0
                        }
                      </TableCell>
                      <TableCell align="right">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.status === 'paid' ? 'Đã thanh toán' : p.status === 'partial' ? 'Nhận một phần' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán'}
                          color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : p.status === 'pending' ? 'info' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="primary" onClick={() => console.log('View detail:', p)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lịch sử thanh toán">
                          <IconButton size="small" color="info" onClick={() => handleOpenPaymentHistory(p)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {((p.totalAmount ?? 0) - (p.paidAmount ?? 0) > 0) && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => console.log('Payment for:', p)}
                          >
                            Thanh toán
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={teacherPagination.totalPages}
                page={teacherPagination.page}
                onChange={handleTeacherPageChange}
                color="primary"
              />
            </Box>
            </>
          )}
          {tab === 1 && (
            <>
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
                    {studentPayments.map((p) => (
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
                          <Chip
                            label={p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                            color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      <TableCell align="center">
                          <IconButton onClick={() => handleOpenPaymentHistory(p)}>
                            <HistoryIcon />
                          </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={studentPagination.totalPages}
                  page={studentPagination.page}
                  onChange={handleStudentPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
          {tab === 2 && (
            <>


              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenCategoryManagementDialog}
                    sx={{ borderRadius: 2 }}
                  >
                    Quản lý danh mục
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleOpenTransactionDialog}
                    sx={{ borderRadius: 2 }}
                  >
                    Tạo hóa đơn
                  </Button>
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
                    {otherTransactions.map((transaction: Transaction, idx: number) => (
                      <TableRow key={transaction.id || idx} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {transaction.category?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.category?.type === 'revenue' ? 'Thu' : 'Chi'}
                            color={transaction.category?.type === 'revenue' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.transaction_at ? new Date(transaction.transaction_at).toLocaleDateString('vi-VN') : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color={transaction.category?.type === 'revenue' ? 'success.main' : 'error.main'}>
                            {transaction.amount ? transaction.amount.toLocaleString() : '0'} ₫
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleEditTransaction(transaction)}
                                sx={{ color: 'primary.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTransaction(transaction)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {otherTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Không có dữ liệu
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={otherTotalPages} page={otherPage} onChange={(_, p) => fetchOtherTransactions(p)} />
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog tạo thu chi khác */}
      <FormDialog
        open={openOtherDialog}
        onClose={handleCloseOtherDialog}
        title="Tạo thu/chi khác"
        subtitle="Nhập thông tin khoản thu/chi (tiền điện, nước, dịch vụ,...)"
        onSubmit={handleSubmitOther}
        loading={otherLoading}
        submitText="Lưu"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Số tiền"
              type="number"
              fullWidth
              value={otherForm.amount}
              onChange={(e) => handleChangeOtherField('amount', e.target.value)}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={otherForm.category_id} onChange={(e) => handleChangeOtherField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={2}
              value={otherForm.description}
              onChange={(e) => handleChangeOtherField('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog quản lý danh mục */}
      <Dialog
        open={openCategoryManagementDialog}
        onClose={handleCloseCategoryManagementDialog}
        maxWidth="md"
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight={600} color="#1e293b">
                Quản lý danh mục
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Quản lý các danh mục thu chi của hệ thống
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleOpenCreateCategoryFromManagement}
              sx={{
                borderRadius: 2,
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5a6fd8' },
                px: 3,
                py: 1
              }}
              startIcon={<AddIcon />}
            >
              Tạo danh mục
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {categoriesLoading ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 6
            }}>
              <CircularProgress size={40} sx={{ color: '#667eea', mb: 2 }} />
              <Typography color="text.secondary">Đang tải danh mục...</Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Tên danh mục</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Loại</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category, index) => (
                      <TableRow
                        key={category.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: '#f1f5f9' },
                          '&:nth-of-type(even)': { bgcolor: '#fafbfc' }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: '#64748b' }}>
                          #{category.id}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={500}>
                            {category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={category.type === 'revenue' ? 'Thu' : 'Chi'}
                            color={category.type === 'revenue' ? 'success' : 'error'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              '& .MuiChip-label': { px: 1.5 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <IconButton
                              size="small"
                              color="primary"
                              title="Chỉnh sửa"
                              onClick={() => handleEditCategory(category)}
                              sx={{
                                bgcolor: '#dbeafe',
                                '&:hover': { bgcolor: '#bfdbfe' },
                                '& .MuiSvgIcon-root': { fontSize: 18 }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                                                        <IconButton
                              size="small"
                              color="error"
                              title="Xóa"
                              onClick={() => handleDeleteCategory(category)}
                              sx={{
                                bgcolor: '#fee2e2',
                                '&:hover': { bgcolor: '#fecaca' },
                                '& .MuiSvgIcon-root': { fontSize: 18 }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            Không có danh mục nào
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Hãy tạo danh mục đầu tiên để bắt đầu
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={handleCloseCategoryManagementDialog}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: '#64748b',
              '&:hover': { bgcolor: '#e2e8f0' }
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa danh mục */}
      <Dialog
        open={openDeleteCategoryDialog}
        onClose={handleCloseDeleteCategoryDialog}
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
          bgcolor: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          pb: 2
        }}>
          <Typography variant="h6" color="#dc2626" fontWeight={600}>
            Xác nhận xóa danh mục
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{
              bgcolor: '#fee2e2',
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DeleteIcon sx={{ color: '#dc2626', fontSize: 24 }} />
            </Box>
            <Typography variant="body1" color="#374151">
              Bạn có chắc chắn muốn xóa danh mục này?
            </Typography>
          </Box>
          {categoryToDelete && (
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <Typography variant="body2" color="#6b7280" sx={{ mb: 1 }}>
                Thông tin danh mục:
              </Typography>
              <Typography variant="body1" fontWeight={500} color="#374151">
                {categoryToDelete.name}
              </Typography>
              <Chip
                label={categoryToDelete.type === 'revenue' ? 'Thu' : 'Chi'}
                color={categoryToDelete.type === 'revenue' ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Paper>
          )}
          <Typography variant="body2" color="#ef4444" sx={{ mt: 2, fontStyle: 'italic' }}>
            ⚠️ Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#fef2f2', borderTop: '1px solid #fecaca' }}>
          <Button
            onClick={handleCloseDeleteCategoryDialog}
            disabled={deleteCategoryLoading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: '#6b7280',
              '&:hover': { bgcolor: '#f3f4f6' }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDeleteCategory}
            disabled={deleteCategoryLoading}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
              '&:disabled': { bgcolor: '#fca5a5' }
            }}
          >
            {deleteCategoryLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa danh mục */}
      <Dialog
        open={openEditCategoryDialog}
        onClose={handleCloseEditCategoryDialog}
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
          bgcolor: '#eff6ff',
          borderBottom: '1px solid #bfdbfe',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              bgcolor: '#dbeafe',
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EditIcon sx={{ color: '#2563eb', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" color="#1e40af" fontWeight={600}>
                Chỉnh sửa danh mục
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Cập nhật thông tin danh mục
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Loại"
                value={editCategoryForm.type}
                onChange={(e) => handleChangeEditCategoryField('type', e.target.value)}
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="revenue">Thu</MenuItem>
                <MenuItem value="expense">Chi</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên danh mục"
                fullWidth
                value={editCategoryForm.name}
                onChange={(e) => handleChangeEditCategoryField('name', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          {categoryToEdit && (
            <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mt: 2 }}>
              <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                Thông tin hiện tại:
              </Typography>
              <Typography variant="body1" fontWeight={500} color="#374151">
                {categoryToEdit.name}
              </Typography>
              <Chip
                label={categoryToEdit.type === 'revenue' ? 'Thu' : 'Chi'}
                color={categoryToEdit.type === 'revenue' ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#eff6ff', borderTop: '1px solid #bfdbfe' }}>
          <Button
            onClick={handleCloseEditCategoryDialog}
            disabled={editCategoryLoading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: '#64748b',
              '&:hover': { bgcolor: '#e2e8f0' }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitEditCategory}
            disabled={editCategoryLoading}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              '&:disabled': { bgcolor: '#93c5fd' }
            }}
          >
            {editCategoryLoading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

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
            <TextField
              label="Tên danh mục"
              fullWidth
              value={categoryForm.name}
              onChange={(e) => handleChangeCategoryField('name', e.target.value)}
              required
            />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog chỉnh sửa hóa đơn */}
      <FormDialog
        open={openEditTransactionDialog}
        onClose={handleCloseEditTransactionDialog}
        title="Chỉnh sửa hóa đơn"
        subtitle="Cập nhật thông tin hóa đơn"
        onSubmit={handleSubmitEditTransaction}
        loading={editTransactionLoading}
        submitText="Cập nhật"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Số tiền"
              type="number"
              fullWidth
              value={editTransactionForm.amount}
              onChange={(e) => handleChangeEditTransactionField('amount', e.target.value)}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Danh mục"
              value={editTransactionForm.category_id}
              onChange={(e) => handleChangeEditTransactionField('category_id', e.target.value)}
              disabled={categoriesLoading}
              helperText={categoriesLoading ? 'Đang tải danh mục...' : ''}
            >
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  {categoriesLoading ? 'Đang tải...' : 'Không có danh mục nào'}
                </MenuItem>
              )}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={2}
              value={editTransactionForm.description}
              onChange={(e) => handleChangeEditTransactionField('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Dialog xác nhận xóa hóa đơn */}
      <ConfirmDialog
        open={openDeleteTransactionDialog}
        onClose={handleCloseDeleteTransactionDialog}
        onConfirm={handleConfirmDeleteTransaction}
        title="Xác nhận xóa hóa đơn"
        message={`Bạn có chắc chắn muốn xóa hóa đơn "${transactionToDelete?.description || 'Không có mô tả'}" với số tiền ${transactionToDelete?.amount ? transactionToDelete.amount.toLocaleString() : '0'} ₫?`}
        confirmText="Xóa"
        cancelText="Hủy"
        loading={deleteTransactionLoading}
      />

      {/* Dialog tạo hóa đơn */}
      <FormDialog
        open={openTransactionDialog}
        onClose={handleCloseTransactionDialog}
        title="Tạo hóa đơn"
        subtitle="Nhập thông tin hóa đơn thu/chi"
        onSubmit={handleSubmitTransaction}
        loading={transactionLoading}
        submitText="Lưu"
        cancelText="Hủy"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Số tiền"
              type="number"
              fullWidth
              value={transactionForm.amount}
              onChange={(e) => handleChangeTransactionField('amount', e.target.value)}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Danh mục"
              value={transactionForm.category_id}
              onChange={(e) => handleChangeTransactionField('category_id', e.target.value)}
              disabled={categoriesLoading}
              helperText={categoriesLoading ? 'Đang tải danh mục...' : ''}
            >
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  {categoriesLoading ? 'Đang tải...' : 'Không có danh mục nào'}
                </MenuItem>
              )}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={2}
              value={transactionForm.description}
              onChange={(e) => handleChangeTransactionField('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </FormDialog>

             {/* Payment History Modal */}
       {selectedPaymentForHistory && (
         <PaymentHistoryModal
           open={paymentHistoryModalOpen}
           onClose={handleClosePaymentHistory}
           paymentData={selectedPaymentForHistory as any}
           title="Lịch sử thanh toán học phí"
           showPaymentDetails={true}
           teacherInfo={teacherDetailInfo as any}
         />
       )}

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      {/* Confirm Dialog for Teacher Payment */}
      <ConfirmDialog
        open={teacherPaymentConfirmOpen}
        onClose={() => setTeacherPaymentConfirmOpen(false)}
        onConfirm={handleConfirmTeacherPaymentFinal}
        title="Xác nhận thanh toán lương giáo viên"
        message={`Bạn có chắc chắn muốn thanh toán lương cho giáo viên ${teacherPaymentConfirmData?.teacher?.teacherId?.userId?.name || 'Giáo viên'} tháng ${teacherPaymentConfirmData?.teacher?.month}/${teacherPaymentConfirmData?.teacher?.year} với số tiền ${teacherPaymentConfirmData?.paymentData?.amount.toLocaleString()} ₫?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={teacherPaymentLoading}
      />
    </Box>
  );
};

export default FinancialStatisticsPanel;
