# useLazySearch Hook

Hook tái sử dụng để thực hiện tìm kiếm với **debouncing** và **lazy loading** (infinite scroll).

## Tính năng

- ✅ **Debouncing**: Tự động trì hoãn API call khi người dùng gõ (mặc định 500ms)
- ✅ **Lazy Loading**: Load thêm dữ liệu khi scroll đến cuối danh sách
- ✅ **Load đề xuất ban đầu**: Tự động load một số kết quả khi component mount
- ✅ **Hủy request cũ**: Tự động hủy request cũ khi có request mới
- ✅ **Generic Type**: Hỗ trợ TypeScript với generic types
- ✅ **Transform function**: Cho phép transform dữ liệu từ API

## Cài đặt

Hook đã được export từ `hooks/index.ts`:

```typescript
import { useLazySearch } from '../../hooks/common/useLazySearch';
// hoặc
import { useLazySearch } from '../../hooks';
```

## Cách sử dụng

### Ví dụ cơ bản: Tìm kiếm lớp học

```typescript
import { useLazySearch } from '../../hooks/common/useLazySearch';
import { getAllClassesAPI } from '../../services/classes';

const {
  searchQuery,
  setSearchQuery,
  items: classOptions,
  loading: classLoading,
  hasMore: hasMoreClasses,
  loadMore: loadMoreClasses,
  reset: resetClassSearch
} = useLazySearch<{ id: string; name: string; grade?: number }>({
  fetchFn: async (params) => {
    const res = await getAllClassesAPI(params);
    return res.data;
  },
  enabled: openDialog, // Chỉ search khi dialog mở
  loadOnMount: true, // Load đề xuất ban đầu
  pageSize: 10,
  debounceDelay: 500,
  transformFn: (c: any) => ({
    id: c.id,
    name: c.name,
    grade: c.grade
  })
});
```

### Sử dụng với Autocomplete (Material-UI)

```tsx
<Autocomplete
  loading={classLoading}
  options={classOptions}
  getOptionLabel={(o) => o?.name || ''}
  value={classOptions.find((c) => c.id === selectedId) || null}
  onChange={(_, val) => setSelectedId(val?.id || '')}
  inputValue={searchQuery}
  onInputChange={(_, val) => setSearchQuery(val)}
  ListboxProps={{
    onScroll: (event: React.SyntheticEvent) => {
      const listboxNode = event.currentTarget;
      if (
        listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight - 5 &&
        hasMoreClasses &&
        !classLoading
      ) {
        loadMoreClasses();
      }
    }
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Chọn lớp"
      placeholder="Tìm kiếm lớp theo tên"
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {classLoading ? <CircularProgress size={16} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  )}
/>
```

### Ví dụ: Tìm kiếm học sinh

```typescript
const {
  searchQuery,
  setSearchQuery,
  items: studentOptions,
  loading: studentLoading,
  hasMore: hasMoreStudents,
  loadMore: loadMoreStudents
} = useLazySearch<Student>({
  fetchFn: async (params) => {
    const res = await getAllStudentsAPI(params);
    return res.data;
  },
  enabled: true,
  loadOnMount: false, // Không load ban đầu, chỉ khi search
  pageSize: 20,
  debounceDelay: 500
});
```

### Ví dụ: Tìm kiếm giáo viên

```typescript
const {
  searchQuery,
  setSearchQuery,
  items: teacherOptions,
  loading: teacherLoading,
  hasMore: hasMoreTeachers,
  loadMore: loadMoreTeachers
} = useLazySearch<Teacher>({
  fetchFn: async (params) => {
    const res = await getAllTeachersAPI(params);
    return res.data;
  },
  enabled: openDialog,
  loadOnMount: true,
  pageSize: 15,
  debounceDelay: 300,
  additionalParams: {
    isActive: true // Thêm filter bổ sung
  }
});
```

## API Reference

### Options

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `fetchFn` | `(params) => Promise` | **required** | Function gọi API, nhận `{ page, limit, searchQuery, ...additionalParams }` |
| `debounceDelay` | `number` | `500` | Thời gian debounce (ms) |
| `pageSize` | `number` | `10` | Số items mỗi trang |
| `loadOnMount` | `boolean` | `false` | Có load đề xuất ban đầu không |
| `enabled` | `boolean` | `true` | Có bật search không (ví dụ: khi dialog mở) |
| `additionalParams` | `Record<string, any>` | `{}` | Tham số bổ sung truyền vào `fetchFn` |
| `transformFn` | `(item: any) => T` | `undefined` | Function transform dữ liệu từ API |

### Return Values

| Property | Type | Mô tả |
|----------|------|-------|
| `searchQuery` | `string` | Query tìm kiếm hiện tại |
| `setSearchQuery` | `(query: string) => void` | Function để set search query |
| `debouncedSearch` | `string` | Query đã được debounce |
| `items` | `T[]` | Danh sách items |
| `loading` | `boolean` | Đang loading không |
| `hasMore` | `boolean` | Còn dữ liệu để load không |
| `currentPage` | `number` | Trang hiện tại |
| `totalPages` | `number` | Tổng số trang |
| `error` | `string \| null` | Lỗi nếu có |
| `loadMore` | `() => void` | Function để load thêm dữ liệu |
| `reset` | `() => void` | Reset search và clear items |
| `refresh` | `() => void` | Refresh trang hiện tại |

## Cấu trúc API Response được hỗ trợ

Hook tự động xử lý các cấu trúc API response sau:

```typescript
// Structure 1: { data: { data: { result: [], meta: {} } } }
{
  data: {
    data: {
      result: T[],
      meta: {
        totalPages: number,
        totalItems: number
      }
    }
  }
}

// Structure 2: { data: { result: [], meta: {} } }
{
  data: {
    result: T[],
    meta: {
      totalPages: number,
      totalItems: number
    }
  }
}

// Structure 3: { data: [] }
{
  data: T[]
}

// Structure 4: []
T[]
```

## Best Practices

1. **Luôn sử dụng `enabled`**: Để tránh gọi API không cần thiết
   ```typescript
   enabled: openDialog // Chỉ search khi dialog mở
   ```

2. **Sử dụng `loadOnMount` cho đề xuất**: Khi muốn hiển thị một số kết quả ban đầu
   ```typescript
   loadOnMount: true // Load đề xuất khi mở dialog
   ```

3. **Transform dữ liệu nếu cần**: Để chuẩn hóa format
   ```typescript
   transformFn: (item) => ({
     id: item.id,
     name: item.name,
     // ... transform fields
   })
   ```

4. **Xử lý scroll trong Autocomplete**: Sử dụng `ListboxProps.onScroll`
   ```typescript
   ListboxProps={{
     onScroll: (event) => {
       const node = event.currentTarget;
       if (node.scrollTop + node.clientHeight >= node.scrollHeight - 5) {
         loadMore();
       }
     }
   }}
   ```

5. **Reset khi đóng dialog**: Để clear state
   ```typescript
   const handleClose = () => {
     setOpenDialog(false);
     reset(); // Reset search state
   };
   ```

## Ví dụ hoàn chỉnh

Xem file `AdvertisementManagement.tsx` để xem ví dụ hoàn chỉnh về cách sử dụng hook này.

