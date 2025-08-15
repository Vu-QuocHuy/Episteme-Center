import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';


interface TeacherFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isActiveFilter: string;
  setIsActiveFilter: (filter: string) => void;
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  isActiveFilter,
  setIsActiveFilter,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
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
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Trạng thái"
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">Đang hoạt động</MenuItem>
            <MenuItem value="false">Ngừng hoạt động</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeacherFilters;
