# Hệ thống Layout Builder - Tạo giao diện động cho Menu

## Tổng quan

Hệ thống này cho phép admin tạo giao diện động cho các trang menu mới mà không cần viết code. Admin có thể kéo thả các thành phần (text, image, input) để tạo layout tùy chỉnh.

## Cách sử dụng

### 1. Tạo Menu mới

1. Vào **Admin Dashboard** → **Menu Management**
2. Click **"Thêm Menu"**
3. Nhập:
   - **Tiêu đề**: Tên menu (ví dụ: "Về chúng tôi")
   - **URL**: Sẽ tự động tạo từ tiêu đề (ví dụ: "/ve-chung-toi")
   - **Menu cha**: Chọn nếu muốn tạo submenu
4. Click **"Tạo"**

### 2. Tạo Layout cho Menu

1. Trong Menu Management, tìm menu vừa tạo
2. Click nút **"Layout"**
3. Trong Layout Builder:
   - Nhập **"Tiêu đề bài viết"**
   - Chọn **"Ảnh tiêu đề"** (tùy chọn)
   - Click **"Thêm thành phần"**

### 3. Thêm các thành phần

#### Text (Văn bản)

- Sử dụng TinyMCE editor
- Hỗ trợ định dạng: bold, italic, lists, links, images
- Có thể chèn ảnh từ URL

#### Image (Hình ảnh)

- Nhập URL hình ảnh
- Hỗ trợ các định dạng: jpg, png, gif, webp

#### Input Field

- Tạo các trường input
- Chỉ để hiển thị thông tin

### 4. Kéo thả và tùy chỉnh

- **Kéo thả**: Di chuyển các thành phần
- **Thay đổi kích thước**: Kéo góc phải dưới để resize
- **Xóa**: Click nút "Remove" trên mỗi thành phần

### 5. Lưu Layout

1. Click **"Lưu Layout"**
2. Hệ thống sẽ:
   - Tạo bài viết mới
   - Lưu HTML layout vào database
   - Chuyển về Menu Management

### 6. Xem kết quả

- Truy cập URL menu (ví dụ: `/ve-chung-toi`)
- Trang sẽ hiển thị giao diện đã tạo
- Nếu có nhiều bài viết, sẽ hiển thị danh sách

## Cấu trúc API

### Menu API

- `POST /menus` - Tạo menu mới
- `GET /menus` - Lấy danh sách menu
- `PATCH /menus/:id` - Cập nhật menu
- `DELETE /menus/:id` - Xóa menu

### Article API

- `POST /articles` - Tạo bài viết mới
- `GET /public/:slug/articles` - Lấy bài viết theo menu slug

## Cấu trúc dữ liệu

### Menu

```json
{
  "title": "Về chúng tôi",
  "url": "/ve-chung-toi",
  "parentId": "optional-parent-id"
}
```

### Article

```json
{
  "title": "Tiêu đề bài viết",
  "content": "<HTML content>",
  "menuItemId": "menu-id",
  "file": "optional-image-file"
}
```

## Lưu ý quan trọng

1. **TinyMCE API Key**: Cần thay thế `your-tinymce-api-key` bằng API key thực
2. **File upload**: Hỗ trợ upload ảnh tiêu đề
3. **Responsive**: Layout tự động responsive trên các thiết bị
4. **Fallback**: Nếu không có bài viết, sẽ hiển thị mock content

## Troubleshooting

### Lỗi thường gặp

1. **"Cannot find module 'react-grid-layout'"**

   - Chạy: `npm install react-grid-layout`

2. **"TinyMCE not loading"**

   - Kiểm tra API key
   - Kiểm tra kết nối internet

3. **Layout không hiển thị đúng**
   - Kiểm tra HTML content trong database
   - Kiểm tra CSS styles

### Debug

- Mở Developer Tools (F12)
- Kiểm tra Console tab
- Kiểm tra Network tab khi gọi API

## Phát triển thêm

### Tính năng có thể thêm

1. **Template system**: Các layout mẫu có sẵn
2. **Theme customization**: Thay đổi màu sắc, font
3. **Advanced components**: Charts, forms, maps
4. **Version control**: Lưu lịch sử thay đổi
5. **Collaboration**: Nhiều admin cùng chỉnh sửa

### Customization

- Thay đổi grid size trong `LayoutBuilder.tsx`
- Thêm loại thành phần mới
- Tùy chỉnh TinyMCE plugins
- Thay đổi CSS styles

## Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra README này
2. Xem console errors
3. Kiểm tra API responses
4. Liên hệ team development
