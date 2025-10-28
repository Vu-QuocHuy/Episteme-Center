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
  Checkbox,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getAllStudentsAPI } from '../../../services/students';

interface AddStudentToClassDialogProps {
  open: boolean;
  onClose: () => void;
  onAddStudents: (studentIds: string[], discounts: Record<string, number>) => Promise<void>;
  existingStudentIds: string[];
  loading?: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const AddStudentToClassDialog: React.FC<AddStudentToClassDialogProps> = ({
  open,
  onClose,
  onAddStudents,
  existingStudentIds,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentDiscounts, setStudentDiscounts] = useState<Record<string, number>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!open) return;

      setLoadingStudents(true);
      try {
        const response = await getAllStudentsAPI({ page: 1, limit: 1000 });
        const students = response?.data?.data?.result || response?.data || [];
        // Filter out existing students
        const availableStudents = students.filter((student: Student) =>
          !existingStudentIds.includes(student.id)
        );
        setAllStudents(availableStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        setAllStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [open, existingStudentIds]);

  // Filter students based on debounced search query
  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleDiscountChange = (studentId: string, value: string) => {
    const discount = parseInt(value) || 0;
    setStudentDiscounts(prev => ({
      ...prev,
      [studentId]: discount
    }));
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;

    try {
      console.log('Selected students:', selectedStudents);
      console.log('Student discounts:', studentDiscounts);

      await onAddStudents(selectedStudents, studentDiscounts);
      // Reset form
      setSelectedStudents([]);
      setStudentDiscounts({});
      onClose();
    } catch (error: any) {
      console.error('Error adding students:', error);

      // If it's a 500 error, the operation might have succeeded
      if (error.response?.status === 500) {
        console.log('Got 500 error, but operation might have succeeded. Closing dialog...');
        // Reset form and close dialog anyway
        setSelectedStudents([]);
        setStudentDiscounts({});
        onClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedStudents([]);
    setStudentDiscounts({});
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Thêm học sinh vào lớp</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm học sinh..."
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

          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {filteredStudents.map((student) => (
                  <ListItem key={student.id} dense>
                    <Checkbox
                      edge="start"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                    />
                    <ListItemText
                      primary={student.name}
                      secondary={student.email}
                    />
                    {selectedStudents.includes(student.id) && (
                      <TextField
                        size="small"
                        label="Giảm giá (%)"
                        type="number"
                        value={studentDiscounts[student.id] || ''}
                        onChange={(e) => handleDiscountChange(student.id, e.target.value)}
                        sx={{ width: 120, ml: 1 }}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    )}
                  </ListItem>
                ))}
                {filteredStudents.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Không tìm thấy học sinh nào"
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
          onClick={handleAddStudents}
          variant="contained"
          disabled={loading || selectedStudents.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {loading ? 'Đang thêm...' : `Thêm ${selectedStudents.length} học sinh`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentToClassDialog;
