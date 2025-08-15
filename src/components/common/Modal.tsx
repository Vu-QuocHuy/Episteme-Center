import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  IconButton,
  Typography,
  Box,
  SxProps,
  Theme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

const Modal: React.FC<ModalProps> = React.memo(({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  loading = false,
  sx = {},
  'data-testid': dataTestId,
  ...props
}) => {
  const handleClose = (_event: React.MouseEvent, reason: string) => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && !closeOnEscape) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={!closeOnEscape}
      sx={sx}
      data-testid={dataTestId}
      {...props}
    >
      {title && (
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                disabled={loading}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : (
          children
        )}
      </DialogContent>

      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
});

Modal.displayName = 'Modal';

export default Modal;
