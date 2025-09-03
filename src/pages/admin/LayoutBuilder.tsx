import React, { useState, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Editor } from '@tinymce/tinymce-react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Grid,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { createArticleAPI } from '../../services/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
// Removed unused style imports

const ResponsiveGridLayout = WidthProvider(Responsive);

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ContentItem {
  i: string;
  type: 'text' | 'image' | 'input';
  content: string;
}

const LayoutBuilder: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  // const cx = classNames.bind(styles);

  const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({ lg: [] });
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [newItem, setNewItem] = useState<{ i: string; type: 'text' | 'image' | 'input'; content: string }>({
    i: '',
    type: 'text',
    content: ''
  });
  const [editorContent, setEditorContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const itemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

  // Auto-generate ID if not provided
  const generateId = () => `item-${Date.now()}`;

  const addItem = () => {
    if (!newItem.type) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn loại thành phần!',
        severity: 'warning'
      });
      return;
    }

    const id = newItem.i || generateId();
    itemRefs.current[id] = React.createRef();

    const nextY = layouts.lg.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);

    setLayouts(prev => ({
      ...prev,
      lg: [
        ...prev.lg,
        {
          i: id,
          x: 0,
          y: nextY,
          w: 6, // Default width
          h: 2, // Default height
        }
      ]
    }));

    setItems(prev => [
      ...prev,
      {
        i: id,
        type: newItem.type,
        content: newItem.type === 'text' ? editorContent : newItem.content
      }
    ]);

    // Reset form
    setNewItem({ i: '', type: 'text', content: '' });
    setEditorContent('');
    setDialogOpen(false);
  };

  const removeItem = (id: string) => {
    setLayouts(prev => ({
      ...prev,
      lg: prev.lg.filter(item => item.i !== id)
    }));
    setItems(prev => prev.filter(item => item.i !== id));
    delete itemRefs.current[id];
  };

  const onLayoutChange = (currentLayout: LayoutItem[]) => {
    setLayouts({ lg: currentLayout });
  };

  const generateHTML = () => {
    let maxBottom = 0;

    const layoutHTML = layouts.lg.map(layoutItem => {
      const item = items.find(i => i.i === layoutItem.i);
      if (!item) return '';

      const x = layoutItem.x * 25; // Grid column width
      const y = layoutItem.y * 50; // Row height
      const width = layoutItem.w * 25;
      const height = layoutItem.h * 50;
      const bottom = y + height;

      if (bottom > maxBottom) {
        maxBottom = bottom;
      }

      let contentHTML = '';
      switch (item.type) {
        case 'text':
          contentHTML = `<div>${item.content || 'Default Text'}</div>`;
          break;
        case 'input':
          contentHTML = `<input type="text" value="${item.content || ''}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />`;
          break;
        case 'image':
          contentHTML = `<img src="${item.content}" alt="Uploaded Image" style="width: 100%; height: 100%; object-fit: cover;" />`;
          break;
        default:
          contentHTML = `<div>Invalid Type</div>`;
      }

      return `
        <div
          style="
            position: absolute;
            transform: translate(${x}px, ${y}px);
            width: ${width - 20}px;
            height: ${height}px;
            box-sizing: border-box;
          "
        >
          ${contentHTML}
        </div>`;
    });

    return `
      <div
        style="
          position: relative;
          width: 100%;
          height: ${maxBottom}px;
          box-sizing: border-box;
        "
      >
        ${layoutHTML.join('\n')}
      </div>
    `;
  };

  const saveLayout = async () => {
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập tiêu đề!',
        severity: 'warning'
      });
      return;
    }

    if (items.length === 0) {
      setSnackbar({
        open: true,
        message: 'Vui lòng thêm ít nhất một thành phần!',
        severity: 'warning'
      });
      return;
    }

    try {
      const html = generateHTML();
      const formData = new FormData();
      formData.append('content', html);
      formData.append('title', title);
      formData.append('menuItemId', slug || '');

      if (fileList.length > 0) {
        formData.append('file', fileList[0]);
      }

      await createArticleAPI(formData);

      setSnackbar({
        open: true,
        message: 'Lưu layout thành công!',
        severity: 'success'
      });

      // Redirect back to menu management
      setTimeout(() => {
        navigate('/admin/menu');
      }, 1500);

    } catch (error) {
      console.error('Error saving layout:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu layout!',
        severity: 'error'
      });
    }
  };

  const renderItemContent = (layoutItem: LayoutItem) => {
    const item = items.find(i => i.i === layoutItem.i);
    if (!item) return <div style={{ color: 'red' }}>Invalid Item</div>;

    return (
      <div
        ref={itemRefs.current[layoutItem.i]}
        style={{
          width: '100%',
          height: '100%',
          overflow: item.type === 'text' ? 'auto' : 'hidden',
          padding: '8px'
        }}
      >
        {item.type === 'text' && (
          <div dangerouslySetInnerHTML={{ __html: item.content || '<p>Default Text</p>' }} />
        )}
        {item.type === 'image' && (
          <img
            src={item.content || ''}
            alt="Uploaded"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {item.type === 'input' && (
          <input
            type="text"
            value={item.content || ''}
            readOnly
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Tạo Layout cho Menu: {slug}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kéo thả và tùy chỉnh các thành phần để tạo giao diện cho trang này
          </Typography>
        </Box>

      {/* Form Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tiêu đề bài viết"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={(e) => setFileList(e.target.files ? Array.from(e.target.files) : [])}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {fileList.length > 0 ? `${fileList.length} file đã chọn` : 'Chọn ảnh tiêu đề'}
              </Button>
            </label>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              fullWidth
            >
              Thêm thành phần
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Layout Preview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Xem trước Layout</Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveLayout}
            color="success"
          >
            Lưu Layout
          </Button>
        </Box>

        <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, minHeight: '400px' }}>
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 24, md: 24, sm: 24, xs: 24 }}
            rowHeight={50}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
          >
            {layouts.lg.map(layoutItem => (
              <div key={layoutItem.i} style={{ position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => removeItem(layoutItem.i)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                {renderItemContent(layoutItem)}
              </div>
            ))}
          </ResponsiveGridLayout>
        </Box>
      </Paper>

      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm thành phần mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID (tùy chọn)"
                  value={newItem.i}
                  onChange={(e) => setNewItem(prev => ({ ...prev, i: e.target.value }))}
                  helperText="Để trống để tự động tạo ID"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại thành phần</InputLabel>
                  <Select
                    value={newItem.type}
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as any }))}
                    label="Loại thành phần"
                  >
                    <MenuItem value="text">Văn bản</MenuItem>
                    <MenuItem value="image">Hình ảnh</MenuItem>
                    <MenuItem value="input">Input field</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {newItem.type === 'text' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nội dung văn bản:
                  </Typography>
                                     <Editor
                     apiKey="z7rs4ijsr5qcpob6tbzosk50cpg1otyearqb6i08r0c4s7og"
                     initialValue=""
                     init={{
                       height: 300,
                       menubar: false,
                       plugins: [
                         'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                         'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                         'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                       ],
                       toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                       // Sử dụng API key hợp lệ
                       skin: 'oxide',
                       content_css: 'default',
                       // Tắt tracking và analytics
                       promotion: false,
                       referrer_policy: 'no-referrer'
                     }}
                     value={editorContent}
                     onEditorChange={setEditorContent}
                     onInit={() => {
                       console.log('TinyMCE initialized successfully with API key');
                     }}
                     onError={(e: any) => {
                       console.error('TinyMCE error:', e);
                       setSnackbar({
                         open: true,
                         message: 'Lỗi khởi tạo editor. Vui lòng thử lại.',
                         severity: 'error'
                       });
                     }}
                   />
                </Grid>
              )}

              {newItem.type === 'image' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    URL hình ảnh:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập URL hình ảnh hoặc đường dẫn"
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                  />
                </Grid>
              )}

              {newItem.type === 'input' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Giá trị mặc định:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập giá trị mặc định cho input field"
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button onClick={addItem} variant="contained">
            Thêm thành phần
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default LayoutBuilder;
