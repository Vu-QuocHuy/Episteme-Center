# 🍽️ Hệ thống Quản lý Menu - English Center

## 📋 Tổng quan

Hệ thống quản lý menu được áp dụng từ dự án FE-webcntt-main, cho phép admin quản lý menu navigation một cách linh hoạt mà không cần can thiệp code.

## 🏗️ Cấu trúc Hệ thống

### **1. API Endpoints**

```
GET    /menus              - Lấy danh sách menu items
POST   /menus              - Tạo menu item mới
GET    /menus/:id          - Lấy menu item theo ID
PATCH  /menus/:id          - Cập nhật menu item
DELETE /menus/:id          - Xóa menu item
```

### **2. Data Structure**

```typescript
interface MenuItem {
  id: string;
  title: string;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  isDeleted?: boolean;
  children?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}
```

### **3. Components**

#### **📄 MenuManagement**

- **File**: `src/pages/MenuManagement/index.tsx`
- **Chức năng**: CRUD operations cho menu items
- **Features**:
  - Tạo/sửa/xóa menu items
  - Tạo submenu (hierarchical)
  - Toggle visibility (ẩn/hiện)
  - Auto-generate slug từ title
  - Accordion view cho menu structure

#### **🧭 NavigationMenu**

- **File**: `src/components/NavigationMenu/index.tsx`
- **Chức năng**: Hiển thị menu dropdown
- **Features**:
  - Dynamic menu từ API
  - Hierarchical navigation
  - Active state highlighting
  - Loading states

#### **🍞 Breadcrumb**

- **File**: `src/components/Breadcrumb/index.tsx`
- **Chức năng**: Hiển thị đường dẫn navigation
- **Features**:
  - Auto-generate từ current path
  - Link navigation
  - Loading states

#### **🎣 useMenuItems Hook**

- **File**: `src/hooks/useMenuItems.ts`
- **Chức năng**: Quản lý state và logic cho menu
- **Features**:
  - Fetch menu items từ API
  - Transform data cho navigation
  - Breadcrumb generation
  - Menu item lookup

## 🚀 Cách sử dụng

### **1. Quản lý Menu (Admin)**

```typescript
// Truy cập trang quản lý menu
// Route: /menu-management

// Tạo menu mới
const newMenu = {
  title: "Khóa học",
  slug: "khoa-hoc", // Auto-generated
  parentId: undefined, // Menu chính
  order: 1,
  isActive: true,
};

// Tạo submenu
const subMenu = {
  title: "Tiếng Anh Giao tiếp",
  slug: "tieng-anh-giao-tiep",
  parentId: "khoa-hoc-id", // ID của menu cha
  order: 1,
  isActive: true,
};
```

### **2. Hiển thị Menu trong Layout**

```typescript
import { NavigationMenu, Breadcrumb } from '../components';

// Trong Header component
const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

<Button onClick={(e) => setMenuAnchor(e.currentTarget)}>
  Menu
</Button>

<NavigationMenu
  anchorEl={menuAnchor}
  open={Boolean(menuAnchor)}
  onClose={() => setMenuAnchor(null)}
/>

// Trong Layout component
<Breadcrumb />
```

### **3. Sử dụng Hook**

```typescript
import { useMenuItems } from "../hooks/useMenuItems";

const MyComponent = () => {
  const {
    menuItems,
    loading,
    getActiveMenuItems,
    getMenuItemBySlug,
    getBreadcrumb,
  } = useMenuItems();

  // Lấy menu items cho navigation
  const activeMenus = getActiveMenuItems();

  // Tìm menu item theo slug
  const menuItem = getMenuItemBySlug("khoa-hoc");

  // Lấy breadcrumb
  const breadcrumb = getBreadcrumb("tieng-anh-giao-tiep");
};
```

## 🎯 Tính năng chính

### **1. Hierarchical Menu Support**

- ✅ Parent-child relationships
- ✅ Nested submenus
- ✅ Recursive rendering
- ✅ Unlimited depth levels

### **2. Auto Slug Generation**

```typescript
// Tự động chuyển đổi tiếng Việt
"Khóa học Tiếng Anh" → "khoa-hoc-tieng-anh"
"Giới thiệu về chúng tôi" → "gioi-thieu-ve-chung-toi"
```

### **3. Visibility Control**

- ✅ Toggle ẩn/hiện menu items
- ✅ Soft delete support
- ✅ Active/inactive states

### **4. Order Management**

- ✅ Sắp xếp thứ tự menu
- ✅ Drag & drop support (có thể thêm)

### **5. Role-Based Access**

- ✅ Admin: Full CRUD access
- ✅ Users: Read-only access
- ✅ Public: View active menus only

## 📱 Responsive Design

### **Desktop**

- Full accordion view
- Hover effects
- Dropdown menus

### **Mobile**

- Collapsible navigation
- Touch-friendly controls
- Optimized spacing

## 🔧 Customization

### **1. Styling**

```typescript
// Custom theme cho menu
const menuTheme = {
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          minWidth: 250,
          maxHeight: 400,
        },
      },
    },
  },
};
```

### **2. Icons**

```typescript
// Thêm icons cho menu items
const menuWithIcons = menuItems.map((item) => ({
  ...item,
  icon: getIconForMenu(item.slug),
}));
```

### **3. Permissions**

```typescript
// Kiểm tra quyền truy cập
const canManageMenu = user?.roles?.includes("ROLE_ADMIN");
```

## 🧪 Testing

### **1. Unit Tests**

```typescript
// Test slug generation
expect(generateSlug("Khóa học")).toBe("khoa-hoc");
expect(generateSlug("Giới thiệu")).toBe("gioi-thieu");
```

### **2. Integration Tests**

```typescript
// Test API calls
test("should create menu item", async () => {
  const response = await createMenuAPI(menuData);
  expect(response.status).toBe(200);
});
```

## 🚨 Error Handling

### **1. API Errors**

- Network errors
- Validation errors
- Permission errors

### **2. UI Feedback**

- Loading states
- Error messages
- Success notifications

## 📈 Performance

### **1. Optimization**

- Lazy loading
- Memoization
- Debounced API calls

### **2. Caching**

- Menu items caching
- Breadcrumb caching
- Local storage backup

## 🔮 Future Enhancements

### **1. Drag & Drop**

- Reorder menu items
- Move between parents
- Visual feedback

### **2. Bulk Operations**

- Bulk delete
- Bulk update
- Import/export

### **3. Advanced Features**

- Menu templates
- A/B testing
- Analytics integration

## 📚 API Documentation

### **Create Menu Item**

```http
POST /menus
Content-Type: application/x-www-form-urlencoded

title=Khóa học&slug=khoa-hoc&parentId=&order=1&isActive=true
```

### **Update Menu Item**

```http
PATCH /menus/:id
Content-Type: application/x-www-form-urlencoded

title=Khóa học mới&slug=khoa-hoc-moi&isActive=false
```

### **Delete Menu Item**

```http
DELETE /menus/:id
```

### **Toggle Visibility**

```http
PATCH /menus/:id
Content-Type: application/x-www-form-urlencoded

isActive=false
```

## 🎉 Kết luận

Hệ thống quản lý menu này cung cấp một giải pháp hoàn chỉnh cho việc quản lý navigation trong English Center, với các tính năng:

- ✅ **Flexible**: Dễ dàng thay đổi menu mà không cần code
- ✅ **Scalable**: Hỗ trợ menu không giới hạn độ sâu
- ✅ **User-friendly**: Giao diện thân thiện với người dùng
- ✅ **Performance**: Tối ưu hiệu suất và caching
- ✅ **Maintainable**: Code sạch và dễ bảo trì

Admin có thể quản lý toàn bộ navigation website một cách linh hoạt và hiệu quả!
