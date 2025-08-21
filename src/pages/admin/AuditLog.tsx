import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  Pagination,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getAuditLogsAPI, AuditLogItem } from '../../services/api';

const methodColor: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  GET: 'info',
  POST: 'success',
  PATCH: 'warning',
  PUT: 'warning',
  DELETE: 'error',
};

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Danh sách hoạt động của hệ thống (Admin & hệ thống backend)
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : logs.length === 0 ? (
          <Typography color="text.secondary">Không có log nào</Typography>
        ) : (
          <Stack spacing={2}>
            {logs.map((log) => (
              <Card key={log.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label={log.method} color={methodColor[log.method] || 'default'} />
                    <Typography variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
                      {log.path}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Entity: <strong>{log.entity}</strong>
                    {log.entityId ? (
                      <>
                        {' '}• ID: <span style={{ fontFamily: 'monospace' }}>{log.entityId}</span>
                      </>
                    ) : null}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Người thực hiện: <strong>{log.user?.name}</strong> ({log.user?.email})
                  </Typography>

                  {log.changes?.length ? (
                    <Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Thay đổi</Typography>
                      <Stack spacing={0.75}>
                        {log.changes.map((chg, idx) => (
                          <Typography key={idx} variant="body2">
                            - <strong>{chg.fieldName}</strong>: {String(chg.oldValue)} → {String(chg.newValue)}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}
                </CardContent>
              </Card>
            ))}

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
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AuditLog;


