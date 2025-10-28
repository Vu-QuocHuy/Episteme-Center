import React, { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '../../../hooks/common/useDebounce';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Checkbox,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Parent, Student } from '../../../types';
import { useParentForm } from '../../../hooks/features/useParentForm';
import { getParentByIdAPI, getParentChildrenAPI } from '../../../services/parents';
import { getAllStudentsAPI } from '../../../services/students';

interface ParentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  parent?: Parent | null;
  loading?: boolean;
  onMessage?: (message: string, type: 'success' | 'error') => void;
}
const ParentForm: React.FC<ParentFormProps> = ({ open, onClose, onSubmit, parent, loading = false, onMessage }) => {
  const {
    form,
    formLoading,
    handleChange,
    setFormData,
    resetForm,
    handleAddChild,
    handleRemoveChild,
  } = useParentForm();

  const [tab, setTab] = useState<number>(0);
  const [childrenList, setChildrenList] = useState<Student[]>([]);
  const [studentQuery, setStudentQuery] = useState<string>('');
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const busy = loading || formLoading;

  // Debounce search query
  const debouncedStudentQuery = useDebounce(studentQuery, 500);

  useEffect(() => {
    if (parent && open) {
      setFormData(parent as any);
      // Không reset tab khi đã mở dialog
    } else if (!open) {
      resetForm();
      setChildrenList([]);
      setTab(0); // Reset về tab đầu tiên khi đóng dialog
    } else if (!parent && open) {
      // Khi mở dialog thêm mới
      setTab(0); // Chỉ hiển thị tab thông tin cơ bản
    }
  }, [parent, open, setFormData, resetForm]);

  // Helper: refresh children list from API
  const refreshChildrenList = React.useCallback(async () => {
    if (!parent?.id) return;
    try {
      const res = await getParentChildrenAPI(parent.id);
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.students)
          ? (payload as any).students
          : [];
      setChildrenList(list);
      setRefreshKey(prev => prev + 1);
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('getParentChildrenAPI failed, fallback to getParentByIdAPI', e);
    }
    try {
      const response = await getParentByIdAPI(parent.id);
      const payload = (response as any)?.data?.data ?? (response as any)?.data ?? response;
      const list = Array.isArray((payload as any)?.students) ? (payload as any).students : [];
      setChildrenList(list);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error refreshing children list (fallback):', error);
    }
  }, [parent?.id]);

  // Refresh when entering Manage Children tab
  useEffect(() => {
    if (open && parent?.id && tab === 1) {
      refreshChildrenList();
    }
  }, [open, parent?.id, tab, refreshChildrenList]);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      if (!debouncedStudentQuery || debouncedStudentQuery.length < 2) {
        setStudentOptions([]);
        return;
      }
      try {
        const res = await getAllStudentsAPI({ name: debouncedStudentQuery, limit: 10, page: 1 });
        const data = (res as any)?.data?.data?.result || (res as any)?.data || [];
        if (active) setStudentOptions(data);
      } catch {
        if (active) setStudentOptions([]);
      }
    };
    fetch();
    return () => { active = false; };
  }, [debouncedStudentQuery]);

  const toDisplayDate = useMemo(() => (val?: string) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return val;
    }
  }, []);

  const submit = async () => {
    await onSubmit();
  };

  const addChildFromSearch = async (student: any) => {
    if (!parent?.id || !student?.id) return;
    const result = await handleAddChild(String(student.id), String(parent.id));
    if (result.success) {
      // Cập nhật danh sách con ngay lập tức
      setChildrenList(prev => {
        const exists = prev.some((s: any) => String(s.id) === String(student.id));
        return exists ? prev : [...prev, student as any];
      });

      // Hiển thị thông báo thành công
      if (onMessage) {
        onMessage(result.message, 'success');
      }

      // Refresh lại danh sách con từ API để đảm bảo đồng bộ
      await refreshChildrenList();
    } else {
      // Hiển thị thông báo lỗi
      if (onMessage) {
        onMessage(result.message, 'error');
      }
    }
  };

  const removeChild = async (studentId: string) => {
    if (!parent?.id) return;

    const result = await handleRemoveChild(String(studentId), String(parent.id));

    if (result.success) {
      // Cập nhật danh sách con ngay lập tức
      const updatedList = childrenList.filter((s: any) => String(s.id) !== String(studentId));
      setChildrenList(updatedList);

      // Hiển thị thông báo thành công
      if (onMessage) {
        onMessage(result.message, 'success');
      }

      // Refresh lại danh sách con từ API để đảm bảo đồng bộ
      await refreshChildrenList();
    } else {
      // Hiển thị thông báo lỗi
      if (onMessage) {
        onMessage(result.message, 'error');
      }
    }
  };

  const handleClose = () => {
    resetForm();
    setChildrenList([]);
    setStudentOptions([]);
    setStudentQuery('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {parent ? 'Chỉnh sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {parent ? 'Cập nhật thông tin phụ huynh và quản lý con cái' : 'Nhập thông tin cơ bản của phụ huynh mới'}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EditIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {parent && (
          <Box sx={{ px: 4, pt: 2 }}>
            <Tabs value={tab} onChange={(_e, v) => {
              setTab(v);
            }} sx={{ mb: 2 }}>
              <Tab label="Thông tin cơ bản" />
              <Tab label="Quản lý con cái" />
            </Tabs>
          </Box>
        )}

        {/* Tab thông tin cơ bản - hiển thị cho cả thêm mới và chỉnh sửa */}
        {tab === 0 && (
          <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                Thông tin cơ bản
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Họ và tên" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Ngày sinh" name="dayOfBirth" type="date" value={toDisplayDate(form.dayOfBirth)} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                      <InputLabel>Giới tính</InputLabel>
                      <Select name="gender" label="Giới tính" value={form.gender} onChange={(e: any) => handleChange(e as any)}>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Địa chỉ" name="address" value={form.address} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox checked={!!form.canSeeTeacherInfo} onChange={(e) => handleChange({ target: { name: 'canSeeTeacherInfo', value: e.target.checked, type: 'checkbox', checked: e.target.checked } } as any)} />
                      <Typography>Quyền xem thông tin giáo viên</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
            </Paper>
          </Box>
        )}

        {/* Tab quản lý con cái - chỉ hiển thị khi chỉnh sửa */}
        {tab === 1 && parent && (
          <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                Quản lý con cái
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

                {/* Danh sách con hiện tại */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Danh sách con hiện tại ({childrenList.length} con)
                  </Typography>
                  {(() => { return null; })()}
                  {childrenList.length > 0 ? (
                    <Box key={refreshKey} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {childrenList.map((child: any) => (
                        <Box
                          key={child.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #e0e6ed',
                            bgcolor: '#f8f9fa',
                            '&:hover': {
                              bgcolor: '#f1f3f4'
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {child.name}
                          </Typography>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeChild(String(child.id))}
                            sx={{
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              borderColor: '#dc3545',
                              color: '#dc3545',
                              '&:hover': {
                                bgcolor: '#dc3545',
                                color: 'white'
                              }
                            }}
                          >
                            Xóa
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px dashed #e0e6ed',
                        bgcolor: '#f8f9fa',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Chưa có con nào được thêm
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Thêm con mới */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Thêm con mới
                  </Typography>

                  {/* Ô tìm kiếm */}
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm học sinh"
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea'
                        }
                      }
                    }}
                  />

                  {/* Kết quả tìm kiếm */}
                  {studentQuery && studentQuery.length >= 2 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#2c3e50' }}>
                        Kết quả tìm kiếm:
                      </Typography>
                      {studentOptions.length > 0 ? (
                        <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e6ed', borderRadius: 2 }}>
                          {studentOptions.map((student: any) => {
                            // Kiểm tra xem học sinh đã được thêm chưa
                            const isAlreadyAdded = childrenList.some((child: any) => child.id === student.id);

                            return (
                              <Box
                                key={student.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 2,
                                  borderBottom: '1px solid #e0e6ed',
                                  '&:last-child': {
                                    borderBottom: 'none'
                                  },
                                  '&:hover': {
                                    bgcolor: '#f8f9fa'
                                  }
                                }}
                              >
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    {student.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {student.email}
                                  </Typography>
                                </Box>
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={isAlreadyAdded}
                                  onClick={() => addChildFromSearch(student)}
                                  sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    py: 0.5,
                                    bgcolor: isAlreadyAdded ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: isAlreadyAdded ? '#6c757d' : '#0056b3'
                                    }
                                  }}
                                >
                                  {isAlreadyAdded ? 'Đã thêm' : 'Thêm'}
                                </Button>
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px dashed #e0e6ed',
                            bgcolor: '#f8f9fa',
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy học sinh nào
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              bgcolor: '#667eea',
              color: 'white'
            }
          }}
          disabled={busy}
        >
          Hủy
        </Button>
        <Button
          onClick={parent && tab === 1 ? handleClose : submit}
          variant="contained"
          startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={busy}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            bgcolor: '#667eea',
            '&:hover': {
              bgcolor: '#5a6fd8'
            }
          }}
        >
          {parent && tab === 1 ? 'Đóng' : (busy ? 'Đang lưu...' : (parent ? 'Cập nhật' : 'Thêm mới'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParentForm;
