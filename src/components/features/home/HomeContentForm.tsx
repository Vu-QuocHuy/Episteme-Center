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
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Preview as PreviewIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatListBulleted as ListIcon,
  FormatListNumbered as NumberedListIcon,
  Link as LinkIcon,
  Image as ImageIcon
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
  { value: 'hero', label: 'Hero Section', icon: '🎯', description: 'Banner chính trang chủ' },
  { value: 'about', label: 'About Section', icon: 'ℹ️', description: 'Giới thiệu trung tâm' },
  { value: 'services', label: 'Services Section', icon: '🛠️', description: 'Dịch vụ cung cấp' },
  { value: 'features', label: 'Features Section', icon: '⭐', description: 'Tính năng nổi bật' },
  { value: 'testimonials', label: 'Testimonials Section', icon: '💬', description: 'Đánh giá học viên' },
  { value: 'contact', label: 'Contact Section', icon: '📞', description: 'Thông tin liên hệ' },
  { value: 'footer', label: 'Footer Section', icon: '📄', description: 'Chân trang' }
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
      <DialogTitle>
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
        <DialogContent sx={{ p: 0 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ px: 3, pt: 1 }}>
            <Tab label="Thông tin cơ bản" />
            <Tab label="Nội dung chi tiết" />
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{option.icon}</span>
                            <Box>
                              <Typography variant="body2">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
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
                    helperText={errors.order}
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

          {/* Tab 2: Detailed Content */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Nội dung chi tiết (HTML/Text)
              </Typography>

              {/* Rich Text Toolbar */}
              <Paper sx={{ p: 1, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="In đậm">
                  <IconButton size="small" onClick={() => insertText('<strong>text</strong>')}>
                    <BoldIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="In nghiêng">
                  <IconButton size="small" onClick={() => insertText('<em>text</em>')}>
                    <ItalicIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gạch chân">
                  <IconButton size="small" onClick={() => insertText('<u>text</u>')}>
                    <UnderlineIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Danh sách không đánh số">
                  <IconButton size="small" onClick={() => insertText('<ul><li>item</li></ul>')}>
                    <ListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Danh sách đánh số">
                  <IconButton size="small" onClick={() => insertText('<ol><li>item</li></ol>')}>
                    <NumberedListIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Chèn link">
                  <IconButton size="small" onClick={() => insertText('<a href="url">text</a>')}>
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Chèn hình ảnh">
                  <IconButton size="small" onClick={() => insertText('<img src="url" alt="description" />')}>
                    <ImageIcon />
                  </IconButton>
                </Tooltip>
              </Paper>

              <TextField
                id="content-textarea"
                fullWidth
                label="Nội dung chi tiết"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                multiline
                rows={12}
                helperText="Sử dụng HTML để định dạng nội dung. Có thể sử dụng các nút trên để chèn thẻ HTML cơ bản."
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Gợi ý:</strong> Bạn có thể sử dụng HTML để tạo nội dung phong phú.
                  Ví dụ: &lt;p&gt;Đoạn văn&lt;/p&gt;, &lt;h3&gt;Tiêu đề&lt;/h3&gt;, &lt;ul&gt;&lt;li&gt;Danh sách&lt;/li&gt;&lt;/ul&gt;
                </Typography>
              </Alert>
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
