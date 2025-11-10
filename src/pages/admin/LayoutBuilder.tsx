import React, { useState, useRef, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
// Editor moved to AddItemDialog
import { Box, Button, TextField, Typography, IconButton, Grid, Paper, Alert, Snackbar } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useLocation } from 'react-router-dom';
import { createArticleAPI, ArticleData, getAllArticlesAPI, getArticleByIdAPI, updateArticleAPI } from '../../services/articles';
import { uploadFileAPI } from '../../services/files';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AddItemDialog from './layout-builder/AddItemDialog';
import PreviewDialog from './layout-builder/PreviewDialog';
import { useMenuItems } from '../../hooks/features/useMenuItems';
import { commonStyles } from '../../utils/styles';
import { ComponentType } from './layout-builder/types';
import {
  renderHeroSection,
  renderFeatureCards,
  renderStatistics,
  renderCourseCards,
} from './layout-builder/componentRenderers';
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
  type: ComponentType;
  content: string;
}

const LayoutBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ✅ Đổi từ slug thành id (UUID)
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
          if (item.childrenMenu && item.childrenMenu.length) {
            const t = findTitle(item.childrenMenu);
            if (t) return t;
          }
        }
        return null;
      })(menuItems)
    : null;

  const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({ lg: [] });
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [newItem, setNewItem] = useState<{ i: string; type: ComponentType; content: string }>({
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
  // Upload state handled inside AddItemDialog
  const [articleOrder, setArticleOrder] = useState<string>('1');
  // Article will be active by default when created; no toggle in builder
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

  // ✅ Responsive scaling system - Sử dụng viewport units (moved to utils)
  // Removed fixed SCALE_RATIO; canvas now scales responsively to container

  // ✅ Content styling options
  const [contentBackground, setContentBackground] = useState('#ffffff');
  const [contentBorderRadius, setContentBorderRadius] = useState(8);

  const itemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

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
            w: 6, // Default width (6/12 = 50% of container)
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
        // Always active by default; status managed in Article Management
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


  // ✅ Generate responsive HTML với utils
  const generateResponsiveHTML = () => {
    let maxBottom = 0;
    const GRID_COLS = 12; // ✅ Số cột grid (lg breakpoint)
    const ROW_HEIGHT = 30; // ✅ Chiều cao mỗi row (px) trong builder
    const MARGIN = 10; // ✅ Margin giữa các items trong builder
    // const CONTAINER_PADDING = 0; // ✅ Container padding trong builder (containerPadding=[0,0])

    // ✅ Tính tỷ lệ scale dựa trên chiều rộng thực tế
    // Builder canvas width (lấy từ containerRef)
    // const builderWidth = containerRef.current?.clientWidth || 1200;
    // Trang thực thường có max-width container ~1200px hoặc full width
    // Để content không quá lớn, dùng tỷ lệ 1:1 (không scale)
    const SCALE_FACTOR = 1; // Không scale, giữ nguyên kích thước

    const layoutHTML = (layouts.lg || []).map(layoutItem => {
      const item = items.find(i => i.i === layoutItem.i);
      if (!item) return '';

      // ✅ Tính toán position và size - ĐỒNG BỘ với react-grid-layout
      // Position: y * (rowHeight + margin[1])
      const xPercent = (layoutItem.x / GRID_COLS) * 100;
      const yPx = layoutItem.y * (ROW_HEIGHT + MARGIN) * SCALE_FACTOR;
      const widthPercent = (layoutItem.w / GRID_COLS) * 100;
      // Height: h * rowHeight + (h - 1) * margin[1]
      const heightPx = (layoutItem.h * ROW_HEIGHT + (layoutItem.h - 1) * MARGIN) * SCALE_FACTOR;

      const bottom = yPx + heightPx;
      if (bottom > maxBottom) {
        maxBottom = bottom;
      }

      let contentHTML = '';

      // Handle advanced components (full-width, ignore grid positioning)
      if (['hero', 'feature-cards', 'statistics', 'course-cards'].includes(item.type)) {
        try {
          const config = JSON.parse(item.content);

          switch (item.type) {
            case 'hero':
              return renderHeroSection(config);
            case 'feature-cards':
              return renderFeatureCards(config);
            case 'statistics':
              return renderStatistics(config);
            case 'course-cards':
              return renderCourseCards(config);
          }
        } catch (error) {
          console.error('Error parsing component config:', error);
          contentHTML = `<div style="padding: 20px; color: red;">Error rendering component</div>`;
        }
      }

      // Handle basic components (use grid positioning)
      switch (item.type) {
        case 'text':
          contentHTML = `<div style="font-size: clamp(1rem, 1.5vw, 1.2rem); line-height: 1.6; height: 100%; overflow: auto;">${item.content || 'Default Text'}</div>`;
          break;
        case 'input':
          contentHTML = `<input type="text" value="${item.content || ''}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 1.1rem; box-sizing: border-box;" />`;
          break;
        case 'image':
          contentHTML = `<img src="${item.content}" alt="Uploaded Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />`;
          break;
        default:
          contentHTML = `<div>Invalid Type</div>`;
      }

      return `
        <div
          style="
            position: absolute;
            left: ${xPercent}%;
            top: ${yPx}px;
            width: ${widthPercent}%;
            height: ${heightPx}px;
            box-sizing: border-box;
            padding: 0;
          "
        >
          ${contentHTML}
        </div>`;
    });

    // ✅ Container height: maxBottom + extra space (không dùng containerPadding vì đã có trong items)
    const containerHeight = Math.max(maxBottom + 50, 600 * SCALE_FACTOR);

    return `
      <div
        style="
          position: relative;
          width: 100%;
          min-height: ${600 * SCALE_FACTOR}px;
          height: ${containerHeight}px;
          box-sizing: border-box;
          background-color: ${contentBackground};
          border-radius: ${contentBorderRadius}px;
          margin: 0;
          padding: 0;
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

      // Stay on Layout Builder after save; optionally refresh data if editing
      if (isEditMode && id) {
        await loadArticleData();
      }

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

    // For advanced components, show a preview placeholder
    const advancedComponentTypes = ['hero', 'feature-cards', 'statistics', 'course-cards'];
    if (advancedComponentTypes.includes(item.type)) {
      const componentLabels = {
        'hero': '🎯 Hero Section',
        'feature-cards': '⭐ Feature Cards',
        'statistics': '📊 Statistics',
        'course-cards': '📚 Course Cards',
      };

      try {
        const config = JSON.parse(item.content);
        const label = componentLabels[item.type as keyof typeof componentLabels] || item.type;

        return (
          <div
            ref={itemRefs.current[layoutItem.i]}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              border: '2px dashed #1976d2',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
              {item.type === 'hero' && `Tiêu đề: ${config.title}`}
              {item.type === 'feature-cards' && `${config.cards?.length || 0} cards`}
              {item.type === 'statistics' && `${config.stats?.length || 0} thống kê`}
              {item.type === 'course-cards' && `${config.courses?.length || 0} khóa học`}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Xem trước đầy đủ khi lưu
            </Typography>
          </div>
        );
      } catch (error) {
        return (
          <div style={{ padding: '16px', color: 'red' }}>
            Error parsing component config
          </div>
        );
      }
    }

    // For basic components, render normally
    return (
      <div
        ref={itemRefs.current[layoutItem.i]}
        style={{
          width: '100%',
          height: '100%',
          overflow: item.type === 'text' ? 'auto' : 'hidden',
          padding: '0'
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
              padding: '4px',
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
        <Box sx={{ ...commonStyles.contentContainer, p: 3 }}> {/* ✅ Giảm padding từ 5 xuống 3 */}
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tiêu đề bài viết"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
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

        {/* Order + Background + Radius + Header Image Upload */}
        <Grid container spacing={3} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Màu nền nội dung"
              type="color"
              value={contentBackground}
              onChange={(e) => setContentBackground(e.target.value)}
              helperText="Màu nền cho nội dung"
            />
          </Grid>
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
          {/* Đã bỏ tùy chọn đổ bóng */}
        </Grid>
      </Paper>

      {/* Layout Preview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Xem trước Layout</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveLayout}
            color="success"
            disabled={loading}
            size="large"
          >
            {isEditMode ? 'Cập nhật Bài viết' : 'Lưu Layout'}
          </Button>
        </Box>

        {/* Canvas Container - Responsive như các trang khác */}
        <Box ref={containerRef} sx={{
          border: '2px solid #e0e0e0',
          borderRadius: 0,
          p: 0,
          minHeight: '600px',
          width: '100%',
          backgroundColor: contentBackground,
          overflow: 'auto',
          boxSizing: 'border-box'
        }}>
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
            rowHeight={30}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
            margin={[10, 10]}
            containerPadding={[0, 0]}
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
      </Paper>

      <AddItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={addItem}
        newItem={newItem}
        setNewItem={(updater) => setNewItem(prev => updater(prev))}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        onUploadImage={async (file) => {
          try { const res = await uploadFileAPI(file); return res.data?.data?.url || ''; } catch { setSnackbar({ open: true, message: 'Tải ảnh thất bại, vui lòng thử lại', severity: 'error' }); return ''; }
        }}
        uploading={imageUploading}
      />

      <PreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} articles={previewArticles} loading={previewLoading} />

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
