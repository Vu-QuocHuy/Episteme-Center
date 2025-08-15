import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Autocomplete,
  TextField,
  Alert,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Parent, Student } from '../../../types';
import { addChildToParentAPI, removeChildFromParentAPI } from '../../../services/api';

interface ParentChildrenManagerProps {
  parent: Parent | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  searchStudents: (query: string) => Promise<Student[]>;
}

const ParentChildrenManager: React.FC<ParentChildrenManagerProps> = ({
  parent,
  open,
  onClose,
  onUpdate,
  searchStudents
}) => {
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const timeoutId = setTimeout(async () => {
        try {
          const students = await searchStudents(searchQuery);
          setStudentOptions(students);
        } catch (error) {
          console.error('Error searching students:', error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setStudentOptions([]);
    }
  }, [searchQuery, searchStudents]);

  const handleAddChild = async () => {
    if (!selectedStudent || !parent) return;

    setLoading(true);
    try {
      await addChildToParentAPI(selectedStudent.id, parent.id);
      setAlert({
        open: true,
        message: `Đã thêm ${selectedStudent.name || selectedStudent.userId?.name} vào danh sách con của phụ huynh ${parent.name}`,

        severity: 'success'
      });
      setSelectedStudent(null);
      setSearchQuery('');
      onUpdate();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi thêm con',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveChild = async (student: Student) => {
    if (!parent) return;

    setLoading(true);
    try {
      await removeChildFromParentAPI(student.id, parent.id);
      setAlert({
        open: true,
        message: `Đã xóa ${student.name || student.userId?.name} khỏi danh sách con của phụ huynh ${parent.name}`,
        severity: 'success'
      });
      onUpdate();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa con',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setStudentOptions([]);
    setAlert({ ...alert, open: false });
    onClose();
  };

  if (!parent) return null;

  const children = parent.students || parent.children || [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PersonIcon />
          <Typography variant="h6">
            Quản lý con cái của {parent.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {alert.open && (
          <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert({ ...alert, open: false })}>
            {alert.message}
          </Alert>
        )}

        {/* Add Child Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Thêm con
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Autocomplete
              options={studentOptions}
              getOptionLabel={(option) => `${option.name || option.userId?.name} (${option.email || option.userId?.email})`}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
              inputValue={searchQuery}
              onInputChange={(_, newInputValue) => setSearchQuery(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tìm kiếm học sinh"
                  placeholder="Nhập tên hoặc email học sinh..."
                  variant="outlined"
                  size="small"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar
                    src={option.avatar || option.userId?.avatar}
                    sx={{ width: 32, height: 32, mr: 2 }}
                  >
                    {(option.name || option.userId?.name || '').charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {option.name || option.userId?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email || option.userId?.email}
                    </Typography>
                  </Box>
                </Box>
              )}
              loading={loading}
              sx={{ flex: 1 }}
              noOptionsText="Không tìm thấy học sinh"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddChild}
              disabled={!selectedStudent || loading}
            >
              Thêm
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current Children List */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Danh sách con hiện tại ({children.length})
          </Typography>

          {children.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">
                Chưa có con nào được liên kết
              </Typography>
            </Box>
          ) : (
            <List>
              {children.map((child, index) => (
                <ListItem key={child.id || index} divider>
                  <Avatar
                    src={child.avatar || child.userId?.avatar}
                    sx={{ mr: 2 }}
                  >
                    {(child.name || child.userId?.name || '').charAt(0)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {child.name || child.userId?.name}
                        </Typography>
                        <Chip
                          label={child.isActive ? 'Đang học' : 'Đã nghỉ'}
                          color={child.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email: {child.email || child.userId?.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SĐT: {child.phone || child.userId?.phone}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveChild(child)}
                      disabled={loading}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParentChildrenManager;
