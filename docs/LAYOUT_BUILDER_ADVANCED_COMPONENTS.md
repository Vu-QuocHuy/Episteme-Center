# 🎨 Hướng dẫn sử dụng Advanced Components trong LayoutBuilder

## 📋 Tổng quan

LayoutBuilder giờ đã được nâng cấp với **4 component chuyên biệt** cho website giáo dục:

1. **🎯 Hero Section** - Banner lớn ấn tượng với CTA buttons
2. **⭐ Feature Cards** - Grid các thẻ tính năng/ưu điểm
3. **📊 Statistics Counter** - Bộ đếm hiển thị số liệu thống kê
4. **📚 Course Cards** - Grid thẻ khóa học với ảnh và giá

---

## 🚀 Cách sử dụng

### Bước 1: Truy cập Layout Builder

1. Đăng nhập với quyền **Admin**
2. Vào **Menu Management**
3. Chọn menu item bạn muốn tạo/chỉnh sửa nội dung
4. Click nút **"Layout"** → Mở Layout Builder

### Bước 2: Thêm Component

1. Click nút **"Thêm thành phần"**
2. Dialog mở ra, chọn **"Loại thành phần"**:
   - 📝 Văn bản (Rich Text)
   - 🖼️ Hình ảnh
   - 📋 Input field
   - **🎯 Hero Section** ⭐ MỚI
   - **⭐ Feature Cards** ⭐ MỚI
   - **📊 Statistics Counter** ⭐ MỚI
   - **📚 Course Cards** ⭐ MỚI

3. Form cấu hình tương ứng sẽ hiển thị

### Bước 3: Cấu hình Component

Mỗi component có form riêng với các tùy chọn chi tiết.

### Bước 4: Xem trước và Lưu

- Component sẽ hiển thị trong canvas với **placeholder preview**
- Click **"Lưu Layout"** để tạo HTML cuối cùng
- Vào trang public để xem kết quả đầy đủ

---

## 🎯 Component 1: HERO SECTION

### Mô tả
Banner lớn, ấn tượng đặt ở đầu trang với:
- Tiêu đề chính + mô tả phụ
- Ảnh nền hoặc màu gradient
- 1-2 nút Call-to-Action (CTA)
- Overlay tối để nổi bật text

### Cách cấu hình

**1. Nội dung:**
- **Tiêu đề chính**: Tiêu đề lớn, thu hút
- **Mô tả phụ**: Mô tả ngắn, giới thiệu

**2. Background:**
- **Tải ảnh nền**: Click "Tải ảnh nền" để chọn ảnh
- **Màu nền**: Nếu không có ảnh, chọn màu nền
- **Màu chữ**: Màu của text (mặc định trắng)
- **Lớp phủ tối**: Checkbox để thêm overlay làm mờ ảnh nền
- **Độ mờ overlay**: 0-1 (0 = trong suốt, 1 = đen)

**3. Layout:**
- **Chiều cao**: Nhỏ (400px) / Trung bình (600px) / Lớn (800px)
- **Căn chỉnh**: Trái / Giữa / Phải

**4. CTA Buttons:**
- Click **"Thêm nút"** để thêm button
- Mỗi button có:
  - **Text**: Nội dung nút (vd: "Đăng ký ngay")
  - **Link**: URL khi click (vd: `/lien-he/tu-van`)
  - **Style**: Contained (nền màu) / Outlined (viền)
  - **Color**: Primary (xanh) / Secondary (hồng)

### Ví dụ sử dụng

**Use case 1: Banner trang khóa học**
```
Tiêu đề: "Khóa học IELTS 7.0+"
Mô tả: "Cam kết đầu ra hoặc học lại miễn phí"
Ảnh nền: Ảnh lớp học
Overlay: Có, độ mờ 0.5
Buttons:
  - "Xem chi tiết" (Outlined, Primary) → /khoa-hoc/ielts
  - "Đăng ký ngay" (Contained, Secondary) → /lien-he/tu-van
```

**Use case 2: Banner trang giới thiệu**
```
Tiêu đề: "Trung tâm Anh ngữ hàng đầu Việt Nam"
Mô tả: "Hơn 10 năm kinh nghiệm - 10,000+ học viên"
Ảnh nền: Ảnh cơ sở trung tâm
Chiều cao: Lớn (800px)
Căn chỉnh: Giữa
```

---

## ⭐ Component 2: FEATURE CARDS

### Mô tả
Grid các thẻ tính năng/ưu điểm, mỗi thẻ có:
- Icon đại diện
- Tiêu đề
- Mô tả ngắn
- Link (tùy chọn)

### Cách cấu hình

**1. Header (tùy chọn):**
- **Tiêu đề section**: Tiêu đề cho cả section (vd: "Tại sao chọn chúng tôi?")
- **Mô tả phụ**: Mô tả ngắn cho section

**2. Style Options:**
- **Số cột**: 2 / 3 / 4 cột
- **Kiểu card**: Flat (phẳng) / Raised (nổi) / Outlined (viền)
- **Màu icon**: Chọn màu cho icon
- **Màu nền**: Màu nền cho section

**3. Cards:**
- Click **"Thêm card"** để thêm thẻ mới
- Mỗi card có:
  - **Icon**: Chọn từ danh sách Material Icons
  - **Tiêu đề**: Tiêu đề ngắn gọn
  - **Mô tả**: Mô tả chi tiết
  - **Link**: URL khi click vào card (tùy chọn)

### Material Icons có sẵn

- `star` ⭐ - Ngôi sao
- `school` 🎓 - Trường học
- `people` 👥 - Người
- `trending_up` 📈 - Xu hướng tăng
- `verified` ✅ - Xác minh
- `workspace_premium` 🏆 - Cao cấp
- `lightbulb` 💡 - Ý tưởng
- `emoji_events` 🥇 - Sự kiện
- `support_agent` 🎧 - Hỗ trợ
- `security` 🔒 - Bảo mật
- `favorite` ❤️ - Yêu thích
- `thumb_up` 👍 - Like

### Ví dụ sử dụng

**Use case: Ưu điểm trung tâm**
```
Tiêu đề section: "Tại sao chọn chúng tôi?"
Mô tả: "4 lý do học viên tin tưởng chọn chúng tôi"
Số cột: 4
Kiểu card: Raised

Cards:
1. Icon: school
   Tiêu đề: "Giảng viên chất lượng"
   Mô tả: "100% giảng viên có bằng cấp quốc tế"

2. Icon: workspace_premium
   Tiêu đề: "Cam kết đầu ra"
   Mô tả: "Đảm bảo kết quả hoặc học lại miễn phí"

3. Icon: people
   Tiêu đề: "Lớp học nhỏ"
   Mô tả: "Tối đa 15 học viên/lớp, tương tác tốt"

4. Icon: support_agent
   Tiêu đề: "Hỗ trợ 24/7"
   Mô tả: "Giải đáp thắc mắc mọi lúc, mọi nơi"
```

---

## 📊 Component 3: STATISTICS COUNTER

### Mô tả
Bộ đếm hiển thị số liệu thống kê ấn tượng:
- Số lượng lớn (học viên, năm kinh nghiệm, etc.)
- Icon đi kèm
- Label mô tả

### Cách cấu hình

**1. Style Options:**
- **Số cột**: 2 / 3 / 4 cột
- **Màu nền**: Thường dùng màu đậm (vd: xanh dương)
- **Màu chữ**: Màu text (thường trắng nếu nền tối)

**2. Statistics:**
- Click **"Thêm thống kê"** để thêm item mới
- Mỗi stat có:
  - **Số**: Số hiển thị (vd: "10000+" hoặc "95%")
  - **Nhãn**: Mô tả (vd: "Học viên")
  - **Icon**: Icon đi kèm (tùy chọn)

### Ví dụ sử dụng

**Use case: Thành tích trung tâm**
```
Màu nền: #1976d2 (xanh dương)
Màu chữ: #ffffff (trắng)
Số cột: 4

Statistics:
1. Số: "10000+"
   Nhãn: "Học viên"
   Icon: people

2. Số: "50+"
   Nhãn: "Giảng viên"
   Icon: school

3. Số: "95%"
   Nhãn: "Hài lòng"
   Icon: star

4. Số: "10+"
   Nhãn: "Năm kinh nghiệm"
   Icon: trending_up
```

---

## 📚 Component 4: COURSE CARDS

### Mô tả
Grid thẻ khóa học chuyên nghiệp với:
- Ảnh thumbnail
- Tên khóa học
- Mô tả ngắn
- Giá (có thể gạch ngang giá cũ)
- Badge (HOT, MỚI, SALE)
- Nút CTA

### Cách cấu hình

**1. Header (tùy chọn):**
- **Tiêu đề section**: Tiêu đề chung
- **Mô tả phụ**: Mô tả ngắn

**2. Style Options:**
- **Số cột**: 2 / 3 / 4 cột
- **Hiển thị giá**: Checkbox để bật/tắt hiển thị giá
- **Màu nền**: Màu nền section

**3. Khóa học:**
- Click **"Thêm khóa học"** để thêm card
- Mỗi course có:
  - **Tải ảnh**: Ảnh thumbnail khóa học
  - **Tên khóa học**: Tiêu đề ngắn gọn
  - **Badge**: Tag (HOT, MỚI, SALE) - tùy chọn
  - **Mô tả**: Mô tả chi tiết khóa học
  - **Giá**: Giá hiện tại
  - **Giá gốc**: Giá cũ (gạch ngang) - tùy chọn
  - **Text nút CTA**: Nội dung nút (vd: "Đăng ký ngay")
  - **Link nút CTA**: URL khi click

### Ví dụ sử dụng

**Use case: Danh sách khóa học nổi bật**
```
Tiêu đề section: "Khóa học nổi bật"
Mô tả: "Các khóa học được yêu thích nhất tại trung tâm"
Số cột: 3
Hiển thị giá: Có

Courses:
1. Ảnh: /images/ielts-course.jpg
   Tên: "Luyện thi IELTS 7.0+"
   Badge: "HOT"
   Mô tả: "Khóa học chuyên sâu, cam kết đầu ra IELTS 7.0+"
   Giá: "5.000.000đ"
   Giá gốc: "7.000.000đ"
   CTA: "Đăng ký ngay" → /khoa-hoc/ielts

2. Ảnh: /images/toeic-course.jpg
   Tên: "Luyện thi TOEIC 800+"
   Badge: "MỚI"
   Mô tả: "Khóa học mới nhất, phương pháp hiện đại"
   Giá: "4.000.000đ"
   CTA: "Xem chi tiết" → /khoa-hoc/toeic

3. Ảnh: /images/business-english.jpg
   Tên: "Tiếng Anh Doanh nghiệp"
   Mô tả: "Tiếng Anh chuyên ngành cho người đi làm"
   Giá: "6.000.000đ"
   CTA: "Tư vấn ngay" → /lien-he/tu-van
```

---

## 🎨 Tips & Best Practices

### 1. Thứ tự Component hợp lý

**Trang Giới thiệu:**
```
1. Hero Section (Banner chào mừng)
2. Feature Cards (Ưu điểm trung tâm)
3. Statistics (Thành tích)
4. Text (Giới thiệu chi tiết)
```

**Trang Khóa học:**
```
1. Hero Section (Banner khóa học)
2. Course Cards (Danh sách khóa học)
3. Feature Cards (Lợi ích khi học)
4. Statistics (Thành tích học viên)
```

**Trang Landing Page:**
```
1. Hero Section (Offer chính)
2. Statistics (Số liệu ấn tượng)
3. Course Cards (Sản phẩm)
4. Feature Cards (Tại sao chọn chúng tôi)
```

### 2. Màu sắc hài hòa

- **Hero Section**: Ảnh nền đẹp + Overlay 0.4-0.6 + Text trắng
- **Feature Cards**: Nền trắng/xám nhạt + Icon màu primary (#1976d2)
- **Statistics**: Nền tối (xanh dương, đen) + Text trắng
- **Course Cards**: Nền xám nhạt (#f9f9f9)

### 3. Responsive

Tất cả component đã được optimize responsive:
- Desktop: Hiển thị đầy đủ cột
- Tablet: Tự động giảm cột
- Mobile: 1-2 cột, stack vertical

### 4. Performance

- **Optimize ảnh**: Nén ảnh trước khi upload (< 500KB)
- **Giới hạn items**:
  - Feature Cards: 3-6 items
  - Statistics: 3-4 items
  - Course Cards: 3-6 items
- **Lazy loading**: Ảnh tự động lazy load

### 5. SEO

- **Hero Section**: Dùng H1 cho title
- **Feature/Course Cards**: Dùng H2 cho section title
- **Alt text**: Luôn đặt alt text cho ảnh

---

## 🐛 Troubleshooting

### Vấn đề: Icons không hiển thị?

**Giải pháp**:
- Material Icons đã được thêm vào `index.html`
- Clear cache trình duyệt (Ctrl + Shift + R)
- Kiểm tra kết nối internet

### Vấn đề: Component không hiển thị trong canvas?

**Giải pháp**:
- Advanced components hiển thị dạng **placeholder** trong canvas
- Xem preview đầy đủ bằng cách click **"Xem trước"** hoặc **"Lưu"** rồi vào trang public

### Vấn đề: Config bị mất khi edit?

**Giải pháp**:
- Luôn click **"Cập nhật"** sau khi edit
- Kiểm tra config đã được parse đúng (không có lỗi JSON)

### Vấn đề: Layout bị vỡ trên mobile?

**Giải pháp**:
- Tất cả component đã responsive, nhưng:
- Kiểm tra ảnh có đúng kích thước không
- Test trên nhiều device khác nhau

---

## 📖 Component thêm trong tương lai

Các component đã được define nhưng chưa implement (có thể thêm sau):

- **🎬 Video Player** - Nhúng video YouTube/Vimeo
- **❓ FAQ Accordion** - Câu hỏi thường gặp
- **📧 Contact Form** - Form liên hệ tích hợp
- **🖼️ Gallery Grid** - Lưới ảnh với lightbox
- **💰 Pricing Table** - Bảng giá so sánh
- **🗺️ Map** - Nhúng Google Maps
- **👨‍🏫 Teacher Cards** - Grid giới thiệu giáo viên
- **💬 Testimonials** - Slider đánh giá học viên

---

## ✅ Checklist khi tạo trang mới

- [ ] Tạo menu item trong Menu Management
- [ ] Click "Layout" để vào Layout Builder
- [ ] Thêm Hero Section ở đầu trang
- [ ] Thêm 2-3 section nội dung (Feature/Course/Statistics)
- [ ] Điền đầy đủ nội dung cho từng component
- [ ] Upload ảnh chất lượng cao
- [ ] Set màu sắc hài hòa
- [ ] Click "Lưu Layout"
- [ ] Vào trang public để kiểm tra
- [ ] Test responsive trên mobile
- [ ] Bật menu item (isActive = true)

---

## 🎉 Kết luận

Với 4 advanced components này, bạn có thể tạo các trang web đẹp, chuyên nghiệp cho trung tâm tiếng Anh mà **không cần code**!

**Bắt đầu thử ngay:**
1. Vào Menu Management
2. Tạo menu "Giới thiệu"
3. Click "Layout" → Thêm Hero Section
4. Điền thông tin và Lưu
5. Xem kết quả tuyệt vời! 🚀

---

**Lưu ý**: File này được tạo tự động bởi hệ thống. Nếu có thắc mắc, liên hệ Admin.

