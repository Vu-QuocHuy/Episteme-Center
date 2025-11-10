# 👨‍🏫 Hướng dẫn trang "Đội ngũ giảng viên"

## 📋 Tổng quan

Trang "Đội ngũ giảng viên" hiển thị **TẤT CẢ** giảng viên của trung tâm với:
- ✅ Grid layout 4 cột mỗi hàng
- ✅ Hiển thị 8 giảng viên ban đầu (2 hàng)
- ✅ Nút "Xem thêm" để hiển thị tất cả
- ✅ Click vào card để xem chi tiết giảng viên
- ✅ Responsive trên mọi device

---

## 🎯 Cách sử dụng

### **Bước 1: Tạo menu "Giới thiệu" (nếu chưa có)**

1. Vào **Menu Management**
2. Click **"Thêm Menu"**
3. Điền:
   ```yaml
   Tiêu đề: Giới thiệu
   Slug: gioi-thieu
   Order: 1
   Active: ✓
   ```
4. Click **"Tạo"**

### **Bước 2: Tạo submenu "Đội ngũ giảng viên"**

1. Trong Menu Management, tìm menu **"Giới thiệu"**
2. Click nút **[➕]** (Tạo submenu)
3. Điền:
   ```yaml
   Tiêu đề: Đội ngũ giảng viên
   Slug: gioi-thieu/giao-vien
   Order: 1
   Active: ✓
   ```
4. Click **"Tạo"**

### **Bước 3: Test**

1. Vào trang chủ
2. Hover vào **"Giới thiệu"** trong header
3. Click **"Đội ngũ giảng viên"**
4. Trang sẽ hiển thị tất cả giảng viên!

---

## 🎨 Giao diện

### **Desktop (4 cột):**
```
┌─────────────────────────────────────────────┐
│       Đội ngũ giảng viên                    │
│       X giảng viên chất lượng cao           │
│                                             │
│  ┌────┬────┬────┬────┐                     │
│  │GV 1│GV 2│GV 3│GV 4│  ← Hàng 1           │
│  └────┴────┴────┴────┘                     │
│  ┌────┬────┬────┬────┐                     │
│  │GV 5│GV 6│GV 7│GV 8│  ← Hàng 2           │
│  └────┴────┴────┴────┘                     │
│                                             │
│       [Xem thêm (X giảng viên)]            │
└─────────────────────────────────────────────┘
```

### **Tablet (2 cột):**
```
┌──────────────────────┐
│  Đội ngũ giảng viên  │
│                      │
│  ┌────┬────┐         │
│  │GV 1│GV 2│         │
│  ├────┼────┤         │
│  │GV 3│GV 4│         │
│  └────┴────┘         │
│                      │
│  [Xem thêm]          │
└──────────────────────┘
```

### **Mobile (1 cột):**
```
┌────────────┐
│ Đội ngũ GV │
│            │
│ ┌────┐     │
│ │GV 1│     │
│ ├────┤     │
│ │GV 2│     │
│ └────┘     │
│            │
│ [Xem thêm] │
└────────────┘
```

---

## 📊 Thông tin hiển thị

Mỗi card giảng viên có:

### **1. Avatar**
- Ảnh vuông (1:1)
- Fallback: Chữ cái đầu tên

### **2. Tên**
- Font size: 1.1rem
- Font weight: Bold
- Color: Black

### **3. Chuyên môn**
- Màu: Primary (xanh)
- Font weight: 600
- Ví dụ: "IELTS, TOEIC"

### **4. Bằng cấp**
- Label: "Bằng cấp:"
- Font size: 0.85rem
- Color: Grey

### **5. Mô tả**
- Giới hạn 2 dòng
- Text overflow: Ellipsis (...)
- Font size: 0.85rem

### **6. Nút "Xem chi tiết"**
- Style: Outlined button
- Hover: Filled background

---

## 🔧 Cấu hình

### **URL Routes:**

Trang này có **2 routes**:

1. `/giao-vien` - Route trực tiếp
2. `/gioi-thieu/giao-vien` - Route theo menu structure

**⚠️ Lưu ý:** Menu submenu phải có slug chính xác là `gioi-thieu/giao-vien`

### **API Endpoint:**

```typescript
getAllTeachersAPI({
  page: 1,
  limit: 100
})
```

**Filters:**
- Chỉ hiển thị giảng viên active (`isActive !== false`)
- Không filter theo `typical` (hiển thị tất cả)

### **Initial Display:**

```typescript
const INITIAL_DISPLAY_COUNT = 8; // 2 hàng x 4 cột
```

Có thể thay đổi trong `src/pages/AllTeachersPage.tsx`

---

## 💡 So sánh với FeaturedTeachersHome

### **FeaturedTeachersHome (Trang chủ):**
- ✅ Chỉ giảng viên **tiêu biểu** (`typical: true`)
- ✅ Hiển thị dạng **Slider**
- ✅ Auto-play
- ✅ 3 items mỗi slide

### **AllTeachersPage (Đội ngũ GV):**
- ✅ **TẤT CẢ** giảng viên
- ✅ Hiển thị dạng **Grid**
- ✅ 4 cột mỗi hàng
- ✅ Nút "Xem thêm"

---

## 🎯 Use Cases

### **1. Trường hợp ít giảng viên (≤ 8)**
```
Kết quả:
- Hiển thị tất cả trong 2 hàng
- KHÔNG có nút "Xem thêm"
- Gọn gàng, vừa vặn
```

### **2. Trường hợp nhiều giảng viên (> 8)**
```
Ban đầu:
- Hiển thị 8 giảng viên đầu tiên
- Nút "Xem thêm (X giảng viên)"

Sau khi click "Xem thêm":
- Hiển thị TẤT CẢ
- Nút đổi thành "Thu gọn"
```

---

## 🔄 Logic "Xem thêm"

```typescript
const [showAll, setShowAll] = useState(false);

const displayedTeachers = showAll
  ? teachers              // Hiển thị tất cả
  : teachers.slice(0, 8); // Chỉ 8 đầu

const hasMore = teachers.length > 8;

<Button onClick={() => setShowAll(!showAll)}>
  {showAll ? 'Thu gọn' : `Xem thêm (${teachers.length - 8} giáo viên)`}
</Button>
```

---

## 🎨 Customization

### **Thay đổi số lượng hiển thị ban đầu:**

File: `src/pages/AllTeachersPage.tsx`

```typescript
const INITIAL_DISPLAY_COUNT = 12; // Thay 8 thành 12 (3 hàng)
```

### **Thay đổi số cột:**

```typescript
<Grid item xs={12} sm={6} md={3} key={teacher.id}>
                           ↑     ↑     ↑
                        Mobile Tablet Desktop
                        (1 cột)(2 cột)(4 cột)
```

Muốn 3 cột trên desktop:
```typescript
<Grid item xs={12} sm={6} md={4} key={teacher.id}>
```

### **Thay đổi title:**

```typescript
<Typography variant="h3">
  Đội ngũ giảng viên  ← Đổi chỗ này
</Typography>

<Typography variant="subtitle1">
  {teachers.length} giảng viên chất lượng cao  ← Hoặc chỗ này
</Typography>
```

---

## 🐛 Troubleshooting

### **Vấn đề: Trang không hiển thị**

**Nguyên nhân:** Menu slug không đúng

**Giải pháp:**
```
Slug menu phải là: gioi-thieu/giao-vien
(Chính xác, không space, không dấu)
```

### **Vấn đề: Hiện 404 Not Found**

**Nguyên nhân:** Route bị DynamicMenuPage catch trước

**Giải pháp:**
- Route `/gioi-thieu/giao-vien` phải đặt **TRƯỚC** route `/:slug`
- Đã fix sẵn trong code

### **Vấn đề: Không có giảng viên nào**

**Nguyên nhân:**
1. Database chưa có giảng viên
2. Tất cả giảng viên đều `isActive: false`

**Giải pháp:**
1. Vào Admin → Teacher Management
2. Thêm giảng viên mới
3. Hoặc active giảng viên hiện tại

### **Vấn đề: Card bị vỡ layout**

**Nguyên nhân:** Tên hoặc mô tả quá dài

**Giải pháp:**
- Mô tả đã được giới hạn 2 dòng với ellipsis
- Tên giảng viên nên ≤ 30 ký tự

---

## ✅ Checklist triển khai

- [ ] Tạo menu "Giới thiệu"
- [ ] Tạo submenu "Đội ngũ giảng viên" với slug `gioi-thieu/giao-vien`
- [ ] Active menu
- [ ] Có ít nhất 1 giảng viên active trong database
- [ ] Test trên desktop
- [ ] Test trên mobile
- [ ] Test nút "Xem thêm"
- [ ] Test click vào card → Chi tiết giảng viên

---

## 📸 Screenshots (Conceptual)

### **Before "Xem thêm":**
```
[Card 1] [Card 2] [Card 3] [Card 4]
[Card 5] [Card 6] [Card 7] [Card 8]

      [Xem thêm (12 giáo viên)]
```

### **After "Xem thêm":**
```
[Card 1] [Card 2] [Card 3] [Card 4]
[Card 5] [Card 6] [Card 7] [Card 8]
[Card 9] [Card 10] [Card 11] [Card 12]
[Card 13] [Card 14] [Card 15] [Card 16]
[Card 17] [Card 18] [Card 19] [Card 20]

          [Thu gọn]
```

---

## 🚀 Next Steps

Sau khi có trang "Đội ngũ giảng viên", bạn có thể:

1. **Thêm filter/search**
   - Filter theo chuyên môn
   - Search theo tên

2. **Thêm sorting**
   - Sắp xếp theo tên
   - Sắp xếp theo chuyên môn

3. **Pagination thật**
   - Thay "Xem thêm" bằng pagination
   - Load on-demand từ API

4. **Animation**
   - Fade in khi load thêm
   - Smooth scroll

---

## 📞 Support

Nếu có vấn đề:
1. Check console log (F12)
2. Verify menu slug
3. Check API response
4. Test với data mock

---

**Created:** November 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
