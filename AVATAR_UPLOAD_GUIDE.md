# Hướng dẫn sử dụng tính năng Upload Avatar

## Tổng quan

Tính năng upload avatar đã được tích hợp vào tất cả các trang profile của các role khác nhau (Admin, Teacher, Parent, Student). Người dùng có thể cập nhật ảnh đại diện của mình thông qua giao diện thân thiện.

## Các thành phần đã được cập nhật

### 1. API Service

- **File**: `src/services/api.ts`
- **Endpoint**: `PATCH /user/avatar`
- **Method**: `uploadAvatarAPI(data: UploadAvatarData)`
- **Data format**:
  ```typescript
  {
    imageUrl: string; // URL của ảnh từ Cloudinary
    publicId: string; // Public ID của ảnh từ Cloudinary
  }
  ```

### 2. Cloudinary Service

- **File**: `src/services/cloudinary.ts`
- **Function**: `uploadToCloudinary(file: File)`
- **Cấu hình**:
  - Cloud Name: `dcbwhzsu9`
  - Upload Preset: `test`

### 3. AvatarUpload Component

- **File**: `src/components/common/AvatarUpload.tsx`
- **Tính năng**:
  - Upload ảnh với preview
  - Validation file type và size
  - Tích hợp với Cloudinary và backend API
  - Cập nhật user context tự động

### 4. Các trang Profile đã được cập nhật

- `src/pages/Profile/AdminProfile.tsx`
- `src/pages/Profile/TeacherProfile.tsx`
- `src/pages/Profile/ParentProfile.tsx`
- `src/pages/Profile/StudentProfile.tsx`

## Cách sử dụng

### 1. Trong trang Profile

Người dùng có thể:

1. Click vào avatar hiện tại hoặc icon camera
2. Chọn file ảnh từ máy tính
3. Xem preview ảnh trước khi upload
4. Click "Cập nhật" để hoàn tất

### 2. Validation

- **File type**: Chỉ chấp nhận file ảnh (JPG, PNG, GIF)
- **File size**: Tối đa 5MB
- **Preview**: Hiển thị ảnh trước khi upload

### 3. Quy trình upload

1. User chọn file ảnh
2. File được upload lên Cloudinary
3. Lấy URL và Public ID từ Cloudinary
4. Gọi API backend để cập nhật avatar
5. Cập nhật user context
6. Hiển thị avatar mới

## Cấu hình Cloudinary

### 1. Thay đổi cấu hình

Trong file `src/services/cloudinary.ts`:

```typescript
const CLOUDINARY_CLOUD_NAME = "your_cloud_name";
const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset";
```

### 2. Tạo Upload Preset

1. Đăng nhập vào Cloudinary Dashboard
2. Vào Settings > Upload
3. Tạo Upload Preset mới
4. Set Signing Mode thành "Unsigned"
5. Copy Upload Preset name

## Tích hợp với các component khác

### 1. Sử dụng AvatarUpload component

```typescript
import { AvatarUpload } from "../components/common";

<AvatarUpload
  currentAvatar={user.avatar}
  userName={user.name}
  size={120}
  onAvatarUpdate={(newAvatarUrl) => {
    console.log("Avatar updated:", newAvatarUrl);
  }}
/>;
```

### 2. Props

- `currentAvatar`: URL avatar hiện tại
- `userName`: Tên user để hiển thị initials
- `size`: Kích thước avatar (default: 120)
- `onAvatarUpdate`: Callback khi avatar được cập nhật

## Xử lý lỗi

### 1. Lỗi upload

- Hiển thị thông báo lỗi trong dialog
- Tự động clear lỗi khi chọn file mới
- Retry mechanism

### 2. Lỗi validation

- File type không hợp lệ
- File size quá lớn
- Network error

## Bảo mật

### 1. File validation

- Kiểm tra file type
- Giới hạn file size
- Sanitize file name

### 2. Cloudinary security

- Sử dụng unsigned upload
- Upload preset với giới hạn phù hợp
- CORS configuration

## Testing

### 1. Test cases

- Upload ảnh hợp lệ
- Upload file không phải ảnh
- Upload file quá lớn
- Network error handling
- Cancel upload

### 2. Manual testing

1. Mở trang profile
2. Click vào avatar
3. Chọn file ảnh
4. Verify preview
5. Click upload
6. Verify avatar được cập nhật

## Troubleshooting

### 1. Lỗi thường gặp

- **Cloudinary upload failed**: Kiểm tra cloud name và upload preset
- **API call failed**: Kiểm tra authentication token
- **File not selected**: Đảm bảo chọn file trước khi upload

### 2. Debug

- Kiểm tra console logs
- Verify network requests
- Check Cloudinary dashboard

## Future improvements

### 1. Tính năng có thể thêm

- Crop ảnh trước khi upload
- Multiple file formats support
- Drag & drop upload
- Progress bar cho upload
- Delete avatar functionality

### 2. Performance optimization

- Image compression
- Lazy loading
- Caching strategy
