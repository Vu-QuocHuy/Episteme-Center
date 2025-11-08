import React from 'react';
import { Paper, Grid, TextField, MenuItem } from '@mui/material';
import { SearchInput } from '../../common';

interface RegistrationFiltersProps {
  nameFilter: string;
  setNameFilter: (name: string) => void;
  emailFilter: string;
  setEmailFilter: (email: string) => void;
  processedFilter: string;
  setProcessedFilter: (status: string) => void;
}

const RegistrationFilters: React.FC<RegistrationFiltersProps> = ({
  nameFilter,
  setNameFilter,
  emailFilter,
  setEmailFilter,
  processedFilter,
  setProcessedFilter,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <SearchInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder="Tìm theo tên..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SearchInput
            value={emailFilter}
            onChange={setEmailFilter}
            placeholder="Tìm theo email..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Trạng thái xử lý"
            value={processedFilter}
            onChange={(e) => setProcessedFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="processed">Đã xử lý</MenuItem>
            <MenuItem value="pending">Chưa xử lý</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RegistrationFilters;
