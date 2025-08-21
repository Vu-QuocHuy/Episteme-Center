# Environment Configuration

Dự án sử dụng environment variables để cấu hình các tham số khác nhau cho từng môi trường.

## 📁 Environment Files

- `.env` - Development environment (local)
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.example` - Template file với tất cả variables có sẵn

## 🔧 Setup

1. Copy `.env.example` thành `.env`:

```bash
copy .env.example .env
```

2. Cập nhật các giá trị trong `.env` cho môi trường local của bạn.

## 📋 Environment Variables

### API Configuration

- `VITE_API_URL` - Base URL của API backend
- `VITE_API_TIMEOUT` - Timeout cho API calls (milliseconds)

### App Configuration

- `VITE_APP_NAME` - Tên ứng dụng
- `VITE_APP_VERSION` - Version của ứng dụng

### Features

- `VITE_ENABLE_DEBUG` - Bật/tắt debug mode
- `VITE_ENABLE_ANALYTICS` - Bật/tắt analytics
- `VITE_ENABLE_NOTIFICATIONS` - Bật/tắt notifications
- `VITE_ENABLE_MOCK_API` - Sử dụng mock API thay vì real API

### UI Configuration

- `VITE_DEFAULT_THEME` - Theme mặc định (light/dark)
- `VITE_DEFAULT_LANGUAGE` - Ngôn ngữ mặc định (vi/en)
- `VITE_SIDEBAR_WIDTH` - Độ rộng sidebar (pixels)

### Storage Configuration

- `VITE_STORAGE_PREFIX` - Prefix cho localStorage keys
- `VITE_TOKEN_EXPIRY` - Thời gian hết hạn token (seconds)

### Development Tools

- `VITE_SHOW_DEBUG_INFO` - Hiển thị debug info trong console

## 🚀 Build Commands

### Development

```bash
npm run dev                 # Local development
npm run dev:staging         # Development với staging config
```

### Build

```bash
npm run build              # Production build
npm run build:staging      # Staging build
npm run build:prod         # Production build (explicit)
```

### Preview

```bash
npm run preview            # Preview production build
npm run preview:staging    # Preview staging build
```

## 🔐 Security Notes

1. **Không commit file `.env`** - File này chứa config local và không nên được commit
2. **Sử dụng `.env.example`** - Đây là template file an toàn để commit
3. **Environment-specific files** - `.env.staging` và `.env.production` chỉ nên chứa config mẫu, không chứa sensitive data thực tế

## 🛠 Validation

Application sẽ tự động validate environment variables khi khởi động:

- Kiểm tra các variables bắt buộc
- Hiển thị warning nếu thiếu variables
- Throw error nếu thiếu variables quan trọng

## 🔍 Debugging

Để debug environment configuration:

1. Bật `VITE_ENABLE_DEBUG=true`
2. Kiểm tra console log khi app khởi động
3. Sử dụng `npm run env:check` để kiểm tra cấu hình

## 📝 Example

```bash
# .env file example
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=English Center Management
VITE_ENABLE_DEBUG=true
VITE_DEFAULT_THEME=light
```

## 🔄 Adding New Variables

1. Thêm variable vào `.env.example`
2. Cập nhật type definitions trong `src/types/env.d.ts`
3. Thêm vào config object trong `src/config/environment.ts`
4. Cập nhật validation nếu cần thiết
