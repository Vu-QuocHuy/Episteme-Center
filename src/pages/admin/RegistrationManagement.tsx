import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, IconButton, Chip } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { getAllRegistrationsAPI } from '../../services/api';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RegistrationItem {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  processed?: boolean;
  createdAt?: string;
}

const RegistrationManagement: React.FC = () => {
  const [rows, setRows] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllRegistrationsAPI({ page: 1, limit: 50 });
      const list = res.data?.data?.result || res.data?.data || [];
      setRows(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r.address || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>Quản lý đăng ký tư vấn</Typography>
            <IconButton onClick={fetchData} disabled={loading}><RefreshIcon /></IconButton>
          </Box>

          {/* Search box centered below the title */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <TextField
              size="small"
              placeholder="Tìm theo tên, email, SĐT, địa chỉ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>

          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Địa chỉ</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email || '-'}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>{r.address || '-'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.processed ? 'Đã xử lý' : 'Chưa xử lý'} color={r.processed ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default RegistrationManagement;
