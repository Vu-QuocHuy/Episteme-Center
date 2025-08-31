import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { uploadAvatarAPI } from '../../services/api';
import { uploadToCloudinary } from '../../services/cloudinary';
import { useAuth } from '../../contexts/AuthContext';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  size?: number;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  size = 120,
  onAvatarUpdate,
}) => {
  const { updateUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    setIsDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      // First, upload to Cloudinary
      const cloudinaryData = await uploadToCloudinary(selectedFile);

      // Then, update avatar in your backend
      const avatarData = {
        imageUrl: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
      };

      const response = await uploadAvatarAPI(avatarData);

      if (response.data) {
        // Update user context
        if (updateUser) {
          updateUser({ ...response.data.user });
        }

        // Call callback if provided
        if (onAvatarUpdate) {
          onAvatarUpdate(cloudinaryData.secure_url);
        }

        // Close dialog
        setIsDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl('');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: 'primary.main',
            fontSize: `${size * 0.4}px`,
            border: '4px solid white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          src={currentAvatar}
          alt={userName}
          onClick={handleAvatarClick}
        >
          {getInitials(userName)}
        </Avatar>
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            bgcolor: 'primary.main',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
          onClick={handleAvatarClick}
        >
          <CameraIcon sx={{ color: 'white', fontSize: 20 }} />
        </IconButton>
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Cập nhật ảnh đại diện</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {previewUrl ? (
              <Card sx={{ maxWidth: 300, mx: 'auto' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Xem trước
                  </Typography>
                  <Avatar
                    src={previewUrl}
                    sx={{
                      width: 150,
                      height: 150,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {getInitials(userName)}
                  </Avatar>
                  <Button
                    variant="outlined"
                    onClick={handleFileInputClick}
                    startIcon={<CloudUploadIcon />}
                  >
                    Chọn ảnh khác
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ maxWidth: 300, mx: 'auto' }}>
                <CardContent>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Chọn ảnh đại diện
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Hỗ trợ: JPG, PNG, GIF
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Kích thước tối đa: 5MB
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleFileInputClick}
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 2 }}
                  >
                    Chọn ảnh
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={uploading}>
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : null}
          >
            {uploading ? 'Đang tải lên...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvatarUpload;
