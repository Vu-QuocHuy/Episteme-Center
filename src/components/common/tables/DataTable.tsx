import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  LinearProgress,
  Pagination,
} from '@mui/material';
import { commonStyles } from '../../../utils/styles';

// Interface definitions
interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  icon: React.ReactNode;
  onClick: (row: any) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  title?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  actions?: Action[];
  emptyMessage?: string;
  showPagination?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  actions,
  emptyMessage = 'Không có dữ liệu',
  showPagination = true,
}) => {
  if (loading) {
    return <LinearProgress />;
  }

  return (
    <>
      <TableContainer component={Paper} sx={commonStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  width={column.width}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="center" width="13%">
                  Thao tác
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <Typography sx={{ color: 'text.secondary', py: 4 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id || index} sx={commonStyles.tableRow}>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align || 'left'}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {actions.map((action, actionIndex) => (
                          <IconButton
                            key={actionIndex}
                            size="small"
                            color={action.color || 'primary'}
                            onClick={() => action.onClick(row)}
                            title={action.title}
                          >
                            {action.icon}
                          </IconButton>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </>
  );
};

export default DataTable;
