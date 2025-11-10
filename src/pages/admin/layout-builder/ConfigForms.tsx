import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  HeroConfig,
  FeatureCardsConfig,
  StatisticsConfig,
  CourseCardsConfig,
} from './types';

// ============================================
// HERO SECTION CONFIG FORM
// ============================================
interface HeroConfigFormProps {
  config: HeroConfig;
  onChange: (config: HeroConfig) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export const HeroConfigForm: React.FC<HeroConfigFormProps> = ({
  config,
  onChange,
  onUploadImage,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: keyof HeroConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleButtonChange = (index: number, field: string, value: any) => {
    const newButtons = [...config.ctaButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    handleChange('ctaButtons', newButtons);
  };

  const addButton = () => {
    handleChange('ctaButtons', [
      ...config.ctaButtons,
      { text: 'Button', link: '#', style: 'contained' as const, color: 'primary' as const },
    ]);
  };

  const removeButton = (index: number) => {
    handleChange('ctaButtons', config.ctaButtons.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      setUploading(true);
      try {
        const url = await onUploadImage(file);
        handleChange('backgroundImage', url);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Hero Section Configuration
      </Typography>

      {/* Title & Subtitle */}
      <TextField
        fullWidth
        label="Tiêu đề chính"
        value={config.title}
        onChange={(e) => handleChange('title', e.target.value)}
        required
      />
      <TextField
        fullWidth
        label="Mô tả phụ"
        value={config.subtitle}
        onChange={(e) => handleChange('subtitle', e.target.value)}
        multiline
        rows={2}
      />

      {/* Background */}
      <Divider />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Background
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="hero-background-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="hero-background-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
              fullWidth
            >
              {uploading
                ? 'Đang tải...'
                : config.backgroundImage
                  ? 'Đổi ảnh nền'
                  : 'Tải ảnh nền'}
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Màu nền (nếu không có ảnh)"
            type="color"
            value={config.backgroundColor || '#f5f5f5'}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Màu chữ"
            type="color"
            value={config.textColor || '#ffffff'}
            onChange={(e) => handleChange('textColor', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={config.backgroundOverlay || false}
                onChange={(e) => handleChange('backgroundOverlay', e.target.checked)}
              />
            }
            label="Thêm lớp phủ tối"
          />
        </Grid>
        {config.backgroundOverlay && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Độ mờ overlay (0-1)"
              type="number"
              value={config.overlayOpacity || 0.5}
              onChange={(e) => handleChange('overlayOpacity', parseFloat(e.target.value))}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
            />
          </Grid>
        )}
      </Grid>

      {/* Layout Options */}
      <Divider />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Layout Options
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Chiều cao</InputLabel>
            <Select
              value={config.height}
              label="Chiều cao"
              onChange={(e) => handleChange('height', e.target.value)}
            >
              <MenuItem value="small">Nhỏ (400px)</MenuItem>
              <MenuItem value="medium">Trung bình (600px)</MenuItem>
              <MenuItem value="large">Lớn (800px)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Căn chỉnh</InputLabel>
            <Select
              value={config.alignment}
              label="Căn chỉnh"
              onChange={(e) => handleChange('alignment', e.target.value)}
            >
              <MenuItem value="left">Trái</MenuItem>
              <MenuItem value="center">Giữa</MenuItem>
              <MenuItem value="right">Phải</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* CTA Buttons */}
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Call-to-Action Buttons
        </Typography>
        <Button startIcon={<AddIcon />} onClick={addButton} size="small">
          Thêm nút
        </Button>
      </Box>
      {config.ctaButtons.map((button, index) => (
        <Paper key={index} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Text"
                value={button.text}
                onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Link"
                value={button.link}
                onChange={(e) => handleButtonChange(index, 'link', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Style</InputLabel>
                <Select
                  value={button.style}
                  label="Style"
                  onChange={(e) => handleButtonChange(index, 'style', e.target.value)}
                >
                  <MenuItem value="contained">Contained</MenuItem>
                  <MenuItem value="outlined">Outlined</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Color</InputLabel>
                <Select
                  value={button.color || 'primary'}
                  label="Color"
                  onChange={(e) => handleButtonChange(index, 'color', e.target.value)}
                >
                  <MenuItem value="primary">Primary</MenuItem>
                  <MenuItem value="secondary">Secondary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <IconButton onClick={() => removeButton(index)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

// ============================================
// FEATURE CARDS CONFIG FORM
// ============================================
interface FeatureCardsConfigFormProps {
  config: FeatureCardsConfig;
  onChange: (config: FeatureCardsConfig) => void;
}

export const FeatureCardsConfigForm: React.FC<FeatureCardsConfigFormProps> = ({
  config,
  onChange,
}) => {
  const handleChange = (field: keyof FeatureCardsConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleCardChange = (index: number, field: string, value: any) => {
    const newCards = [...config.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    handleChange('cards', newCards);
  };

  const addCard = () => {
    handleChange('cards', [
      ...config.cards,
      {
        id: `card-${Date.now()}`,
        icon: 'star',
        title: 'Tiêu đề',
        description: 'Mô tả ngắn',
      },
    ]);
  };

  const removeCard = (index: number) => {
    handleChange('cards', config.cards.filter((_, i) => i !== index));
  };

  // Common Material Icons for quick selection
  const commonIcons = [
    { name: 'star', label: 'Star (⭐)' },
    { name: 'school', label: 'School (🎓)' },
    { name: 'people', label: 'People (👥)' },
    { name: 'trending_up', label: 'Trending Up (📈)' },
    { name: 'verified', label: 'Verified (✅)' },
    { name: 'workspace_premium', label: 'Premium (🏆)' },
    { name: 'lightbulb', label: 'Lightbulb (💡)' },
    { name: 'emoji_events', label: 'Trophy (🏅)' },
    { name: 'support_agent', label: 'Support (🎧)' },
    { name: 'security', label: 'Security (🔒)' },
    { name: 'favorite', label: 'Heart (❤️)' },
    { name: 'thumb_up', label: 'Thumb Up (👍)' },
    { name: 'military_tech', label: 'Medal (🎖️)' },
    { name: 'groups', label: 'Groups (👨‍👩‍👧‍👦)' },
    { name: 'card_giftcard', label: 'Gift (🎁)' },
    { name: 'language', label: 'Language (🌐)' },
    { name: 'menu_book', label: 'Book (📖)' },
    { name: 'psychology', label: 'Psychology (🧠)' },
    { name: 'campaign', label: 'Campaign (📢)' },
    { name: 'celebration', label: 'Celebration (🎉)' },
    { name: 'done_all', label: 'Done All (✅✅)' },
    { name: 'rocket_launch', label: 'Rocket (🚀)' },
    { name: 'auto_awesome', label: 'Awesome (✨)' },
    { name: 'leaderboard', label: 'Leaderboard (📊)' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Feature Cards Configuration
      </Typography>

      {/* Header */}
      <TextField
        fullWidth
        label="Tiêu đề section (tùy chọn)"
        value={config.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
      />
      <TextField
        fullWidth
        label="Mô tả phụ (tùy chọn)"
        value={config.subtitle || ''}
        onChange={(e) => handleChange('subtitle', e.target.value)}
      />

      {/* Style Options */}
      <Divider />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Style Options
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Số cột</InputLabel>
            <Select
              value={config.columns}
              label="Số cột"
              onChange={(e) => handleChange('columns', e.target.value)}
            >
              <MenuItem value={2}>2 cột</MenuItem>
              <MenuItem value={3}>3 cột</MenuItem>
              <MenuItem value={4}>4 cột</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Kiểu card</InputLabel>
            <Select
              value={config.cardStyle}
              label="Kiểu card"
              onChange={(e) => handleChange('cardStyle', e.target.value)}
            >
              <MenuItem value="flat">Flat</MenuItem>
              <MenuItem value="raised">Raised</MenuItem>
              <MenuItem value="outlined">Outlined</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Màu icon"
            type="color"
            value={config.iconColor || '#1976d2'}
            onChange={(e) => handleChange('iconColor', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Màu nền"
            type="color"
            value={config.backgroundColor || '#ffffff'}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Cards */}
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Cards
        </Typography>
        <Button startIcon={<AddIcon />} onClick={addCard} size="small">
          Thêm card
        </Button>
      </Box>
      {config.cards.map((card, index) => (
        <Paper key={card.id} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">Card {index + 1}</Typography>
                <IconButton onClick={() => removeCard(index)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Icon (tên Material Icon)"
                value={card.icon}
                onChange={(e) => handleCardChange(index, 'icon', e.target.value)}
                size="small"
                placeholder="vd: star, school, people..."
                helperText={
                  <span>
                    Xem tất cả icons tại{' '}
                    <a
                      href="https://fonts.google.com/icons?icon.set=Material+Icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1976d2' }}
                    >
                      Material Icons
                    </a>
                  </span>
                }
                InputProps={{
                  startAdornment: (
                    <Box sx={{
                      width: 32,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      flexShrink: 0
                    }}>
                      {card.icon && (
                        <span className="material-icons" style={{ fontSize: 20, color: '#666' }}>
                          {card.icon}
                        </span>
                      )}
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                💡 Icons phổ biến (click để chọn):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {commonIcons.map((icon) => (
                  <Chip
                    key={icon.name}
                    icon={<span className="material-icons" style={{ fontSize: 16 }}>{icon.name}</span>}
                    label={icon.label}
                    onClick={() => handleCardChange(index, 'icon', icon.name)}
                    size="small"
                    variant={card.icon === icon.name ? 'filled' : 'outlined'}
                    color={card.icon === icon.name ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={card.title}
                onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={card.description}
                onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                multiline
                rows={2}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link (tùy chọn)"
                value={card.link || ''}
                onChange={(e) => handleCardChange(index, 'link', e.target.value)}
                size="small"
                placeholder="https://..."
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

// ============================================
// STATISTICS CONFIG FORM
// ============================================
interface StatisticsConfigFormProps {
  config: StatisticsConfig;
  onChange: (config: StatisticsConfig) => void;
}

export const StatisticsConfigForm: React.FC<StatisticsConfigFormProps> = ({
  config,
  onChange,
}) => {
  const handleChange = (field: keyof StatisticsConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleStatChange = (index: number, field: string, value: any) => {
    const newStats = [...config.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    handleChange('stats', newStats);
  };

  const addStat = () => {
    handleChange('stats', [
      ...config.stats,
      {
        id: `stat-${Date.now()}`,
        number: '100+',
        label: 'Label',
      },
    ]);
  };

  const removeStat = (index: number) => {
    handleChange('stats', config.stats.filter((_, i) => i !== index));
  };

  // Reuse common icons from Feature Cards
  const popularIcons = [
    { name: 'people', label: 'People' },
    { name: 'school', label: 'School' },
    { name: 'star', label: 'Star' },
    { name: 'trending_up', label: 'Trending' },
    { name: 'verified', label: 'Verified' },
    { name: 'emoji_events', label: 'Trophy' },
    { name: 'workspace_premium', label: 'Premium' },
    { name: 'leaderboard', label: 'Stats' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Statistics Configuration
      </Typography>

      {/* Style Options */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Số cột</InputLabel>
            <Select
              value={config.columns}
              label="Số cột"
              onChange={(e) => handleChange('columns', e.target.value)}
            >
              <MenuItem value={2}>2 cột</MenuItem>
              <MenuItem value={3}>3 cột</MenuItem>
              <MenuItem value={4}>4 cột</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Màu nền"
            type="color"
            value={config.backgroundColor || '#1976d2'}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Màu chữ"
            type="color"
            value={config.textColor || '#ffffff'}
            onChange={(e) => handleChange('textColor', e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Stats */}
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Statistics
        </Typography>
        <Button startIcon={<AddIcon />} onClick={addStat} size="small">
          Thêm thống kê
        </Button>
      </Box>
      {config.stats.map((stat, index) => (
        <Paper key={stat.id} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">Thống kê {index + 1}</Typography>
                <IconButton onClick={() => removeStat(index)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số (vd: 1000+ hoặc 95%)"
                value={stat.number}
                onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nhãn"
                value={stat.label}
                onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Icon (tùy chọn)"
                value={stat.icon || ''}
                onChange={(e) => handleStatChange(index, 'icon', e.target.value)}
                size="small"
                placeholder="Để trống hoặc nhập tên icon..."
                helperText="Nhập tên Material Icon hoặc chọn từ danh sách bên dưới"
                InputProps={{
                  startAdornment: (
                    <Box sx={{
                      width: 32,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      flexShrink: 0
                    }}>
                      {stat.icon && (
                        <span className="material-icons" style={{ fontSize: 20, color: '#666' }}>
                          {stat.icon}
                        </span>
                      )}
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                💡 Icons phổ biến cho thống kê (click để chọn):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                  label="Không dùng icon"
                  onClick={() => handleStatChange(index, 'icon', '')}
                  size="small"
                  variant={!stat.icon ? 'filled' : 'outlined'}
                  color={!stat.icon ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
                {popularIcons.map((icon) => (
                  <Chip
                    key={icon.name}
                    icon={<span className="material-icons" style={{ fontSize: 16 }}>{icon.name}</span>}
                    label={icon.label}
                    onClick={() => handleStatChange(index, 'icon', icon.name)}
                    size="small"
                    variant={stat.icon === icon.name ? 'filled' : 'outlined'}
                    color={stat.icon === icon.name ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

// ============================================
// COURSE CARDS CONFIG FORM
// ============================================
interface CourseCardsConfigFormProps {
  config: CourseCardsConfig;
  onChange: (config: CourseCardsConfig) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export const CourseCardsConfigForm: React.FC<CourseCardsConfigFormProps> = ({
  config,
  onChange,
  onUploadImage,
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleChange = (field: keyof CourseCardsConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleCourseChange = (index: number, field: string, value: any) => {
    const newCourses = [...config.courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    handleChange('courses', newCourses);
  };

  const addCourse = () => {
    handleChange('courses', [
      ...config.courses,
      {
        id: `course-${Date.now()}`,
        image: '',
        title: 'Tên khóa học',
        description: 'Mô tả khóa học',
        ctaText: 'Đăng ký ngay',
        ctaLink: '#',
      },
    ]);
  };

  const removeCourse = (index: number) => {
    handleChange('courses', config.courses.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      setUploadingIndex(index);
      try {
        const url = await onUploadImage(file);
        handleCourseChange(index, 'image', url);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Course Cards Configuration
      </Typography>

      {/* Header */}
      <TextField
        fullWidth
        label="Tiêu đề section (tùy chọn)"
        value={config.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
      />
      <TextField
        fullWidth
        label="Mô tả phụ (tùy chọn)"
        value={config.subtitle || ''}
        onChange={(e) => handleChange('subtitle', e.target.value)}
      />

      {/* Style Options */}
      <Divider />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Style Options
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Số cột</InputLabel>
            <Select
              value={config.columns}
              label="Số cột"
              onChange={(e) => handleChange('columns', e.target.value)}
            >
              <MenuItem value={2}>2 cột</MenuItem>
              <MenuItem value={3}>3 cột</MenuItem>
              <MenuItem value={4}>4 cột</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={config.showPrice}
                onChange={(e) => handleChange('showPrice', e.target.checked)}
              />
            }
            label="Hiển thị giá"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Màu nền"
            type="color"
            value={config.backgroundColor || '#f9f9f9'}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Courses */}
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Khóa học
        </Typography>
        <Button startIcon={<AddIcon />} onClick={addCourse} size="small">
          Thêm khóa học
        </Button>
      </Box>
      {config.courses.map((course, index) => (
        <Paper key={course.id} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">Khóa học {index + 1}</Typography>
                <IconButton onClick={() => removeCourse(index)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id={`course-image-upload-${index}`}
                type="file"
                onChange={(e) => handleImageUpload(index, e)}
              />
              <label htmlFor={`course-image-upload-${index}`}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  disabled={uploadingIndex === index}
                  fullWidth
                  size="small"
                >
                  {uploadingIndex === index
                    ? 'Đang tải...'
                    : course.image
                      ? 'Đổi ảnh'
                      : 'Tải ảnh khóa học'}
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên khóa học"
                value={course.title}
                onChange={(e) => handleCourseChange(index, 'title', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Badge (HOT, MỚI...)"
                value={course.badge || ''}
                onChange={(e) => handleCourseChange(index, 'badge', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={course.description}
                onChange={(e) => handleCourseChange(index, 'description', e.target.value)}
                multiline
                rows={2}
                size="small"
              />
            </Grid>
            {config.showPrice && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá"
                    value={course.price || ''}
                    onChange={(e) => handleCourseChange(index, 'price', e.target.value)}
                    size="small"
                    placeholder="5.000.000đ"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá gốc (gạch ngang)"
                    value={course.originalPrice || ''}
                    onChange={(e) => handleCourseChange(index, 'originalPrice', e.target.value)}
                    size="small"
                    placeholder="7.000.000đ"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Text nút CTA"
                value={course.ctaText}
                onChange={(e) => handleCourseChange(index, 'ctaText', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Link nút CTA"
                value={course.ctaLink}
                onChange={(e) => handleCourseChange(index, 'ctaLink', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};
