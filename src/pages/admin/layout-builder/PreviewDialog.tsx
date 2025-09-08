import React from 'react';
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  articles: any[];
  loading?: boolean;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({ open, onClose, articles, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth fullScreen PaperProps={{ sx: { width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none', margin: 0, borderRadius: 0 } }}>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Button variant="contained" color="primary" onClick={onClose} sx={{ borderRadius: '50%', minWidth: 'auto', width: 48, height: 48, boxShadow: 3 }}>✕</Button>
      </Box>
      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Box sx={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Typography>Đang tải dữ liệu xem trước...</Typography>
            </Box>
          ) : articles.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">Chưa có bài viết nào cho menu này</Typography>
            </Box>
          ) : (
            articles.sort((a, b) => (a.order || 0) - (b.order || 0)).map((article, index) => (
              <Box key={article.id || index} sx={{ mb: 6 }}>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </Box>
            ))
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
