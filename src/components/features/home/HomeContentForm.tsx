import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Preview as PreviewIcon
} from '@mui/icons-material';
import { HomeContent, HomeContentFormData } from '../../../types';

interface HomeContentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HomeContentFormData) => Promise<void>;
  contentItem?: HomeContent | null;
  loading?: boolean;
}

const sectionOptions = [
  { value: 'hero', label: 'Banner chính', description: 'Banner chính trang chủ' },
  { value: 'about', label: 'Giới thiệu', description: 'Giới thiệu trung tâm' },
  { value: 'services', label: 'Dịch vụ', description: 'Dịch vụ cung cấp' },
  { value: 'features', label: 'Tính năng', description: 'Tính năng nổi bật' },
  { value: 'testimonials', label: 'Đánh giá', description: 'Đánh giá học viên' },
  { value: 'contact', label: 'Liên hệ', description: 'Thông tin liên hệ' },
  { value: 'footer', label: 'Chân trang', description: 'Chân trang' }
];



const HomeContentForm: React.FC<HomeContentFormProps> = ({
  open,
  onClose,
  onSubmit,
  contentItem,
  loading = false
}) => {
  const [formData, setFormData] = useState<HomeContentFormData>({
    section: 'hero',
    title: '',
    subtitle: '',
    description: '',
    content: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    order: 1,
    isActive: true
  });
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [showHomePreview, setShowHomePreview] = useState(false);

  useEffect(() => {
    if (contentItem) {
      setFormData({
        section: contentItem.section,
        title: contentItem.title || '',
        subtitle: contentItem.subtitle || '',
        description: contentItem.description || '',
        content: contentItem.content || '',
        imageUrl: contentItem.imageUrl || '',
        buttonText: contentItem.buttonText || '',
        buttonLink: contentItem.buttonLink || '',
        order: contentItem.order,
        isActive: contentItem.isActive
      });
    } else {
      setFormData({
        section: 'hero',
        title: '',
        subtitle: '',
        description: '',
        content: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        order: 1,
        isActive: true
      });
    }
    setErrors({});
  }, [contentItem, open]);

  const handleInputChange = (field: keyof HomeContentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.section) {
      newErrors.section = 'Vui lòng chọn phần nội dung';
    }

    if (formData.order < 1) {
      newErrors.order = 'Thứ tự phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

    const insertText = (text: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = formData.content;
      const newText = currentText.substring(0, start) + text + currentText.substring(end);
      handleInputChange('content', newText);

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const addComponent = (type: string) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: getDefaultContent(type)
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    const newBlocks = contentBlocks.filter((_, i) => i !== index);
    setContentBlocks(newBlocks);
  };

  const editBlock = (index: number) => {
    setEditingBlock(index);
  };

  const updateBlock = (index: number, content: string) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].content = content;
    setContentBlocks(newBlocks);
    setEditingBlock(null);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading': return 'Tiêu đề mới';
      case 'text': return 'Nhập nội dung văn bản...';
      case 'list': return 'Mục 1\nMục 2\nMục 3';
      case 'image': return 'https://example.com/image.jpg';
      case 'columns2': return 'Cột 1\n\nCột 2';
      case 'columns3': return 'Cột 1\n\nCột 2\n\nCột 3';
      case 'columnsCustom': return JSON.stringify({ columns: 4, content: 'Nội dung cột 1\n\nNội dung cột 2\n\nNội dung cột 3\n\nNội dung cột 4' });
      case 'button': return 'Nút bấm';
      default: return '';
    }
  };

  const getBlockTypeName = (type: string) => {
    switch (type) {
      case 'heading': return 'Tiêu đề';
      case 'text': return 'Văn bản';
      case 'list': return 'Danh sách';
      case 'image': return 'Hình ảnh';
      case 'columns2': return '2 Cột';
      case 'columns3': return '3 Cột';
      case 'columnsCustom': return 'Cột tùy chỉnh';
      case 'button': return 'Nút bấm';
      default: return 'Khối';
    }
  };

  const generateHTMLFromBlocks = () => {
    let html = '';
    contentBlocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          html += `<h2 style="font-size: 2rem; margin-bottom: 1rem; color: #333;">${block.content}</h2>`;
          break;
        case 'text':
          html += `<p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1rem; color: #555;">${block.content}</p>`;
          break;
        case 'list':
          const items = block.content.split('\n').filter(item => item.trim());
          html += '<ul style="font-size: 1rem; line-height: 1.6; margin-bottom: 1rem; color: #555;">';
          items.forEach(item => {
            html += `<li style="margin-bottom: 0.5rem;">${item}</li>`;
          });
          html += '</ul>';
          break;
        case 'image':
          html += `<div style="text-align: center; margin: 2rem 0;"><img src="${block.content}" alt="Hình ảnh" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;
          break;
        case 'columns2':
          const cols2 = block.content.split('\n\n');
          html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">`;
          cols2.forEach(col => {
            html += `<div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;"><p style="margin: 0; color: #555;">${col}</p></div>`;
          });
          html += '</div>';
          break;
        case 'columns3':
          const cols3 = block.content.split('\n\n');
          html += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin: 2rem 0;">`;
          cols3.forEach(col => {
            html += `<div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;"><p style="margin: 0; color: #555;">${col}</p></div>`;
          });
          html += '</div>';
          break;
        case 'columnsCustom':
          try {
            const data = JSON.parse(block.content);
            const columns = Array(data.columns).fill('1fr').join(' ');
            const cols = data.content.split('\n\n');
            html += `<div style="display: grid; grid-template-columns: ${columns}; gap: 2rem; margin: 2rem 0;">`;
            cols.forEach(col => {
              html += `<div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;"><p style="margin: 0; color: #555;">${col}</p></div>`;
            });
            html += '</div>';
          } catch (e) {
            html += '<p style="color: red;">Lỗi hiển thị cột tùy chỉnh</p>';
          }
          break;
        case 'button':
          html += `<div style="text-align: center; margin: 2rem 0;"><button style="background: #1976d2; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer;">${block.content}</button></div>`;
          break;
      }
    });
    return html;
  };

  const renderBlock = (block: any, index: number) => {
    if (editingBlock === index) {
      if (block.type === 'columnsCustom') {
        try {
          const data = JSON.parse(block.content);
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Số cột"
                type="number"
                value={data.columns}
                onChange={(e) => {
                  const newData = { ...data, columns: parseInt(e.target.value) || 2 };
                  updateBlock(index, JSON.stringify(newData));
                }}
                inputProps={{ min: 1, max: 12 }}
                helperText="Nhập số cột từ 1-12"
              />
              <TextField
                multiline
                rows={6}
                value={data.content}
                onChange={(e) => {
                  const newData = { ...data, content: e.target.value };
                  updateBlock(index, JSON.stringify(newData));
                }}
                fullWidth
                label="Nội dung các cột (phân cách bằng 2 dòng trống)"
                helperText="Mỗi cột được phân cách bằng 2 dòng trống (Enter 2 lần)"
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={() => setEditingBlock(null)}>
                  Lưu
                </Button>
                <Button size="small" onClick={() => setEditingBlock(null)}>
                  Hủy
                </Button>
              </Box>
            </Box>
          );
        } catch (e) {
          return <Typography color="error">Lỗi dữ liệu</Typography>;
        }
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            multiline
            rows={block.type === 'text' ? 3 : 1}
            value={block.content}
            onChange={(e) => updateBlock(index, e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={() => setEditingBlock(null)}>
              Lưu
            </Button>
            <Button size="small" onClick={() => setEditingBlock(null)}>
              Hủy
            </Button>
          </Box>
        </Box>
      );
    }

    switch (block.type) {
      case 'heading':
        return <Typography variant="h4">{block.content}</Typography>;
      case 'text':
        return <Typography variant="body1">{block.content}</Typography>;
      case 'list':
        return (
          <ul>
            {block.content.split('\n').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case 'image':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <img src={block.content} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        );
      case 'columns2':
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {block.content.split('\n\n').map((col: string, i: number) => (
              <Box key={i} sx={{ p: 1, border: '1px dashed #ccc' }}>
                <Typography variant="body2">{col}</Typography>
              </Box>
            ))}
          </Box>
        );
      case 'columns3':
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            {block.content.split('\n\n').map((col: string, i: number) => (
              <Box key={i} sx={{ p: 1, border: '1px dashed #ccc' }}>
                <Typography variant="body2">{col}</Typography>
              </Box>
            ))}
          </Box>
        );
      case 'columnsCustom':
        try {
          const data = JSON.parse(block.content);
          const columns = Array(data.columns).fill('1fr').join(' ');
          return (
            <Box sx={{ display: 'grid', gridTemplateColumns: columns, gap: 2 }}>
              {data.content.split('\n\n').map((col: string, i: number) => (
                <Box key={i} sx={{ p: 1, border: '1px dashed #ccc' }}>
                  <Typography variant="body2">{col}</Typography>
                </Box>
              ))}
            </Box>
          );
        } catch (e) {
          return <Typography color="error">Lỗi hiển thị cột tùy chỉnh</Typography>;
        }
      case 'button':
        return (
          <Button variant="contained" color="primary">
            {block.content}
          </Button>
        );
      default:
        return <Typography>{block.content}</Typography>;
    }
  };





  const renderPreview = () => (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
        {formData.title || 'Tiêu đề mẫu'}
      </Typography>

      {formData.subtitle && (
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          {formData.subtitle}
        </Typography>
      )}

      {formData.description && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {formData.description}
        </Typography>
      )}

      {formData.content && (
        <Box sx={{ mb: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: formData.content }} />
        </Box>
      )}

      {formData.imageUrl && (
        <Box sx={{ mb: 2 }}>
          <img
            src={formData.imageUrl}
            alt="Preview"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Box>
      )}

      {formData.buttonText && (
        <Button variant="contained" color="primary">
          {formData.buttonText}
        </Button>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {contentItem ? 'Chỉnh sửa nội dung' : 'Thêm nội dung mới'}
          </Typography>
          <Chip
            label={sectionOptions.find(s => s.value === formData.section)?.label || 'Unknown Section'}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 0, maxHeight: '70vh', overflow: 'auto' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ px: 3, pt: 1 }}>
            <Tab label="Thông tin cơ bản" />
            <Tab label="Tạo nội dung" />
            <Tab label="Xem trước" />
          </Tabs>

          <Divider />

          {/* Tab 1: Basic Information */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.section}>
                    <InputLabel>Phần nội dung</InputLabel>
                    <Select
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                      label="Phần nội dung"
                    >
                      {sectionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box>
                            <Typography variant="body2">{option.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.section && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.section}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Thứ tự hiển thị"
                    type="number"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    error={!!errors.order}
                    helperText={errors.order || 'Số càng nhỏ hiển thị càng trước'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề chính"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    multiline
                    rows={2}
                    error={!!errors.title}
                    helperText={errors.title || 'Tiêu đề chính sẽ hiển thị nổi bật'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề phụ"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    multiline
                    rows={2}
                    helperText="Tiêu đề phụ để bổ sung thông tin"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả ngắn"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={3}
                    helperText="Mô tả ngắn gọn về nội dung này"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL hình ảnh"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    helperText="Đường dẫn đến hình ảnh (có thể để trống)"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Text nút bấm"
                    value={formData.buttonText}
                    onChange={(e) => handleInputChange('buttonText', e.target.value)}
                    helperText="Văn bản hiển thị trên nút"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Link nút bấm"
                    value={formData.buttonLink}
                    onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                    helperText="Đường dẫn khi click nút"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Hiển thị nội dung này trên trang chủ"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 2: Visual Builder */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tạo nội dung bằng cách click thêm khối
              </Typography>

              <Grid container spacing={3}>
                {/* Left Panel - Components */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '400px', overflow: 'auto' }}>
                    <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                      🧩 Các khối có sẵn
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('heading')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h5">H</Typography>
                          <Box>
                            <Typography variant="body2">Tiêu đề</Typography>
                            <Typography variant="caption" color="text.secondary">Tiêu đề lớn</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('text')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">T</Typography>
                          <Box>
                            <Typography variant="body2">Văn bản</Typography>
                            <Typography variant="caption" color="text.secondary">Đoạn văn bản</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('list')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">•</Typography>
                          <Box>
                            <Typography variant="body2">Danh sách</Typography>
                            <Typography variant="caption" color="text.secondary">Danh sách có dấu chấm</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('image')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">🖼️</Typography>
                          <Box>
                            <Typography variant="body2">Hình ảnh</Typography>
                            <Typography variant="caption" color="text.secondary">Chèn hình ảnh</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('columns2')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">📊</Typography>
                          <Box>
                            <Typography variant="body2">2 Cột</Typography>
                            <Typography variant="caption" color="text.secondary">Layout 2 cột</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('columns3')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">📊</Typography>
                          <Box>
                            <Typography variant="body2">3 Cột</Typography>
                            <Typography variant="caption" color="text.secondary">Layout 3 cột</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('columnsCustom')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">⚙️</Typography>
                          <Box>
                            <Typography variant="body2">Cột tùy chỉnh</Typography>
                            <Typography variant="caption" color="text.secondary">Chọn số cột tùy ý</Typography>
                          </Box>
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                        onClick={() => addComponent('button')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">🔘</Typography>
                          <Box>
                            <Typography variant="body2">Nút bấm</Typography>
                            <Typography variant="caption" color="text.secondary">Nút hành động</Typography>
                          </Box>
                        </Box>
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Panel - Content Builder */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, height: '400px', overflow: 'auto', border: '2px dashed #e0e0e0' }}>
                    <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                      📝 Nội dung của bạn
                    </Typography>

                    {contentBlocks.length === 0 ? (
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '300px',
                        color: 'text.secondary'
                      }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Chưa có nội dung
                        </Typography>
                        <Typography variant="body2">
                          Click vào các khối bên trái để thêm nội dung
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {contentBlocks.map((block, index) => (
                          <Paper key={index} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {getBlockTypeName(block.type)}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" onClick={() => editBlock(index)}>
                                  Sửa
                                </Button>
                                <Button size="small" color="error" onClick={() => removeBlock(index)}>
                                  Xóa
                                </Button>
                              </Box>
                            </Box>
                            {renderBlock(block, index)}
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Alert severity="info" sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>💡 Hướng dẫn:</strong> Click vào các khối bên trái để thêm vào nội dung, sau đó click "Sửa" để chỉnh sửa chi tiết!
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowHomePreview(true)}
                  disabled={contentBlocks.length === 0}
                  startIcon={<PreviewIcon />}
                >
                  Xem trước trên trang chủ
                </Button>
              </Box>
            </Box>
          )}



          {/* Tab 3: Preview */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Xem trước nội dung
              </Typography>
              {renderPreview()}
            </Box>
          )}

          {/* Home Preview Modal */}
          <Dialog
            open={showHomePreview}
            onClose={() => setShowHomePreview(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: { height: '90vh' }
            }}
          >
            <DialogTitle sx={{
              borderBottom: '1px solid #e0e0e0',
              pb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">
                Xem trước trên trang chủ
              </Typography>
              <Button onClick={() => setShowHomePreview(false)}>
                Đóng
              </Button>
            </DialogTitle>
            <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{
                height: '100%',
                overflow: 'auto',
                background: 'white',
                position: 'relative'
              }}>
                {/* Simulate Homepage Header */}
                <Box sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    Trung tâm Anh ngữ
                  </Typography>
                  <Typography variant="body1">
                    Nơi khơi dậy tiềm năng ngôn ngữ của bạn
                  </Typography>
                </Box>

                {/* Content Area */}
                <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
                  <div dangerouslySetInnerHTML={{ __html: generateHTMLFromBlocks() }} />
                </Box>

                {/* Simulate Homepage Footer */}
                <Box sx={{
                  background: '#333',
                  color: 'white',
                  p: 3,
                  textAlign: 'center',
                  mt: 4
                }}>
                  <Typography variant="body2">
                    © 2024 Trung tâm Anh ngữ. All rights reserved.
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<PreviewIcon />}
          >
            {contentItem ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HomeContentForm;
