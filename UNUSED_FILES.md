# Danh sách các file không được sử dụng trong Frontend

## Các file có thể xóa an toàn

### 1. File trùng lặp hoặc không được import

#### `src/lib/theme.ts`

- **Lý do**: File này không được import ở đâu cả
- **Thay thế**: Hệ thống đang sử dụng `src/theme/index.ts` (được import trong App.tsx)
- **Hành động**: Có thể xóa an toàn

#### `src/pages/home/FeedbackHome.tsx`

- **Lý do**: File này không được import ở đâu cả
- **Thay thế**: Hệ thống đang sử dụng `src/components/features/home/FeedbackHome.tsx` (được import trong InteractiveHome.tsx)
- **Hành động**: Có thể xóa an toàn

#### `src/pages/home/Footer.tsx`

- **Lý do**: File này không được import ở đâu cả
- **Thay thế**: Hệ thống đang sử dụng `src/components/layouts/Footer.tsx`
- **Hành động**: Có thể xóa an toàn

#### `src/assets/react.svg`

- **Lý do**: File này không được import ở đâu cả
- **Hành động**: Có thể xóa an toàn (nếu không cần cho logo React)

### 2. File chỉ được dùng trong test

#### `src/hooks/useDebounce.ts`

- **Lý do**: Chỉ được dùng trong test file `hooks/__tests__/useDebounce.test.ts`
- **Thay thế**: Hệ thống đang sử dụng `src/hooks/common/useDebounce.ts` trong code thực tế
- **Lưu ý**: File này được export trong `hooks/index.ts` nhưng không có code nào import từ đó
- **Hành động**: Có thể xóa nếu không cần test cho file này, hoặc giữ lại nếu muốn test riêng

### 3. File test (tùy chọn)

Các file test sau đây chỉ cần thiết nếu bạn đang chạy test:

- `src/hooks/__tests__/useDebounce.test.ts`
- `src/components/features/parent/__tests__/ParentTable.test.tsx`
- `src/components/common/__tests__/VirtualList.test.tsx`
- `src/components/common/__tests__/SearchInput.test.tsx`
- `src/components/common/__tests__/LoadingSpinner.test.tsx`
- `src/components/common/__tests__/FilterSelect.test.tsx`

**Lưu ý**: Các file test này nên giữ lại nếu bạn có kế hoạch chạy test trong tương lai.

### 4. File development helper (tùy chọn)

#### `src/utils/testHelpers.ts`

- **Lý do**: Chỉ được sử dụng trong development mode để hỗ trợ test nhanh
- **Hành động**: Có thể giữ lại nếu cần, hoặc xóa nếu không dùng

## Tóm tắt

### Các file nên xóa ngay:

1. ✅ `src/lib/theme.ts`
2. ✅ `src/pages/home/FeedbackHome.tsx`
3. ✅ `src/pages/home/Footer.tsx`
4. ✅ `src/assets/react.svg`
5. ⚠️ `src/hooks/useDebounce.ts` (chỉ xóa nếu không cần test)

### Các file nên giữ lại:

- Tất cả các file test (nếu có kế hoạch chạy test)
- `src/utils/testHelpers.ts` (nếu cần cho development)

## Lệnh để xóa các file không cần thiết

```bash
# Xóa các file không được sử dụng
rm src/lib/theme.ts
rm src/pages/home/FeedbackHome.tsx
rm src/pages/home/Footer.tsx
rm src/assets/react.svg

# Xóa useDebounce.ts nếu không cần test
rm src/hooks/useDebounce.ts

# Cập nhật hooks/index.ts sau khi xóa useDebounce.ts
# Xóa dòng: export { useDebounce } from './useDebounce';
```

## Lưu ý

Sau khi xóa các file, cần kiểm tra:

1. Xóa import trong `src/hooks/index.ts` nếu xóa `useDebounce.ts`
2. Đảm bảo không có file nào khác đang import các file đã xóa
3. Chạy `npm run build` để đảm bảo không có lỗi
