import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Grid,
  Chip,

} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,

} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import BaseDialog from '../../common/BaseDialog';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Advertisement } from '../../../types';
import { validateAdvertisement } from '../../../validations/advertisementValidation';

interface AdvertisementFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (advertisementData: Partial<Advertisement>) => Promise<void>;
  advertisement?: Advertisement | null;
  loading?: boolean;
}

interface FormData {
  title: string;
  shortDescription: string;
  content: string;
  type: string;
  position: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
}

interface FormErrors {
  title?: string;
  shortDescription?: string;
  content?: string;
  type?: string;
  position?: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  open,
  onClose,
  onSubmit,
  advertisement,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    shortDescription: '',
    content: '',
    type: '',
    position: '',
    imageUrl: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 1
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [imagePreview, setImagePreview] = useState<string>('');

  const types = [
    { value: 'banner', label: 'Banner' },
    { value: 'popup', label: 'Popup' },
    { value: 'slider', label: 'Slider' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'notification', label: 'Thông báo' }
  ];

  const positions = [
    { value: 'top', label: 'Đầu trang' },
    { value: 'bottom', label: 'Cuối trang' },
    { value: 'left', label: 'Bên trái' },
    { value: 'right', label: 'Bên phải' },
    { value: 'center', label: 'Giữa trang' },
    { value: 'homepage', label: 'Trang chủ' },
    { value: 'sidebar', label: 'Thanh bên' }
  ];

  useEffect(() => {
         if (advertisement) {
       setFormData({
         title: advertisement.title || '',
         shortDescription: advertisement.description || '',
         content: advertisement.content || '',
         type: advertisement.type || '',
         position: advertisement.position || '',
         imageUrl: advertisement.imageUrl || '',
                 linkUrl: advertisement.linkUrl || '',
        startDate: advertisement.startDate ? new Date(advertisement.startDate).toISOString().split('T')[0] : '',
        endDate: advertisement.endDate ? new Date(advertisement.endDate).toISOString().split('T')[0] : '',
        isActive: advertisement.isActive ?? true,
        priority: advertisement.priority ?? 1
       });
      setImagePreview(advertisement.imageUrl || '');
    } else {
      resetForm();
    }
  }, [advertisement, open]);

         const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      content: '',
      type: '',
      position: '',
      imageUrl: '',
      linkUrl: '',
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 1
    });
    setErrors({});
    setImagePreview('');
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = validateAdvertisement(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
                    const advertisementData: Partial<Advertisement> = {
        title: formData.title,
        description: formData.shortDescription,
        content: formData.content,
        type: formData.type,
        position: formData.position,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        isActive: formData.isActive,
        priority: formData.priority
      };

      await onSubmit(advertisementData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting advertisement form:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'banner': 'primary',
      'popup': 'secondary',
      'slider': 'success',
      'sidebar': 'warning',
      'notification': 'error'
    };
    return typeColors[type] || 'default';
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={advertisement ? 'Chỉnh sửa quảng cáo' : 'Thêm quảng cáo mới'}
      icon={advertisement ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
            startIcon={<CancelIcon />}
            variant="outlined"
            disabled={loading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                bgcolor: 'rgba(102, 126, 234, 0.04)'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            variant="contained"
            disabled={loading}
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
            {loading ? 'Đang lưu...' : (advertisement ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </>
      }
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
        <Box mt={2}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tiêu đề quảng cáo"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
                placeholder="VD: Khóa học tiếng Anh mới"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel>Loại quảng cáo</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Loại quảng cáo"
                >
                  {types.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Chip
                        label={type.label}
                        color={getTypeColor(type.value) as any}
                        size="small"
                        variant="outlined"
                      />
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && (
                  <Typography variant="caption" color="error" mt={0.5}>
                    {errors.type}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.position}>
                <InputLabel>Vị trí hiển thị</InputLabel>
                <Select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  label="Vị trí hiển thị"
                >
                  {positions.map((position) => (
                    <MenuItem key={position.value} value={position.value}>
                      {position.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.position && (
                  <Typography variant="caption" color="error" mt={0.5}>
                    {errors.position}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Link quảng cáo"
                value={formData.linkUrl}
                onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                error={!!errors.linkUrl}
                helperText={errors.linkUrl || 'Không bắt buộc'}
                placeholder="https://example.com"
              />
            </Grid>

                         <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Mô tả ngắn"
                 multiline
                 rows={2}
                 value={formData.shortDescription}
                 onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                 error={!!errors.shortDescription}
                 helperText={errors.shortDescription}
                 required
                 placeholder="Mô tả ngắn về quảng cáo..."
               />
             </Grid>

             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Nội dung"
                 multiline
                 rows={3}
                 value={formData.content}
                 onChange={(e) => handleInputChange('content', e.target.value)}
                 error={!!errors.content}
                 helperText={errors.content}
                 placeholder="Nội dung chi tiết về quảng cáo..."
               />
             </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" mt={2}>
                Hình ảnh quảng cáo
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="center" mb={2}>
                <Box position="relative">
                  <Avatar
                    src={imagePreview}
                    alt={formData.title}
                    sx={{
                      width: 200,
                      height: 120,
                      borderRadius: 2,
                      bgcolor: theme.palette.grey[200]
                    }}
                  >
                    {!imagePreview && <ImageIcon sx={{ fontSize: 60 }} />}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                Nhấn vào biểu tượng camera để chọn hình ảnh
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Yêu cầu hình ảnh:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Định dạng: JPG, PNG, GIF<br/>
                  • Kích thước tối đa: 2MB<br/>
                  • Tỷ lệ khuyến nghị: 16:9 hoặc 4:3<br/>
                  • Độ phân giải tối thiểu: 800x600px
                </Typography>
                {errors.imageUrl && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.imageUrl}
                  </Alert>
                )}
              </Box>
            </Grid>

            {/* Date Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" mt={2}>
                Thời gian hiển thị
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                error={!!errors.startDate}
                helperText={errors.startDate}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                error={!!errors.endDate}
                helperText={errors.endDate || 'Không bắt buộc - quảng cáo sẽ hiển thị vô thời hạn'}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={formData.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                  color={formData.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleInputChange('isActive', !formData.isActive)}
                >
                  {formData.isActive ? 'Ẩn quảng cáo' : 'Hiển thị quảng cáo'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
    </BaseDialog>
  );
};

export default AdvertisementForm;
