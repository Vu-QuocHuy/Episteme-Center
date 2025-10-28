# English Center Management System

Hệ thống quản lý trung tâm tiếng Anh được xây dựng với React + Vite và Material-UI.

## Tính năng chính

### Quản trị viên (Admin)

- ✅ Dashboard tổng quan với thống kê
- 🔧 Quản lý lớp học (tạo, đóng, mở lớp theo năm học)
- 🔧 Quản lý giáo viên
- 🔧 Quản lý học sinh và điểm danh
- 🔧 Quản lý phụ huynh
- 🔧 Quản lý học phí và thanh toán
- 🔧 Thông báo và quảng cáo
- 🔧 Thống kê doanh thu và enrollment

### Giáo viên (Teacher)

- ✅ Dashboard cá nhân
- 🔧 Xem danh sách lớp đang dạy
- 🔧 Điểm danh học sinh
- 🔧 Xem lịch dạy và số buổi đã dạy

### Học sinh (Student)

- ✅ Dashboard cá nhân
- 🔧 Xem thông tin lớp học
- 🔧 Xem lịch sử điểm danh
- 🔧 Xem lịch học

### Phụ huynh (Parent)

- ✅ Dashboard cá nhân
- 🔧 Theo dõi thông tin con em
- 🔧 Xem điểm danh và lịch học
- 🔧 Xem học phí và thanh toán
- 🔧 Nhận thông báo từ trung tâm

## Công nghệ sử dụng

- **Frontend**: React 19 + Vite
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router v6
- **State Management**: React Context
- **Form Handling**: Custom useForm hook
- **Date Handling**: Day.js
- **Slider/Carousel**: Swiper.js
- **Charts**: Recharts
- **HTTP Client**: Axios

## Cấu trúc dự án

```
src/
├── components/           # Các component tái sử dụng
│   ├── common/          # Component chung
│   └── layout/          # Layout components
├── pages/               # Các trang theo role
│   ├── admin/           # Trang admin
│   ├── teacher/         # Trang giáo viên
│   ├── student/         # Trang học sinh
│   ├── parent/          # Trang phụ huynh
│   ├── auth/            # Trang đăng nhập
│   └── home/            # Trang chủ
├── contexts/            # React Context
├── services/            # API services
├── utils/               # Utility functions
├── hooks/               # Custom hooks
└── constants/           # Hằng số và enums
```

## Cài đặt và chạy

### 1. Clone project:

```bash
git clone https://github.com/Vu-QuocHuy/English-Center-FE.git
cd English-Center-FE
```

### 2. Cài đặt dependencies:

```bash
npm install
```

### 3. Cấu hình Backend URL:

**QUAN TRỌNG:** Chỉ cần sửa backend URL ở một nơi duy nhất!

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Mở file .env và cấu hình:
VITE_API_BASE_URL=http://103.199.18.103:8080/api/v1  # ← Sửa URL backend ở đây
VITE_USE_PROXY=true                                   # ← true = dùng proxy (dev), false = gọi trực tiếp
```

**Các trường hợp sử dụng:**

| Môi trường | VITE_USE_PROXY | VITE_API_BASE_URL |
|------------|----------------|-------------------|
| Local dev | `true` | URL backend VPS của bạn |
| Vercel production | `false` | URL backend VPS của bạn |

### 4. Chạy development server:

```bash
npm run dev
```

### 5. Mở trình duyệt tại http://localhost:3000

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Kiểm tra ESLint
- `npm run env:check` - Kiểm tra cấu hình environment
- `npm run env:setup` - Auto setup file .env từ .env.example

## Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Trong Vercel Dashboard → Settings → Environment Variables, thêm:
   ```
   VITE_API_BASE_URL=http://103.199.18.103:8080/api/v1
   VITE_USE_PROXY=false
   VITE_NODE_ENV=production
   VITE_ENABLE_DEBUG=false
   ```
4. Deploy!

**Lưu ý:** Đảm bảo backend VPS đã cấu hình CORS để chấp nhận requests từ Vercel domain.

## Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)

## 🔧 Quick Reference: Cấu hình Backend

**Để thay đổi backend URL, chỉ cần sửa file `.env`:**

```bash
# File: .env
VITE_API_BASE_URL=http://your-backend-url/api/v1  # ← Chỉ cần sửa ở đây!
VITE_USE_PROXY=true                                # true (dev) | false (production)
```

Sau khi sửa, restart dev server:
```bash
npm run dev
```

**Mọi API call trong app sẽ tự động sử dụng URL này!** Không cần sửa code.

## Roadmap

- [ ] Hoàn thiện tất cả các module quản lý
- [ ] Tích hợp backend API
- [ ] Thêm real-time notifications
- [ ] Mobile responsive optimization
- [ ] PWA support
- [ ] Backup và restore data
- [ ] Multi-language support

## Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
