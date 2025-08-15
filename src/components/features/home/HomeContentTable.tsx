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
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';
import { HomeContent } from '../../../types';

interface HomeContentTableProps {
  content: HomeContent[];
  onEdit: (content: HomeContent) => void;
  onDelete: (content: HomeContent) => void;
  onToggleActive: (content: HomeContent) => void;
}

const getSectionLabel = (section: string): string => {
  const sectionMap: { [key: string]: string } = {
    hero: 'Hero Section',
    about: 'About Section',
    services: 'Services Section',
    features: 'Features Section',
    testimonials: 'Testimonials Section',
    contact: 'Contact Section',
    footer: 'Footer Section'
  };
  return sectionMap[section] || section;
};

const getSectionColor = (section: string): string => {
  const colorMap: { [key: string]: string } = {
    hero: '#e3f2fd',
    about: '#f3e5f5',
    services: '#e8f5e8',
    features: '#fff3e0',
    testimonials: '#fce4ec',
    contact: '#f1f8e9',
    footer: '#fafafa'
  };
  return colorMap[section] || '#f5f5f5';
};

const HomeContentTable: React.FC<HomeContentTableProps> = ({
  content,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (!content || content.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có nội dung nào được tạo
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Tiêu đề</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Phần</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thứ tự</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {content.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {item.title || 'Không có tiêu đề'}
                  </Typography>
                  {item.subtitle && (
                    <Typography variant="caption" color="text.secondary">
                      {item.subtitle}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={getSectionLabel(item.section)}
                  size="small"
                  sx={{
                    backgroundColor: getSectionColor(item.section),
                    color: 'text.primary',
                    fontWeight: 'medium'
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.order}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={item.isActive ? 'Hiển thị' : 'Ẩn'}
                  size="small"
                  color={item.isActive ? 'success' : 'default'}
                  variant={item.isActive ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(item)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.isActive ? 'Ẩn nội dung' : 'Hiển thị nội dung'}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleActive(item)}
                      color={item.isActive ? 'warning' : 'success'}
                    >
                      {item.isActive ? <HideIcon /> : <ViewIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(item)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HomeContentTable;

