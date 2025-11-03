import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField, Typography, FormControl, InputLabel } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import UploadIcon from '@mui/icons-material/Upload';

export type ItemType = 'text' | 'image' | 'input';

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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                  label="Loại thành phần"
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="text">Văn bản</MenuItem>
                  <MenuItem value="image">Hình ảnh</MenuItem>
                  <MenuItem value="input">Input field</MenuItem>
                </Select>
              </FormControl>
            </Grid>

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
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onAdd} variant="contained">Thêm thành phần</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;
