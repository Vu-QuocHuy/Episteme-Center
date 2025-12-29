import React from 'react';
import {
  Paper,
  TextField,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface ClassFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  gradeFilter: string;
  setGradeFilter: (grade: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onReset: () => void;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  yearFilter,
  setYearFilter,
  gradeFilter,
  setGradeFilter,
  statusFilter,
  setStatusFilter,
  onReset,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
          }}>
            <InputLabel>Năm học</InputLabel>
            <Select
              value={yearFilter}
              label="Năm học"
              onChange={(e: SelectChangeEvent) => setYearFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
          }}>
            <InputLabel>Khối</InputLabel>
            <Select
              value={gradeFilter}
              label="Khối"
              onChange={(e: SelectChangeEvent) => setGradeFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">Khối 1</MenuItem>
              <MenuItem value="2">Khối 2</MenuItem>
              <MenuItem value="3">Khối 3</MenuItem>
              <MenuItem value="4">Khối 4</MenuItem>
              <MenuItem value="5">Khối 5</MenuItem>
              <MenuItem value="6">Khối 6</MenuItem>
              <MenuItem value="7">Khối 7</MenuItem>
              <MenuItem value="8">Khối 8</MenuItem>
              <MenuItem value="9">Khối 9</MenuItem>
              <MenuItem value="10">Khối 10</MenuItem>
              <MenuItem value="11">Khối 11</MenuItem>
              <MenuItem value="12">Khối 12</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
          }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="upcoming">Sắp mở</MenuItem>
              <MenuItem value="closed">Đã kết thúc</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            onClick={onReset}
            startIcon={<ClearIcon />}
            sx={{
              borderRadius: 2,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
              },
            }}
          >
            Xóa bộ lọc
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClassFilters;
