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
  Chip,
  Typography,
  Box,
  Badge,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Role, Permission } from '../../../types';

interface RoleTableProps {
  roles: Role[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  expandedRows: Set<number>;
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
  onToggleExpand: (roleId: number) => void;
  onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'info';
    case 'POST': return 'success';
    case 'PUT':
    case 'PATCH': return 'warning';
    case 'DELETE': return 'error';
    default: return 'default';
  }
};

const renderPermissionsList = (permissions: Permission[]) => {
  if (permissions.length === 0) {
    return (
      <Typography color="text.secondary">Không có quyền nào được gán</Typography>
    );
  }

  return (
    <List dense>
      {permissions.map((permission, index) => (
        <React.Fragment key={permission.id}>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={permission.method}
                    size="small"
                    color={getMethodColor(permission.method) as any}
                    variant="outlined"
                  />
                  <Typography component="span" fontFamily="monospace">
                    {permission.path}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {permission.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Module: {permission.module} | Version: {permission.version}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < permissions.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  loading = false,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  expandedRows,
  onEdit,
  onDelete,
  onToggleExpand,
  onPageChange
}) => {
  const renderRoleRow = (role: Role) => (
    <React.Fragment key={role.id}>
      <TableRow>
        <TableCell>{role.id}</TableCell>
        <TableCell>
          <Chip label={role.name} color="primary" variant="outlined" />
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {role.description || '-'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={role.isActive ? 'Hoạt động' : 'Không hoạt động'}
            color={role.isActive ? 'success' : 'default'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={role.permissions.length} color="primary">
              <SecurityIcon />
            </Badge>
            <Button
              size="small"
              onClick={() => onToggleExpand(role.id)}
              endIcon={expandedRows.has(role.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expandedRows.has(role.id) ? 'Thu gọn' : 'Xem chi tiết'}
            </Button>
          </Box>
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={() => onEdit(role)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(role.id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expandedRows.has(role.id)} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>
                Quyền hạn ({role.permissions.length})
              </Typography>
              {role.permissions.length === 0 ? (
                <Typography color="text.secondary">Không có quyền nào được gán</Typography>
              ) : (
                renderPermissionsList(role.permissions)
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên vai trò</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Quyền</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map(renderRoleRow)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={onPageChange} color="primary" />
        </Box>
      )}

      {/* Footer Info */}
      {!loading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Hiển thị {roles.length} trên {totalItems} vai trò
        </Typography>
      )}
    </>
  );
};

export default RoleTable;

