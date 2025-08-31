import React from 'react';
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  ListItem,
  Typography,
  Skeleton,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';

interface NavigationMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  anchorEl,
  onClose,
  open,
}) => {
  const location = useLocation();
  const { getActiveMenuItems, loading } = useMenuItems();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const menuItems = getActiveMenuItems();

  const handleToggleExpand = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = () => {
    onClose();
  };

  const renderMenuItem = (item: any, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.key);
    const isActive = location.pathname === `/${item.key}`;

    return (
      <Box key={item.key}>
        <ListItem
          button
          component={hasChildren ? 'div' : Link}
          to={hasChildren ? undefined : `/${item.key}`}
          onClick={hasChildren ? () => handleToggleExpand(item.key) : handleItemClick}
          sx={{
            pl: 2 + level * 2,
            backgroundColor: isActive ? 'action.selected' : 'transparent',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            minHeight: 48,
          }}
        >
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'primary.main' : 'text.primary',
                }}
              >
                {item.label}
              </Typography>
            }
          />
          {hasChildren && (
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemIcon>
          )}
          {!hasChildren && (
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <ArrowIcon fontSize="small" color="action" />
            </ListItemIcon>
          )}
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: any) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            minWidth: 250,
            maxHeight: 400,
            overflow: 'auto',
          },
        }}
      >
        {[1, 2, 3].map((item) => (
          <MenuItem key={item} disabled>
            <Skeleton width="100%" height={24} />
          </MenuItem>
        ))}
      </Menu>
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 250,
          maxHeight: 400,
          overflow: 'auto',
        },
      }}
    >
      {menuItems.length === 0 ? (
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            Không có menu nào
          </Typography>
        </MenuItem>
      ) : (
        menuItems.map((item: any) => renderMenuItem(item))
      )}
    </Menu>
  );
};

export default NavigationMenu;
