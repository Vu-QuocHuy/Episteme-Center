import React from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Pagination, Typography, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: { id: number; name: string; type: 'revenue' | 'expense' };
  transaction_at: string;
}

interface Props {
  transactions: Transaction[];
  pagination: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
  onOpenCategory: () => void;
  onOpenTransaction: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

const OtherTransactionsTab: React.FC<Props> = ({
  transactions,
  pagination,
  onPageChange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  onOpenCategory,
  onOpenTransaction,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Từ ngày" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
        <TextField label="Đến ngày" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onOpenCategory} sx={{ borderRadius: 2 }}>Quản lý danh mục</Button>
          <Button variant="outlined" onClick={onOpenTransaction} sx={{ borderRadius: 2 }}>Tạo hóa đơn</Button>
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
                <TableCell><Typography variant="body2" color="text.secondary">{t.transaction_at ? new Date(t.transaction_at).toLocaleDateString('vi-VN') : '-'}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={600} color={t.category?.type === 'revenue' ? 'success.main' : 'error.main'}>{t.amount ? t.amount.toLocaleString() : '0'} ₫</Typography></TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Chỉnh sửa"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => onEdit(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => onDelete(t)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
    </>
  );
};

export default OtherTransactionsTab;
