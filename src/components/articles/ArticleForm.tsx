import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { createArticleAPI, updateArticleAPI, ArticleData } from '../../services/articles';
import { uploadFileAPI } from '../../services/files';
import { MenuItem as MenuItemType } from '../../types';
import BaseDialog from '../common/BaseDialog';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';

interface ArticleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article?: {
    id: string;
    title: string;
    content: string;
    menuId: string;
    order?: number;
    isActive?: boolean;
  } | null;
  menuItems: MenuItemType[];
  defaultMenuId?: string;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  open,
  onClose,
  onSuccess,
  article,
  menuItems,
  defaultMenuId
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [menuId, setMenuId] = useState(defaultMenuId || '');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setMenuId(article.menuId);
      setOrder(article.order || 1);
      setIsActive(article.isActive ?? true);
    } else {
      setTitle('');
      setContent('');
      setMenuId(defaultMenuId || '');
      setOrder(1);
      setIsActive(true);
    }
    setError(null);
  }, [article, open, defaultMenuId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung');
      return;
    }
    if (!menuId) {
      setError('Vui lòng chọn menu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const articleData: ArticleData = {
        title: title.trim(),
        content: content.trim(),
        menuId,
        order,
        isActive
      };

      if (article) {
        await updateArticleAPI(article.id, articleData);
      } else {
        await createArticleAPI(articleData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const response = await uploadFileAPI(file);
      return response.data?.data?.url || '';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Render menu options recursively
  const renderMenuOptions = (items: MenuItemType[], level: number = 0): React.ReactNode[] => {
    const options: React.ReactNode[] = [];

    items.forEach(item => {
      options.push(
        <MenuItem key={item.id} value={item.id} sx={{ pl: level * 2 }}>
          {level > 0 && '└─ '}
          {item.title}
        </MenuItem>
      );

      // Support both childrenMenu (from transformed data) and children (from API)
      const children = (item as any).childrenMenu || item.children || [];
      if (children.length > 0) {
        options.push(...renderMenuOptions(children, level + 1));
      }
    });

    return options;
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={article ? 'Chỉnh sửa Bài viết' : 'Tạo Bài viết Mới'}
      icon={article ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      error={error}
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || uploading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {loading ? <CircularProgress size={20} /> : article ? 'Cập nhật' : 'Tạo'}
          </Button>
        </>
      }
    >
        <Box sx={{ p: 4 }}>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Menu</InputLabel>
            <Select
              value={menuId}
              onChange={(e) => setMenuId(e.target.value)}
              label="Menu"
            >
              {renderMenuOptions(menuItems)}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              type="number"
              label="Thứ tự"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              margin="normal"
              sx={{ width: 120 }}
            />
            <FormControl margin="normal" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                label="Trạng thái"
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Nội dung:
            </Typography>
            <Editor
              apiKey="z7rs4ijsr5qcpob6tbzosk50cpg1otyearqb6i08r0c4s7og"
              initialValue=""
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code | removeformat | help',
                skin: 'oxide',
                content_css: 'default',
                promotion: false,
                referrer_policy: 'no-referrer',
                images_upload_handler: async (blobInfo: any) => {
                  try {
                    const file = new File([blobInfo.blob()], blobInfo.filename(), {
                      type: blobInfo.blob().type
                    });
                    const url = await handleImageUpload(file);
                    return url;
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    throw new Error('Không thể tải ảnh lên');
                  }
                }
              }}
              value={content}
              onEditorChange={setContent}
            />
            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Đang tải ảnh...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
    </BaseDialog>
  );
};

export default ArticleForm;

