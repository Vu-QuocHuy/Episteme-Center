import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField, Typography, FormControl, InputLabel } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import UploadIcon from '@mui/icons-material/Upload';
import {
  HeroConfigForm,
  FeatureCardsConfigForm,
  StatisticsConfigForm,
  CourseCardsConfigForm,
} from './ConfigForms';
import {
  ComponentType,
  HeroConfig,
  FeatureCardsConfig,
  StatisticsConfig,
  CourseCardsConfig,
} from './types';

export type ItemType = ComponentType;

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  newItem: { i: string; type: ItemType; content: string };
  setNewItem: (updater: (prev: { i: string; type: ItemType; content: string }) => { i: string; type: ItemType; content: string }) => void;
  editorContent: string;
  setEditorContent: (val: string) => void;
  onUploadImage: (file: File) => Promise<string>; // returns URL
  uploading: boolean;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ open, onClose, onAdd, newItem, setNewItem, editorContent, setEditorContent, onUploadImage, uploading }) => {
  // State for advanced component configs
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    title: 'Tiêu đề chính',
    subtitle: 'Mô tả phụ',
    ctaButtons: [],
    alignment: 'center',
    height: 'medium',
  });

  const [featureCardsConfig, setFeatureCardsConfig] = useState<FeatureCardsConfig>({
    cards: [],
    columns: 3,
    cardStyle: 'raised',
  });

  const [statisticsConfig, setStatisticsConfig] = useState<StatisticsConfig>({
    stats: [],
    columns: 4,
  });

  const [courseCardsConfig, setCourseCardsConfig] = useState<CourseCardsConfig>({
    courses: [],
    layout: 'grid',
    columns: 3,
    showPrice: true,
  });

  // Reset configs when type changes
  useEffect(() => {
    if (newItem.type === 'hero' && heroConfig.ctaButtons.length === 0) {
      setHeroConfig({
        ...heroConfig,
        ctaButtons: [{ text: 'Tìm hiểu thêm', link: '#', style: 'contained', color: 'primary' }],
      });
    }
  }, [newItem.type]);

  // Handle add with proper config serialization
  const handleAdd = () => {
    // For advanced components, serialize config to content
    if (newItem.type === 'hero') {
      setNewItem(prev => ({ ...prev, content: JSON.stringify(heroConfig) }));
    } else if (newItem.type === 'feature-cards') {
      setNewItem(prev => ({ ...prev, content: JSON.stringify(featureCardsConfig) }));
    } else if (newItem.type === 'statistics') {
      setNewItem(prev => ({ ...prev, content: JSON.stringify(statisticsConfig) }));
    } else if (newItem.type === 'course-cards') {
      setNewItem(prev => ({ ...prev, content: JSON.stringify(courseCardsConfig) }));
    }

    // Small delay to ensure state update
    setTimeout(() => {
      onAdd();
    }, 50);
  };

  // Parse existing config when editing
  useEffect(() => {
    if (newItem.content && newItem.i) {
      try {
        const parsed = JSON.parse(newItem.content);
        if (newItem.type === 'hero') setHeroConfig(parsed);
        else if (newItem.type === 'feature-cards') setFeatureCardsConfig(parsed);
        else if (newItem.type === 'statistics') setStatisticsConfig(parsed);
        else if (newItem.type === 'course-cards') setCourseCardsConfig(parsed);
      } catch (e) {
        // Content is not JSON, likely old text/image/input type
      }
    }
  }, [newItem.i, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {newItem.i ? 'Chỉnh sửa thành phần' : 'Thêm thành phần mới'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại thành phần</InputLabel>
                <Select
                  value={newItem.type}
                  label="Loại thành phần"
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="text">📝 Văn bản (Rich Text)</MenuItem>
                  <MenuItem value="image">🖼️ Hình ảnh</MenuItem>
                  <MenuItem value="input">📋 Input field</MenuItem>
                  <MenuItem value="hero">🎯 Hero Section</MenuItem>
                  <MenuItem value="feature-cards">⭐ Feature Cards</MenuItem>
                  <MenuItem value="statistics">📊 Statistics Counter</MenuItem>
                  <MenuItem value="course-cards">📚 Course Cards</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* BASIC COMPONENTS */}
            {newItem.type === 'text' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Nội dung văn bản:</Typography>
                <Editor
                  apiKey="z7rs4ijsr5qcpob6tbzosk50cpg1otyearqb6i08r0c4s7og"
                  initialValue=""
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'],
                    toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                    skin: 'oxide',
                    content_css: 'default',
                    promotion: false,
                    referrer_policy: 'no-referrer'
                  }}
                  value={editorContent}
                  onEditorChange={setEditorContent}
                />
              </Grid>
            )}

            {newItem.type === 'image' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Ảnh thành phần:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="new-item-image-upload"
                    type="file"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await onUploadImage(f);
                      if (url) setNewItem(prev => ({ ...prev, content: url }));
                    }}
                  />
                  <label htmlFor="new-item-image-upload">
                    <Button variant="outlined" component="span" startIcon={<UploadIcon />} disabled={uploading}>
                      {uploading ? 'Đang tải ảnh...' : 'Chọn ảnh'}
                    </Button>
                  </label>
                  <TextField
                    placeholder="Hoặc dán URL ảnh"
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                    sx={{ flex: 1, minWidth: 240 }}
                  />
                </Box>
                {newItem.content && (
                  <Box sx={{ mt: 2 }}>
                    <img src={newItem.content} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                  </Box>
                )}
              </Grid>
            )}

            {newItem.type === 'input' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Giá trị mặc định:</Typography>
                <TextField
                  fullWidth
                  placeholder="Nhập giá trị mặc định cho input field"
                  value={newItem.content}
                  onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                />
              </Grid>
            )}

            {/* ADVANCED COMPONENTS */}
            {newItem.type === 'hero' && (
              <Grid item xs={12}>
                <HeroConfigForm
                  config={heroConfig}
                  onChange={setHeroConfig}
                  onUploadImage={onUploadImage}
                />
              </Grid>
            )}

            {newItem.type === 'feature-cards' && (
              <Grid item xs={12}>
                <FeatureCardsConfigForm
                  config={featureCardsConfig}
                  onChange={setFeatureCardsConfig}
                />
              </Grid>
            )}

            {newItem.type === 'statistics' && (
              <Grid item xs={12}>
                <StatisticsConfigForm
                  config={statisticsConfig}
                  onChange={setStatisticsConfig}
                />
              </Grid>
            )}

            {newItem.type === 'course-cards' && (
              <Grid item xs={12}>
                <CourseCardsConfigForm
                  config={courseCardsConfig}
                  onChange={setCourseCardsConfig}
                  onUploadImage={onUploadImage}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleAdd} variant="contained">
          {newItem.i ? 'Cập nhật' : 'Thêm thành phần'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;
