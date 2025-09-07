import React, { useState, useRef, useEffect } from 'react';
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
  Snackbar,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createArticleAPI, ArticleData, uploadFileAPI, getAllArticlesAPI, getArticleByIdAPI, updateArticleAPI } from '../../services/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useMenuItems } from '../../hooks/features/useMenuItems';
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
  const { id } = useParams<{ id: string }>(); // ✅ Đổi từ slug thành id (UUID)
  const navigate = useNavigate();
  const location = useLocation();
  // const cx = classNames.bind(styles);

  // ✅ Phân biệt mode: tạo mới vs chỉnh sửa
  // Sử dụng query parameter để phân biệt
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode'); // 'edit' hoặc 'create'

  const isEditMode = mode === 'edit';
  const menuId = isEditMode ? undefined : id; // Nếu edit thì id là articleId, nếu create thì id là menuId
  const { menuItems } = useMenuItems();
  const menuTitle = !isEditMode && menuId
    ? (function findTitle(items: any[]): string | null {
        for (const item of items) {
          if (item.id === menuId) return item.title;
          if (item.children && item.children.length) {
            const t = findTitle(item.children);
            if (t) return t;
          }
        }
        return null;
      })(menuItems)
    : null;

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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>();
  const [uploadedPublicId, setUploadedPublicId] = useState<string | undefined>();
  const [imageUploading, setImageUploading] = useState(false);
  const [articleOrder, setArticleOrder] = useState<string>('1');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticles, setPreviewArticles] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // ✅ Responsive scaling system - Sử dụng viewport units
  const DESIGN_WIDTH = 1200; // Width của khung tạo
  // Removed fixed SCALE_RATIO; canvas now scales responsively to container

  // ✅ Content styling options
  const [contentBackground, setContentBackground] = useState('#ffffff');
  const [contentBorderRadius, setContentBorderRadius] = useState(8);

  const itemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  // ✅ Scale canvas theo độ rộng container để trải nghiệm kéo thả giống trang thật
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasScale, setCanvasScale] = useState<number>(1);

  useEffect(() => {
    const computeScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const availableWidth = container.clientWidth;
      if (availableWidth <= 0) return;
      // Scale dựa trên DESIGN_WIDTH để vừa khít container
      const scale = availableWidth / DESIGN_WIDTH;
      setCanvasScale(scale);
    };

    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  // Auto-generate ID if not provided
  const generateId = () => `item-${Date.now()}`;

  // ✅ Load dữ liệu khi component mount
  useEffect(() => {
    console.log('🔍 LayoutBuilder mounted:', { id, mode, isEditMode, menuId });
    if (isEditMode) {
      loadArticleData();
    }
  }, [isEditMode, id]);

  const addItem = () => {
    console.log('🔧 addItem called with:', newItem);

    if (!newItem.type) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn loại thành phần!',
        severity: 'warning'
      });
      return;
    }

    const id = newItem.i || generateId();
    const isEditing = newItem.i && items.some(item => item.i === newItem.i);

    if (!isEditing) {
      // Creating new item
    itemRefs.current[id] = React.createRef();
      const nextY = (layouts.lg || []).reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);

    setLayouts(prev => ({
      ...prev,
      lg: [
          ...(prev.lg || []),
        {
          i: id,
          x: 0,
          y: nextY,
            w: 20, // Default width (20/40 = 50% of container)
            h: 4, // Default height
        }
      ]
    }));
    }

    // Update items (both create and edit)
    setItems(prev => {
      if (isEditing) {
        // Update existing item
        return prev.map(item =>
          item.i === id
            ? { ...item, type: newItem.type, content: newItem.type === 'text' ? editorContent : newItem.content }
            : item
        );
      } else {
        // Add new item
        return [
      ...prev,
      {
        i: id,
        type: newItem.type,
        content: newItem.type === 'text' ? editorContent : newItem.content
      }
        ];
      }
    });

    // Reset form
    setNewItem({ i: '', type: 'text', content: '' });
    setEditorContent('');
    setDialogOpen(false);

    console.log('🔧 addItem completed');
  };

  const removeItem = (id: string) => {
    setLayouts(prev => ({
      ...prev,
      lg: (prev.lg || []).filter(item => item.i !== id)
    }));
    setItems(prev => prev.filter(item => item.i !== id));
    delete itemRefs.current[id];
  };

  const editItem = (id: string) => {
    const item = items.find(item => item.i === id);
    if (!item) return;

    // Set form data for editing
    setNewItem({ i: id, type: item.type, content: item.content });
    if (item.type === 'text') {
      setEditorContent(item.content);
    }
    setDialogOpen(true);
  };

  const fetchPreviewArticles = async () => {
    if (!menuId) return;

    try {
      setPreviewLoading(true);
      const response = await getAllArticlesAPI({
        page: 1,
        limit: 100,
        filters: { menuId: menuId }
      });
      const articlesList = response.data?.data?.result || [];
      setPreviewArticles(articlesList);
    } catch (error) {
      console.error('Error fetching preview articles:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải dữ liệu xem trước',
        severity: 'error'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // ✅ Parse HTML content để tạo layouts và items
  const parseHTMLContent = (htmlContent: string) => {
    try {
      // Tạo một div tạm để parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      const newItems: ContentItem[] = [];
      const newLayouts: LayoutItem[] = [];
      let itemIndex = 0;

      // Tìm tất cả các div có style position: absolute
      const absoluteDivs = tempDiv.querySelectorAll('div[style*="position: absolute"]');

      absoluteDivs.forEach((div) => {
        const style = div.getAttribute('style') || '';

        // Extract position và size từ style
        const transformMatch = style.match(/transform:\s*translate\(([^,]+)px,\s*([^)]+)px\)/);
        const widthMatch = style.match(/width:\s*([^;]+)px/);
        const heightMatch = style.match(/height:\s*([^;]+)px/);

        if (transformMatch && widthMatch && heightMatch) {
          const x = parseInt(transformMatch[1]) || 0;
          const y = parseInt(transformMatch[2]) || 0;
          const width = parseInt(widthMatch[1]) || 200;
          const height = parseInt(heightMatch[1]) || 100;

          // Convert pixel to grid units (dựa trên rowHeight=30, margin=10)
          const gridX = Math.round(x / 30);
          const gridY = Math.round(y / 30);
          const gridW = Math.round(width / 30);
          const gridH = Math.round(height / 30);

          const itemId = `item-${itemIndex}`;
          itemIndex++;

          // Determine content type và content
          let contentType: 'text' | 'image' | 'input' = 'text';
          let content = '';

          // Check if contains image
          const img = div.querySelector('img');
          if (img) {
            contentType = 'image';
            content = img.src || '';
          } else {
            // Check if contains input
            const input = div.querySelector('input');
            if (input) {
              contentType = 'input';
              content = input.value || '';
            } else {
              // Default to text
              contentType = 'text';
              content = div.innerHTML || '<p>Default Text</p>';
            }
          }

          // Create item
          const newItem: ContentItem = {
            i: itemId,
            type: contentType,
            content: content
          };

          // Create layout
          const newLayout: LayoutItem = {
            i: itemId,
            x: gridX,
            y: gridY,
            w: gridW,
            h: gridH
          };

          newItems.push(newItem);
          newLayouts.push(newLayout);
        }
      });

      // Update state
      setItems(newItems);
      setLayouts({ lg: newLayouts });

      console.log('✅ Parsed HTML content:', { newItems, newLayouts });

    } catch (error) {
      console.error('Error parsing HTML content:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi parse nội dung HTML',
        severity: 'error'
      });
    }
  };

  // ✅ Load dữ liệu article khi chỉnh sửa
  const loadArticleData = async () => {
    if (!isEditMode || !id) return;

    try {
      setLoading(true);
      console.log('🔄 Loading article data for ID:', id);
      const response = await getArticleByIdAPI(id);
      console.log('📄 Article response:', response.data);
      const article = response.data?.data;

      if (article) {
        setTitle(article.title || '');
        setArticleOrder(String((article as any).order || 1));
        setIsActive((article as any).isActive !== false);
        setUploadedImageUrl(article.file || undefined);
        setUploadedPublicId(article.publicId || undefined);

        // Parse content để tạo layouts và items
        if (article.content) {
          parseHTMLContent(article.content);
        }
      }
    } catch (error) {
      console.error('Error loading article:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải dữ liệu bài viết',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const onLayoutChange = (currentLayout: any) => {
    setLayouts({ lg: currentLayout });
  };


  // ✅ Generate responsive HTML với viewport units
  const generateResponsiveHTML = () => {
    let maxBottom = 0;

    const layoutHTML = (layouts.lg || []).map(layoutItem => {
      const item = items.find(i => i.i === layoutItem.i);
      if (!item) return '';

      // ✅ Tính toán position và size với responsive units
      // Convert grid units to percentage based on design width
      const xPercent = (layoutItem.x * 30 / DESIGN_WIDTH) * 100;
      const yPercent = (layoutItem.y * 30 / DESIGN_WIDTH) * 100;
      const widthPercent = (layoutItem.w * 30 / DESIGN_WIDTH) * 100;
      const heightVh = Math.max((layoutItem.h * 30 / window.innerHeight) * 100, 5); // Minimum 5vh

      const bottom = yPercent + heightVh;
      if (bottom > maxBottom) {
        maxBottom = bottom;
      }

      let contentHTML = '';
      switch (item.type) {
        case 'text':
          // Match site baseline (sidebar/body text ≈ 1rem). Keep slight responsiveness.
          // This clamps font-size to never exceed 1rem on large screens.
          contentHTML = `<div style="font-size: clamp(0.9rem, 1vw, 1rem); line-height: 1.6;">${item.content || 'Default Text'}</div>`;
          break;
        case 'input':
          contentHTML = `<input type="text" value="${item.content || ''}" readonly style="width: 100%; padding: clamp(8px, 1.5vw, 16px); border: 1px solid #ddd; border-radius: 4px; font-size: clamp(0.9rem, 2vw, 1.2rem);" />`;
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
            left: ${xPercent}%;
            top: ${yPercent}%;
            width: ${widthPercent}%;
            height: ${heightVh}vh;
            box-sizing: border-box;
            padding: clamp(10px, 1.5vw, 20px);
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
          min-height: 100vh;
          height: ${Math.max(maxBottom, 100)}vh;
          box-sizing: border-box;
          background-color: ${contentBackground};
          border-radius: ${contentBorderRadius}px;
          margin: 0;
          padding: clamp(20px, 3vw, 40px);
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
      const html = generateResponsiveHTML(); // ✅ Sử dụng responsive HTML cho trang thực tế

      if (isEditMode) {
        // ✅ Chỉnh sửa: Sử dụng updateArticleAPI
        const updateData: Partial<ArticleData> = {
          title: title,
          content: html,
          order: Math.max(1, Number(articleOrder || '1')),
          isActive: isActive,
          file: uploadedImageUrl ?? '',
          publicId: uploadedPublicId ?? ''
        };

        await updateArticleAPI(id!, updateData);

        setSnackbar({
          open: true,
          message: 'Cập nhật bài viết thành công!',
          severity: 'success'
        });
      } else {
        // ✅ Tạo mới: Sử dụng createArticleAPI
        const articleData: ArticleData = {
          title: title,
          content: html,
          menuId: menuId || '', // ✅ Sử dụng menuId cho tạo mới
          order: Math.max(1, Number(articleOrder || '1')),
          isActive: isActive,
          file: uploadedImageUrl ?? '',
          publicId: uploadedPublicId ?? ''
        };

        await createArticleAPI(articleData);

      setSnackbar({
        open: true,
          message: 'Tạo bài viết thành công!',
        severity: 'success'
      });
      }

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

  // ✅ Show loading state khi đang load dữ liệu
  if (loading && isEditMode) {
    return (
      <DashboardLayout role="admin">
        <Box sx={commonStyles.pageContainer}>
          <Box sx={commonStyles.contentContainer}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Typography variant="h6">Đang tải dữ liệu bài viết...</Typography>
            </Box>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              {isEditMode
                ? `Chỉnh sửa Bài viết: ${title || 'Đang tải...'}`
                : `Tạo Layout cho Menu: ${menuTitle || menuId}`}
          </Typography>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={async () => {
                await fetchPreviewArticles();
                setPreviewOpen(true);
              }}
              color="info"
              disabled={previewLoading}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {previewLoading ? 'Đang tải...' : 'Xem trước'}
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {isEditMode
              ? 'Chỉnh sửa nội dung và layout của bài viết này'
              : 'Kéo thả và tùy chỉnh các thành phần để tạo giao diện cho trang này'
            }
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
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                setFileList(file ? [file] : []);
                if (file) {
                  try {
                    setImageUploading(true);
                    const uploadRes = await uploadFileAPI(file);
                    setUploadedImageUrl(uploadRes.data.data.url);
                    setUploadedPublicId(uploadRes.data.data.public_id);
                  } catch (err) {
                    setSnackbar({
                      open: true,
                      message: 'Tải ảnh thất bại, vui lòng thử lại',
                      severity: 'error'
                    });
                    setUploadedImageUrl(undefined);
                    setUploadedPublicId(undefined);
                  } finally {
                    setImageUploading(false);
                  }
                } else {
                  setUploadedImageUrl(undefined);
                  setUploadedPublicId(undefined);
                }
              }}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                disabled={imageUploading}
              >
                {imageUploading
                  ? 'Đang tải ảnh...'
                  : uploadedImageUrl
                    ? 'Ảnh đã tải thành công'
                    : fileList.length > 0
                      ? `${fileList.length} file đã chọn`
                      : 'Chọn ảnh tiêu đề'
                }
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

        {/* Order, Status và Preview Controls */}
        <Grid container spacing={3} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Thứ tự hiển thị"
              type="number"
              value={articleOrder}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') { setArticleOrder(''); return; }
                const digits = v.replace(/\D/g, '');
                setArticleOrder(digits);
              }}
              helperText="Số nhỏ hơn sẽ hiển thị trước"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Trạng thái hoạt động"
            />
          </Grid>
          {/* Nút Xem trước đã được chuyển lên tiêu đề */}
        </Grid>

        {/* Content Styling Controls */}
        <Grid container spacing={3} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Màu nền nội dung"
              type="color"
              value={contentBackground}
              onChange={(e) => setContentBackground(e.target.value)}
              helperText="Màu nền cho nội dung"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Bo góc (px)"
              type="number"
              value={contentBorderRadius}
              onChange={(e) => setContentBorderRadius(Number(e.target.value))}
              helperText="Độ bo góc"
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>
          {/* Đã bỏ tùy chọn đổ bóng */}
        </Grid>
      </Paper>

      {/* Layout Preview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
          <Typography variant="h6">Xem trước Layout</Typography>
            <Typography variant="body2" color="text.secondary">
              Khung tạo: {DESIGN_WIDTH}px → Trang thực tế: Responsive (100% width, min 100vh height)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveLayout}
            color="success"
            disabled={loading}
          >
            {isEditMode ? 'Cập nhật Bài viết' : 'Lưu Layout'}
          </Button>
        </Box>

        <Box ref={containerRef} sx={{
          border: '1px solid #ddd',
          borderRadius: 1,
          p: 2,
          minHeight: '500px',
          width: '100%',
          margin: '0 auto',
          backgroundColor: '#f5f5f5', // Background xám để tạo contrast
          overflowX: 'hidden'
        }}>
          {/* Wrapper có width cố định = DESIGN_WIDTH, scale theo container */}
          <Box sx={{
            width: `${DESIGN_WIDTH}px`,
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top center',
            margin: '0 auto'
          }}>
            <Box sx={{
              backgroundColor: contentBackground,
              borderRadius: `${contentBorderRadius}px`,
              minHeight: '460px'
            }}>
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 40, md: 40, sm: 20, xs: 10 }}
            rowHeight={30}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
            margin={[10, 10]}
            containerPadding={[10, 10]}
          >
            {(layouts.lg || []).map(layoutItem => (
              <div key={layoutItem.i} style={{ position: 'relative' }}>
                {/* Edit Button */}
                <IconButton
                  size="small"
                  onClick={() => editItem(layoutItem.i)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>

                {/* Delete Button */}
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
          </Box>
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

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth={false}
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            borderRadius: 0
          }
        }}
      >
        {/* Floating close button */}
        <Box sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setPreviewOpen(false)}
            sx={{
              borderRadius: '50%',
              minWidth: 'auto',
              width: 48,
              height: 48,
              boxShadow: 3
            }}
          >
            ✕
          </Button>
        </Box>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
            {previewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Typography>Đang tải dữ liệu xem trước...</Typography>
              </Box>
            ) : previewArticles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Chưa có bài viết nào cho menu này
                </Typography>
              </Box>
            ) : (
              previewArticles
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((article, index) => (
                  <Box key={article.id || index} sx={{ mb: 6 }}>
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  </Box>
                ))
            )}
          </Box>
        </DialogContent>
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
