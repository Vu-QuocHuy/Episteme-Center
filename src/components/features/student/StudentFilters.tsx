import React from 'react';
import {
  Paper,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface StudentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm học sinh..."
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
      </Grid>
    </Paper>
  );
};

export default StudentFilters;
