# 📋 Hướng dẫn cấu trúc Menu và Trang chủ

## Tổng quan

Hệ thống menu được thiết kế theo nguyên tắc:

- **Trang chủ** không nằm trong menu
- **Trang chủ** được điều hướng bằng cách click vào logo/tên trung tâm ở header
- **Các trang còn lại** (Giới thiệu, Khóa học, Giáo viên, Liên hệ, v.v.) sẽ nằm trong menu

## Cấu trúc Routes

### 1. Trang chủ (Homepage)

- **Route**: `/`
- **Component**: `InteractiveHome`
- **Điều hướng**: Click vào logo "English Center" hoặc icon trường học ở header
- **Đặc điểm**:
  - Trang này có layout riêng với các section đặc biệt
  - Không cần tạo trong Menu Management
  - Nội dung được quản lý qua Banner Management, Testimonials Management, v.v.

### 2. Các trang động (Dynamic Pages)

- **Route**: `/:slug`
- **Component**: `DynamicMenuPage`
- **Điều hướng**: Click vào menu item trong header
- **Đặc điểm**:
  - Được tạo và quản lý qua Menu Management
  - Nội dung được tạo qua LayoutBuilder
  - Có thể có submenu (menu con)

## Hướng dẫn tạo Menu

### Bước 1: Truy cập Menu Management

1. Đăng nhập với quyền Admin
2. Vào **Dashboard** → **Menu Management**
3. Click nút **"Thêm Menu Mới"**

### Bước 2: Tạo Menu Items

#### ❌ KHÔNG NÊN tạo:

- Menu item có tên "Trang chủ" hoặc "Home"
- Menu item có slug `/` hoặc `/home`
- Menu item điều hướng về trang chủ

**Lý do**: Trang chủ đã được điều hướng tự động qua logo/tên trung tâm ở header.

#### ✅ NÊN tạo:

**Ví dụ cấu trúc menu chuẩn:**

```
Header
├── Logo: "English Center" (click → Trang chủ)
└── Menu Items:
    ├── Giới thiệu (/gioi-thieu)
    ├── Khóa học (/khoa-hoc)
    │   ├── Tiếng Anh Giao tiếp (/khoa-hoc/giao-tiep)
    │   ├── Tiếng Anh Thiếu nhi (/khoa-hoc/thieu-nhi)
    │   └── Luyện thi IELTS (/khoa-hoc/ielts)
    ├── Giáo viên (/giao-vien)
    ├── Tin tức (/tin-tuc)
    └── Liên hệ (/lien-he)
```

### Bước 3: Cấu hình Menu Item

Khi tạo một menu item mới:

1. **Tiêu đề** (Title): Tên hiển thị trên menu

   - Ví dụ: "Giới thiệu", "Khóa học", "Giáo viên"

2. **Slug**: URL path (không bao gồm `/`)

   - ✅ Đúng: `gioi-thieu`, `khoa-hoc`, `lien-he`
   - ❌ Sai: `/gioi-thieu`, `home`, `/`

3. **Thứ tự** (Order): Số thứ tự hiển thị (nhỏ → lớn)

   - Ví dụ: 1, 2, 3, 4, ...

4. **Trạng thái** (Active): Bật/Tắt hiển thị menu

   - ✅ Active: Menu sẽ hiển thị
   - ❌ Inactive: Menu sẽ bị ẩn

5. **Menu cha** (Parent Menu): Nếu là submenu
   - Chọn menu cha tương ứng
   - Để trống nếu là menu cấp cao nhất

### Bước 4: Tạo nội dung cho Menu

Sau khi tạo menu item, click vào nút **"Tạo nội dung"** để:

1. Mở LayoutBuilder
2. Tạo layout và nội dung cho trang
3. Lưu lại

## Logic lọc Menu trong Header

Hệ thống tự động lọc bỏ các menu items có:

- Slug = `/` hoặc `/home`
- Title = "Trang chủ" hoặc "Home" (không phân biệt chữ hoa/thường)

```typescript
// Code trong HomeHeader.tsx
const activeMenuItems = menuItems
  .filter((item) => item.isActive)
  .filter((item) => {
    const slug = item.slug?.toLowerCase().trim();
    const title = item.title?.toLowerCase().trim();
    return (
      slug !== "/" &&
      slug !== "/home" &&
      title !== "trang chủ" &&
      title !== "home"
    );
  })
  .sort((a, b) => (a.order || 0) - (b.order || 0));
```

## Ví dụ cấu hình Menu thực tế

### Menu 1: Giới thiệu

```json
{
  "title": "Giới thiệu",
  "slug": "gioi-thieu",
  "order": 1,
  "isActive": true,
  "parentId": null
}
```

### Menu 2: Khóa học (có submenu)

```json
{
  "title": "Khóa học",
  "slug": "khoa-hoc",
  "order": 2,
  "isActive": true,
  "parentId": null
}
```

**Submenu của Khóa học:**

```json
[
  {
    "title": "Tiếng Anh Giao tiếp",
    "slug": "khoa-hoc/giao-tiep",
    "order": 1,
    "isActive": true,
    "parentId": "<ID của menu Khóa học>"
  },
  {
    "title": "Tiếng Anh Thiếu nhi",
    "slug": "khoa-hoc/thieu-nhi",
    "order": 2,
    "isActive": true,
    "parentId": "<ID của menu Khóa học>"
  },
  {
    "title": "Luyện thi IELTS",
    "slug": "khoa-hoc/ielts",
    "order": 3,
    "isActive": true,
    "parentId": "<ID của menu Khóa học>"
  }
]
```

### Menu 3: Giáo viên

```json
{
  "title": "Giáo viên",
  "slug": "giao-vien",
  "order": 3,
  "isActive": true,
  "parentId": null
}
```

### Menu 4: Tin tức

```json
{
  "title": "Tin tức",
  "slug": "tin-tuc",
  "order": 4,
  "isActive": true,
  "parentId": null
}
```

### Menu 5: Liên hệ

```json
{
  "title": "Liên hệ",
  "slug": "lien-he",
  "order": 5,
  "isActive": true,
  "parentId": null
}
```

## Quản lý Trang chủ

### Nội dung có thể chỉnh sửa trên Trang chủ:

1. **Banner Carousel**

   - Path: Admin → Homepage → Banner Management
   - Thêm/sửa/xóa các banner slides

2. **Testimonials (Nhận xét học viên)**

   - Path: Admin → Homepage → Testimonials Management
   - Quản lý feedback từ học viên

3. **Footer**

   - Path: Admin → Homepage → Footer Management
   - Chỉnh sửa nội dung footer

4. **Section tĩnh**
   - Các section như "Về trung tâm", "Thống kê", "Giáo viên nổi bật"
   - Hiện tại là hard-coded trong `InteractiveHome.tsx`
   - Có thể được chuyển sang động nếu cần

## Best Practices

### 1. Đặt tên Slug

- ✅ Sử dụng chữ thường, không dấu
- ✅ Sử dụng dấu gạch ngang `-` thay vì space
- ✅ Ngắn gọn, dễ nhớ
- ❌ Tránh ký tự đặc biệt, số nhiều
- ❌ Không dùng `/` ở đầu

**Ví dụ:**

- ✅ `gioi-thieu`, `khoa-hoc`, `lien-he`
- ❌ `Giới Thiệu`, `Khóa_Học`, `/gioi-thieu`

### 2. Cấu trúc Submenu

- Submenu nên có slug bao gồm slug của parent
- Ví dụ:
  - Parent: `khoa-hoc`
  - Submenu: `khoa-hoc/giao-tiep`, `khoa-hoc/ielts`

### 3. Thứ tự hiển thị

- Sử dụng số tròn: 1, 2, 3, 4, 5...
- Để khoảng cách giữa các số (10, 20, 30) nếu muốn dễ chèn menu mới sau này

### 4. Trạng thái Active

- Chỉ bật Active khi đã có nội dung
- Tắt Active để tạm ẩn menu mà không xóa

## Troubleshooting

### Vấn đề: Menu "Trang chủ" vẫn hiển thị?

**Giải pháp**:

- Kiểm tra xem có menu item nào có title là "Trang chủ" hoặc "Home" không
- Xóa hoặc đổi tên menu đó
- Hệ thống sẽ tự động lọc bỏ các menu này

### Vấn đề: Click vào logo không về trang chủ?

**Giải pháp**:

- Clear cache trình duyệt
- Kiểm tra route `/` có được cấu hình đúng trong `App.tsx` không
- Kiểm tra component `InteractiveHome` có được import đúng không

### Vấn đề: Menu bị trùng lặp?

**Giải pháp**:

- Kiểm tra không có 2 menu items có cùng slug
- Đảm bảo mỗi menu item có ID duy nhất

### Vấn đề: Submenu không hiển thị?

**Giải pháp**:

- Kiểm tra `parentId` của submenu có đúng không
- Kiểm tra cả parent và submenu đều có `isActive = true`
- Kiểm tra parent menu có ít nhất 1 submenu active

## Kết luận

Với cấu trúc này:

- ✅ Trang chủ được tách riêng, dễ quản lý
- ✅ Menu gọn gàng, chỉ chứa các trang nội dung
- ✅ UX tốt: Logo/tên trung tâm → Trang chủ (chuẩn web design)
- ✅ Linh hoạt: Dễ dàng thêm/sửa/xóa menu items

Để biết thêm chi tiết về tạo nội dung động cho các trang menu, xem:

- [CAROUSEL_GUIDE.md](./CAROUSEL_GUIDE.md) - Hướng dẫn tạo carousel/slider
- LayoutBuilder trong Admin Dashboard - Công cụ tạo layout động
