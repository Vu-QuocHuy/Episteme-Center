import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { SearchInputProps } from '../../types';

const SearchInput: React.FC<SearchInputProps> = React.memo(({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  fullWidth = true,
  size = "medium",
  sx = {},
  ...props
}) => {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size === 'large' ? 'medium' : size}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#667eea',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#667eea',
          },
        },
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
