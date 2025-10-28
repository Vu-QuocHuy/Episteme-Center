import React, { useEffect, useState } from 'react';
import { Box, Stack, Pagination, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getAuditLogsAPI } from '../../services/audit';
import type { AuditLogItem } from '../../services/audit';
import { commonStyles } from '../../utils/styles';

// Parse HTML description to extract action, actor, and content (keep list structure)
const parseDescription = (html: string): { action: string; actor: string; contentHtml: string } => {
  try {
    const container = document.createElement('div');
    container.innerHTML = html || '';

    // Extract content list HTML (preserve <li> formatting). If not available, fallback to line breaks
    const items = Array.from(container.querySelectorAll('ul li')) as HTMLLIElement[];
    const ulEl = container.querySelector('ul');
    const contentHtml = ulEl
      ? ulEl.innerHTML
      : items.map(li => (li.textContent?.trim() || '')).filter(Boolean).map(t => `<div>${t}</div>`).join('');

    // Remove the list to get only the header text
    if (ulEl && ulEl.parentElement) {
      ulEl.parentElement.removeChild(ulEl);
    }

    let header = (container.textContent || '').trim();
    // Normalize spaces
    header = header.replace(/\s+/g, ' ');
    // Drop trailing colon
    header = header.replace(/:$/, '').trim();

    // Split by 'bởi' to separate action and actor (Vietnamese 'by')
    const parts = header.split(' bởi ');
    const action = (parts[0] || '').trim();
    const actor = (parts[1] || '').trim();

    return { action, actor, contentHtml };
  } catch (e) {
    return { action: '', actor: '', contentHtml: '' };
  }
};

// Only render description per requirements

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (iso?: string): string => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('vi-VN', { hour12: false });
    } catch {
      return iso;
    }
  };

  const fetchLogs = async (pageNum = page, pageLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditLogsAPI({ page: pageNum, limit: pageLimit });
      const data = res.data?.data;
      setLogs(data?.result || []);
      setTotalPages(data?.meta?.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Không thể tải audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        {/* Simplified header intentionally omitted */}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ color: 'error.main' }}>{error}</Box>
        ) : logs.length === 0 ? (
          <Box sx={{ color: 'text.secondary' }}>Không có log nào</Box>
        ) : (
          <Box sx={commonStyles.contentContainer}>
            <Stack spacing={2}>
            <TableContainer component={Paper} variant="outlined" sx={commonStyles.tableContainer}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="20%">Hành động</TableCell>
                    <TableCell width="25%">Người thực hiện</TableCell>
                    <TableCell width="15%">Thời gian</TableCell>
                    <TableCell width="35%">Nội dung</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => {
                    const parsed = parseDescription(log.description || '');
                    return (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ textTransform: 'none', fontWeight: 600, width: '25%' }}>
                          {parsed.action || log.action || log.method}
                        </TableCell>
                        <TableCell sx={{ width: '20%' }}>
                          {parsed.actor || (log.user ? `${log.user.name}${log.user.email ? ` - ${log.user.email}` : ''}` : '')}
                        </TableCell>
                        <TableCell sx={{ width: '15%', whiteSpace: 'nowrap' }}>
                          {formatDateTime((log as any).createdAt)}
                        </TableCell>
                        <TableCell sx={{ width: '35%' }}>
                          {parsed.contentHtml ? (
                            <Box
                              sx={{ '& ul': { pl: 3 }, '& li': { mb: 0.5 } }}
                              dangerouslySetInnerHTML={{ __html: `<ul style=\"margin: 8px 0; padding-left: 20px;\">${parsed.contentHtml}</ul>` }}
                            />
                          ) : (
                            <Box
                              sx={{ '& ul': { pl: 3 }, '& li': { mb: 0.5 } }}
                              dangerouslySetInnerHTML={{ __html: log.description || '' }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_e, value) => {
                    setPage(value);
                    fetchLogs(value, limit);
                  }}
                />
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AuditLog;
