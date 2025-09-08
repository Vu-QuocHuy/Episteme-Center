import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, Chip } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { getAllRegistrationsAPI } from '../../services/api';
// Removed reload icon per request

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
  const [search, setSearch] = useState<string>('');
  const fetchData = async () => {
    try {
      const res = await getAllRegistrationsAPI({ page: 1, limit: 50 });
      const list = res.data?.data?.result || res.data?.data || [];
      setRows(list);
    } catch (error) {
      console.error('Error fetching registrations:', error);
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>Quản lý đăng ký tư vấn</Typography>
          </Box>

          {/* Filter area - styled like student management */}
          <Paper sx={{ px: 2, py: 2, mb: 2, borderRadius: 2, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                placeholder="Tìm theo tên, email, SĐT, địa chỉ"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': { height: 48, fontSize: 16 },
                  '& input::placeholder': { opacity: 0.7 }
                }}
              />
            </Box>
          </Paper>

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
