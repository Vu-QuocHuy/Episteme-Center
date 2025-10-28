import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../../hooks/common/useDebounce';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Radio,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getAllTeachersAPI } from '../../../services/teachers';

interface AddTeacherToClassDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTeacher: (teacherId: string) => Promise<void>;
  loading?: boolean;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specializations?: string[];
}

const AddTeacherToClassDialog: React.FC<AddTeacherToClassDialogProps> = ({
  open,
  onClose,
  onAddTeacher,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!open) return;

      setLoadingTeachers(true);
      try {
        const response = await getAllTeachersAPI({ page: 1, limit: 1000 });
        const teachers = response?.data?.data?.result || response?.data || [];
        setAllTeachers(teachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setAllTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [open]);

  // Filter teachers based on debounced search query
  const filteredTeachers = allTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacher(teacherId);
  };

  const handleAddTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      await onAddTeacher(selectedTeacher);
      // Reset form
      setSelectedTeacher('');
      onClose();
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  const handleClose = () => {
    setSelectedTeacher('');
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Thêm giáo viên vào lớp</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm giáo viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {loadingTeachers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {filteredTeachers.map((teacher) => (
                  <ListItem key={teacher.id} dense>
                    <Radio
                      edge="start"
                      checked={selectedTeacher === teacher.id}
                      onChange={() => handleTeacherSelect(teacher.id)}
                    />
                    <ListItemText
                      primary={teacher.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">{teacher.email}</Typography>
                          {teacher.phone && (
                            <Typography variant="body2" color="text.secondary">
                              {teacher.phone}
                            </Typography>
                          )}
                          {teacher.specializations && teacher.specializations.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Chuyên môn: {teacher.specializations.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {filteredTeachers.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Không tìm thấy giáo viên nào"
                      secondary="Thử tìm kiếm với từ khóa khác"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          onClick={handleAddTeacher}
          variant="contained"
          disabled={loading || !selectedTeacher}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {loading ? 'Đang thêm...' : 'Thêm giáo viên'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTeacherToClassDialog;
