import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Pagination } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
// import { getPaymentsAPI, getTeacherPaymentsAPI, payTeacherAPI, getTotalPaymentsAPI, getTeacherByIdAPI } from '../../services/api';
import { getAllTransactionsAPI, createTransactionAPI, updateTransactionAPI, deleteTransactionAPI, getAllPaymentsAPI, createTransactionCategoryAPI, getAllTransactionCategoriesAPI, deleteTransactionCategoryAPI, updateTransactionCategoryAPI, getAllTeacherPaymentsAPI, payStudentAPI } from '../../services/api';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TeacherPaymentsTab from './financial/tabs/TeacherPaymentsTab';
import StudentPaymentsTab from './financial/tabs/StudentPaymentsTab';
import OtherTransactionsTab from './financial/tabs/OtherTransactionsTab';
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
  // Teacher filters (tab 0)
  const [teacherPeriodType, setTeacherPeriodType] = useState<string>('year');
  const [teacherSelectedYear, setTeacherSelectedYear] = useState<number>(new Date().getFullYear());
  const [teacherSelectedMonth, setTeacherSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [teacherSelectedQuarter, setTeacherSelectedQuarter] = useState<number>(1);
  const [teacherCustomStart, setTeacherCustomStart] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [teacherCustomEnd, setTeacherCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [teacherPaymentStatus, setTeacherPaymentStatus] = useState<string>('all');

  // Student filters (tab 1)
  const [studentPeriodType, setStudentPeriodType] = useState<string>('year');
  const [studentSelectedYear, setStudentSelectedYear] = useState<number>(new Date().getFullYear());
  const [studentSelectedMonth, setStudentSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [studentSelectedQuarter, setStudentSelectedQuarter] = useState<number>(1);
  const [studentCustomStart, setStudentCustomStart] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [studentCustomEnd, setStudentCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentPaymentStatus, setStudentPaymentStatus] = useState<string>('all');
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
  // const [categoryManagementLoading, setCategoryManagementLoading] = useState<boolean>(false);
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
  // Other tab simple filters (optional UI)
  const [otherCustomStart, setOtherCustomStart] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [otherCustomEnd, setOtherCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
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

  // Student payment dialog states
  const [openStudentPaymentDialog, setOpenStudentPaymentDialog] = useState<boolean>(false);
  const [selectedStudentPayment, setSelectedStudentPayment] = useState<StudentPayment | null>(null);
  const [studentPaymentForm, setStudentPaymentForm] = useState<{ amount: string; method: string; note: string }>({ amount: '', method: 'cash', note: '' });
  const [studentPaymentLoading, setStudentPaymentLoading] = useState<boolean>(false);

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

  // const handleOpenOtherDialog = (): void => setOpenOtherDialog(true);
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
  // const handleOpenCategoryDialog = (): void => setOpenCategoryDialog(true);
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
      if (studentPaymentStatus !== 'all') filters.status = studentPaymentStatus;
      if (studentPeriodType === 'month') {
        filters.month = studentSelectedMonth;
        filters.year = studentSelectedYear;
      } else if (studentPeriodType === 'quarter') {
        const { startMonth, endMonth } = getQuarterMonths(studentSelectedQuarter);
        filters.startMonth = startMonth;
        filters.endMonth = endMonth;
        filters.year = studentSelectedYear;
      } else if (studentPeriodType === 'year') {
        filters.year = studentSelectedYear;
      } else if (studentPeriodType === 'custom') {
        const year = new Date(studentCustomStart).getFullYear();
        const startMonth = new Date(studentCustomStart).getMonth() + 1;
        const endMonth = new Date(studentCustomEnd).getMonth() + 1;
        filters.startMonth = startMonth;
        filters.endMonth = endMonth;
        filters.year = year;
      }

      // Add filters to params if not empty
      if (Object.keys(filters).length > 0) {
        params.filters = JSON.stringify(filters);
      }

      const res = await getAllPaymentsAPI(params);

      // Parse the API response structure
      const responseData = res?.data?.data || res?.data || {};
      const data = responseData;


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
      if (teacherPaymentStatus !== 'all') params = { ...params, status: teacherPaymentStatus };
      if (teacherPeriodType === 'month') params = { ...params, year: teacherSelectedYear, month: teacherSelectedMonth };
      else if (teacherPeriodType === 'quarter') {
        const { startMonth, endMonth } = getQuarterMonths(teacherSelectedQuarter);
        params = { ...params, year: teacherSelectedYear, startMonth, endMonth };
      } else if (teacherPeriodType === 'year') params = { ...params, year: teacherSelectedYear };
      else if (teacherPeriodType === 'custom') {
        const year = new Date(teacherCustomStart).getFullYear();
        const startMonth = new Date(teacherCustomStart).getMonth() + 1;
        const endMonth = new Date(teacherCustomEnd).getMonth() + 1;
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
    setTeacherPagination(prev => ({ ...prev, page: 1 }));
  }, [teacherPeriodType, teacherSelectedYear, teacherSelectedMonth, teacherSelectedQuarter, teacherCustomStart, teacherCustomEnd, teacherPaymentStatus]);

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
  }, [tab, studentPeriodType, studentSelectedYear, studentSelectedMonth, studentSelectedQuarter, studentCustomStart, studentCustomEnd, studentPaymentStatus]);

  useEffect(() => {
    if (tab === 1) {
      fetchStudentPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [studentPeriodType, studentSelectedYear, studentSelectedMonth, studentSelectedQuarter, studentCustomStart, studentCustomEnd, studentPaymentStatus]);

  // Update total statistics when student payments change
  useEffect(() => {
    fetchTotalStatistics();
  }, [studentPayments, teacherPayments]);

  useEffect(() => {
    // Temporarily skip fetching teacher totals from API
        setFixedTotalTeacherSalary(0);
  }, []);

  useEffect(() => {
    if (studentPaymentStatus !== 'all') {
      fetchStudentPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [studentPaymentStatus]);

  useEffect(() => {
    if (teacherPaymentStatus !== 'all') {
      fetchTeacherPayments(1);
      setTeacherPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [teacherPaymentStatus]);

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

  // Student payment dialog handlers
  const handleOpenStudentPaymentDialog = (payment: StudentPayment): void => {
    const remainingAmount = (payment.totalAmount || 0) - (payment.discountAmount || 0) - (payment.paidAmount || 0);
    setSelectedStudentPayment(payment);
    setStudentPaymentForm({
      amount: remainingAmount.toString(),
      method: 'cash',
      note: ''
    });
    setOpenStudentPaymentDialog(true);
  };

  const handleCloseStudentPaymentDialog = (): void => {
    setOpenStudentPaymentDialog(false);
    setSelectedStudentPayment(null);
    setStudentPaymentForm({ amount: '', method: 'cash', note: '' });
  };

  const handleChangeStudentPaymentField = (key: 'amount' | 'method' | 'note', value: string) => {
    setStudentPaymentForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitStudentPayment = async (): Promise<void> => {
    if (!selectedStudentPayment || !studentPaymentForm.amount) return;

    setStudentPaymentLoading(true);
    try {
      await payStudentAPI(selectedStudentPayment.id, {
        amount: Number(studentPaymentForm.amount),
        method: studentPaymentForm.method,
        note: studentPaymentForm.note
      });

      setSnackbar({ open: true, message: 'Thanh toán thành công', severity: 'success' });
      handleCloseStudentPaymentDialog();

      // Refresh student payments data
      await fetchStudentPayments(studentPagination.page);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Thanh toán thất bại', severity: 'error' });
    } finally {
      setStudentPaymentLoading(false);
    }
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

      {/* Tabs bảng chi tiết (moved above filters); Filters are now inside each tab */}

      {/* Tabs bảng chi tiết */}
      <Paper sx={{ mb: 3, boxShadow: 'none' }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); if (v === 2) fetchOtherTransactions(1); }}>
          <Tab label="Chi tiết giáo viên" />
          <Tab label="Chi tiết học sinh" />
          <Tab label="Thu chi khác" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <TeacherPaymentsTab
              payments={teacherPayments as any}
              pagination={{ page: teacherPagination.page, totalPages: teacherPagination.totalPages }}
              onPageChange={(p) => handleTeacherPageChange({} as any, p)}
              periodType={teacherPeriodType}
              setPeriodType={setTeacherPeriodType}
              selectedYear={teacherSelectedYear}
              setSelectedYear={setTeacherSelectedYear}
              selectedMonth={teacherSelectedMonth}
              setSelectedMonth={setTeacherSelectedMonth}
              selectedQuarter={teacherSelectedQuarter}
              setSelectedQuarter={setTeacherSelectedQuarter}
              customStart={teacherCustomStart}
              setCustomStart={setTeacherCustomStart}
              customEnd={teacherCustomEnd}
              setCustomEnd={setTeacherCustomEnd}
              paymentStatus={teacherPaymentStatus}
              setPaymentStatus={setTeacherPaymentStatus}
              years={years}
              months={months}
              quarters={quarters}
              onOpenHistory={handleOpenPaymentHistory}
            />
          )}
          {tab === 1 && (
            <StudentPaymentsTab
              payments={studentPayments as any}
              pagination={{ page: studentPagination.page, totalPages: studentPagination.totalPages }}
              onPageChange={(p) => handleStudentPageChange({} as any, p)}
              periodType={studentPeriodType}
              setPeriodType={setStudentPeriodType}
              selectedYear={studentSelectedYear}
              setSelectedYear={setStudentSelectedYear}
              selectedMonth={studentSelectedMonth}
              setSelectedMonth={setStudentSelectedMonth}
              selectedQuarter={studentSelectedQuarter}
              setSelectedQuarter={setStudentSelectedQuarter}
              customStart={studentCustomStart}
              setCustomStart={setStudentCustomStart}
              customEnd={studentCustomEnd}
              setCustomEnd={setStudentCustomEnd}
              paymentStatus={studentPaymentStatus}
              setPaymentStatus={setStudentPaymentStatus}
              years={years}
              months={months}
              quarters={quarters}
              onOpenHistory={handleOpenPaymentHistory}
              onOpenPayDialog={handleOpenStudentPaymentDialog}
            />
          )}
          {tab === 2 && (
            <OtherTransactionsTab
              transactions={otherTransactions as any}
              pagination={{ page: otherPage, totalPages: otherTotalPages }}
              onPageChange={(p) => fetchOtherTransactions(p)}
              customStart={otherCustomStart}
              setCustomStart={setOtherCustomStart}
              customEnd={otherCustomEnd}
              setCustomEnd={setOtherCustomEnd}
              onOpenCategory={handleOpenCategoryManagementDialog}
              onOpenTransaction={handleOpenTransactionDialog}
              onEdit={(t) => handleEditTransaction(t as any)}
              onDelete={(t) => handleDeleteTransaction(t as any)}
            />
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
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          px: 4
        }}>
            <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                Quản lý danh mục
              </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Quản lý các danh mục thu chi của hệ thống
              </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {categoriesLoading ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8
            }}>
              <CircularProgress size={60} sx={{ color: '#667eea', mb: 3 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Đang tải danh mục...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng chờ trong giây lát
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 4 }}>
              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {Array.isArray(categories) ? categories.length : 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tổng số danh mục
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {Array.isArray(categories) ? categories.filter(c => c.type === 'revenue').length : 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Danh mục thu
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {Array.isArray(categories) ? categories.filter(c => c.type === 'expense').length : 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Danh mục chi
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {Array.isArray(categories) ? Math.round((categories.length / 10) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tỷ lệ sử dụng
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Categories Table */}
              <Paper sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="#1e293b">
                      Danh sách danh mục
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quản lý và chỉnh sửa các danh mục thu chi
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleOpenCreateCategoryFromManagement}
              sx={{
                      borderRadius: 3,
                      bgcolor: '#667eea',
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#5a6fd8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    startIcon={<AddIcon />}
                  >
                    Tạo danh mục
                  </Button>
                </Box>
                <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Tên danh mục</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Loại</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category, ) => (
                      <TableRow
                        key={category.id}
                        hover
                        sx={{
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              },
                              '&:nth-of-type(even)': { bgcolor: '#fafbfc' },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#e2e8f0',
                                color: '#475569',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                          #{category.id}
                              </Box>
                        </TableCell>
                        <TableCell>
                              <Typography variant="body1" fontWeight={600} color="#1e293b">
                            {category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={category.type === 'revenue' ? 'Thu' : 'Chi'}
                            color={category.type === 'revenue' ? 'success' : 'error'}
                                size="medium"
                            sx={{
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  '& .MuiChip-label': { px: 2 },
                                  boxShadow: category.type === 'revenue'
                                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                                    : '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                                <Tooltip title="Chỉnh sửa danh mục" arrow>
                                                        <IconButton
                                    size="medium"
                              color="primary"
                              onClick={() => handleEditCategory(category)}
                              sx={{
                                bgcolor: '#dbeafe',
                                      borderRadius: 2,
                                      '&:hover': {
                                        bgcolor: '#bfdbfe',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                      },
                                      '& .MuiSvgIcon-root': { fontSize: 20 },
                                      transition: 'all 0.2s ease'
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa danh mục" arrow>
                                                        <IconButton
                                    size="medium"
                              color="error"
                              onClick={() => handleDeleteCategory(category)}
                              sx={{
                                bgcolor: '#fee2e2',
                                      borderRadius: 2,
                                      '&:hover': {
                                        bgcolor: '#fecaca',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                      },
                                      '& .MuiSvgIcon-root': { fontSize: 20 },
                                      transition: 'all 0.2s ease'
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                                </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3
                              }}>
                                <AddIcon sx={{ fontSize: 40, color: '#64748b' }} />
                              </Box>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                                Chưa có danh mục nào
                          </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                                Hãy tạo danh mục đầu tiên để bắt đầu quản lý thu chi
                          </Typography>
                              <Button
                                variant="contained"
                                onClick={handleOpenCreateCategoryFromManagement}
                                sx={{
                                  borderRadius: 3,
                                  bgcolor: '#667eea',
                                  px: 4,
                                  py: 1.5,
                                  fontWeight: 600,
                                  '&:hover': { bgcolor: '#5a6fd8' }
                                }}
                                startIcon={<AddIcon />}
                              >
                                Tạo danh mục đầu tiên
                              </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: 4,
          bgcolor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" color="text.secondary">
            Tổng cộng: {Array.isArray(categories) ? categories.length : 0} danh mục
          </Typography>
          <Button
            onClick={handleCloseCategoryManagementDialog}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              bgcolor: '#64748b',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#475569',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
              },
              transition: 'all 0.2s ease'
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
      <FormDialog
        open={openEditCategoryDialog}
        onClose={handleCloseEditCategoryDialog}
        title="Chỉnh sửa danh mục"
        subtitle="Cập nhật thông tin danh mục"
        onSubmit={handleSubmitEditCategory}
        loading={editCategoryLoading}
        submitText="Cập nhật"
        cancelText="Hủy"
        maxWidth="sm"
      >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Loại"
                value={editCategoryForm.type}
                onChange={(e) => handleChangeEditCategoryField('type', e.target.value)}
                required
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
              />
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

      {/* Student Payment Dialog */}
      <Dialog
        open={openStudentPaymentDialog}
        onClose={handleCloseStudentPaymentDialog}
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
            {selectedStudentPayment?.student?.name} - {selectedStudentPayment?.class?.name}
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
                      {(selectedStudentPayment?.totalAmount || 0).toLocaleString()} ₫
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Giảm giá:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedStudentPayment?.discountAmount || 0).toLocaleString()} ₫
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Đã thanh toán:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      {(selectedStudentPayment?.paidAmount || 0).toLocaleString()} ₫
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Còn thiếu:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} color="error.main">
                      {((selectedStudentPayment?.totalAmount || 0) - (selectedStudentPayment?.discountAmount || 0) - (selectedStudentPayment?.paidAmount || 0)).toLocaleString()} ₫
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
                value={studentPaymentForm.amount}
                onChange={(e) => handleChangeStudentPaymentField('amount', e.target.value)}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Phương thức thanh toán"
                value={studentPaymentForm.method}
                onChange={(e) => handleChangeStudentPaymentField('method', e.target.value)}
              >
                <MenuItem value="cash">Tiền mặt</MenuItem>
                <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                <MenuItem value="card">Thẻ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi chú"
                fullWidth
                multiline
                minRows={2}
                value={studentPaymentForm.note}
                onChange={(e) => handleChangeStudentPaymentField('note', e.target.value)}
                placeholder="Ghi chú về khoản thanh toán (tùy chọn)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button
            onClick={handleCloseStudentPaymentDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitStudentPayment}
            variant="contained"
            disabled={!studentPaymentForm.amount || studentPaymentLoading}
            sx={{
              borderRadius: 2,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              px: 3
            }}
          >
            {studentPaymentLoading ? <CircularProgress size={20} /> : 'Thanh toán'}
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
