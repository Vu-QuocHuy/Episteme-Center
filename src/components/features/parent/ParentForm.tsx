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
  Paper,
  Autocomplete,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Parent, Student } from '../../../types';
import { useParentForm } from '../../../hooks/features/useParentForm';
import { getAllStudentsAPI } from '../../../services/api';

interface ParentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (parentData: Partial<Parent>) => Promise<void>;
  parent?: Parent | null;
  loading?: boolean;
}
const ParentForm: React.FC<ParentFormProps> = ({ open, onClose, onSubmit, parent, loading = false }) => {
  const {
    form,
    formErrors,
    formLoading,
    handleChange,
    setFormData,
    resetForm,
    handleSubmit,
    handleAddChild,
    handleRemoveChild,
  } = useParentForm();

  const [tab, setTab] = useState<number>(0);
  const [childrenList, setChildrenList] = useState<Student[]>([]);
  const [studentQuery, setStudentQuery] = useState<string>('');
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const busy = loading || formLoading;

  // Debounce search query
  const debouncedStudentQuery = useDebounce(studentQuery, 500);

  useEffect(() => {
    if (parent && open) {
      setFormData(parent as any);
      setChildrenList((parent as any)?.students || []);
    } else if (!open) {
      resetForm();
      setChildrenList([]);
    }
  }, [parent, open, setFormData, resetForm]);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      if (!debouncedStudentQuery || debouncedStudentQuery.length < 2) {
        setStudentOptions([]);
        return;
      }
      try {
        const res = await getAllStudentsAPI({ name: debouncedStudentQuery, limit: 10 });
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
    const result = await handleSubmit(parent || null, () => {});
    if (result.success) {
      onClose();
    }
  };

  const addChild = async () => {
    if (!parent?.id || !selectedStudent?.id) return;
    const result = await handleAddChild(String(selectedStudent.id), String(parent.id));
    if (result.success) {
      setChildrenList(prev => {
        const exists = prev.some((s: any) => s.id === selectedStudent.id);
        return exists ? prev : [...prev, selectedStudent as any];
      });
      setSelectedStudent(null);
      setStudentQuery('');
    }
  };

  const removeChild = async (studentId: string) => {
    if (!parent?.id) return;
    const result = await handleRemoveChild(String(studentId), String(parent.id));
    if (result.success) {
      setChildrenList(prev => prev.filter((s: any) => String(s.id) !== String(studentId)));
    }
  };

  const handleClose = () => {
    resetForm();
    setChildrenList([]);
    setSelectedStudent(null);
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
            Cập nhật thông tin phụ huynh
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EditIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 4, pt: 2 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Thông tin cơ bản" />
            <Tab label="Quản lý con cái" />
          </Tabs>
          </Box>

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
                    <TextField fullWidth label="Họ và tên" name="name" value={form.name} onChange={handleChange} required error={!!formErrors.name} helperText={formErrors.name} />
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required error={!!formErrors.email} helperText={formErrors.email} />
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

        {tab === 1 && (
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
                    Danh sách con hiện tại
                  </Typography>
                  {childrenList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                  <Autocomplete
                    options={studentOptions}
                    getOptionLabel={(o: any) => o?.name || ''}
                    value={selectedStudent}
                    onChange={(_e, v) => setSelectedStudent(v)}
                    onInputChange={(_e, v) => setStudentQuery(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm kiếm học sinh"
                        fullWidth
                        sx={{
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
                    )}
                    renderOption={(props, option: any) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    sx={{
                      '& .MuiAutocomplete-paper': {
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
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
          onClick={tab === 1 ? handleClose : submit}
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
          {tab === 1 ? 'Đóng' : (busy ? 'Đang lưu...' : 'Cập nhật')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParentForm;
