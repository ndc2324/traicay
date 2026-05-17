# Fresh Fruit Store - Implementation Guide

## Các Tính Năng Được Thêm Vào

Tài liệu này mô tả các tính năng mới được thêm vào dự án Fresh Fruit Store để hoàn thành TODO list.

### 1. Cơ Sở Dữ Liệu (Database)

#### Tạo Bảng Categories
- **File**: `src/main/java/vn/nhom16/trai_cay/entity/Category.java`
- **Mô tả**: Tạo bảng categories để lưu trữ danh mục sản phẩm
- **Các trường chính**: id, name, description, imageUrl
- **Relationship**: One-to-Many với Products

#### Cập Nhật Product Entity
- **File**: `src/main/java/vn/nhom16/trai_cay/entity/Product.java`
- **Thay đổi**: Thay đổi trường `category` từ String thành ManyToOne relationship với Category entity
- **SQL Migration**: `src/main/resources/schema.sql`

#### Schema.sql Migration
- **File**: `src/main/resources/schema.sql`
- **Mô tả**: Tệp SQL hoàn chỉnh để tạo tất cả các bảng cần thiết
- **Các bảng**: users, categories, products, orders, order_items, news

---

### 2. Backend APIs

#### Category Management
- **Controller**: `src/main/java/vn/nhom16/trai_cay/controller/CategoryController.java`
- **Service**: `src/main/java/vn/nhom16/trai_cay/service/CategoryService.java`
- **Repository**: `src/main/java/vn/nhom16/trai_cay/repository/CategoryRepository.java`

**Endpoints**:
```
GET    /api/categories              - Lấy danh sách tất cả danh mục
GET    /api/categories/{id}         - Lấy danh mục theo ID
GET    /api/categories/name/{name}  - Tìm danh mục theo tên
POST   /api/categories              - Tạo danh mục mới (Admin only)
PUT    /api/categories/{id}         - Cập nhật danh mục (Admin only)
DELETE /api/categories/{id}         - Xóa danh mục (Admin only)
```

#### Product Updates
- **Updated**: `src/main/java/vn/nhom16/trai_cay/service/ProductService.java`
- **Updated**: `src/main/java/vn/nhom16/trai_cay/repository/ProductRepository.java`

**Cải tiến**:
- `getProductsByCategory()` giờ sử dụng Category object thay vì string
- Thêm `findByCategoryName()` để tìm kiếm theo tên danh mục

#### Security Updates
- **File**: `src/main/java/vn/nhom16/trai_cay/config/SecurityConfig.java`
- **Cải tiến**: Thêm role-based access control cho admin endpoints
- **Qui luật**:
  - GET endpoints: Công khai (permitAll)
  - POST/PUT/DELETE endpoints: Chỉ admin (hasRole("ADMIN"))

---

### 3. Giao Diện Người Dùng (Frontend)

#### Trang Chi Tiết Sản Phẩm
- **HTML Section**: `id="product-detail"`
- **Chức năng**:
  - Hiển thị thông tin chi tiết sản phẩm
  - Thay đổi số lượng trước khi mua
  - Thêm vào giỏ hàng hoặc mua ngay
  - Hiển thị tồn kho, xuất xứ, danh mục

#### Trang Xác Nhận Đơn Hàng
- **HTML Section**: `id="order-confirmation"`
- **Chức năng**:
  - Hiển thị mã đơn hàng
  - Thông tin giao hàng
  - Tổng tiền thanh toán
  - Phương thức thanh toán đã chọn
  - Nút để tiếp tục mua sắm hoặc xem đơn hàng

#### Admin Dashboard
- **HTML Section**: `id="admin"`
- **Tab 1: Dashboard**
  - Hiển thị thống kê (tổng sản phẩm, đơn hàng, doanh thu)
  - Các thẻ số liệu động (stat cards)

- **Tab 2: Quản Lý Sản Phẩm**
  - Danh sách sản phẩm dạng bảng
  - Nút thêm sản phẩm mới
  - Chức năng sửa/xóa sản phẩm
  - Hiển thị ID, tên, giá, tồn kho, danh mục, trạng thái

- **Tab 3: Quản Lý Đơn Hàng**
  - Danh sách đơn hàng
  - Hiển thị mã đơn, khách hàng, tổng tiền, trạng thái, ngày đặt
  - Nút xem chi tiết và cập nhật trạng thái

- **Tab 4: Quản Lý Danh Mục**
  - Danh sách danh mục
  - Nút thêm danh mục mới
  - Chức năng sửa/xóa danh mục

#### CSS Styling
- **File**: `src/main/resources/static/admin-styles.css`
- **Mô tả**: Styling cho product details, order confirmation, admin dashboard
- **Responsive**: Hỗ trợ mobile, tablet, desktop

---

### 4. JavaScript Functions

#### admin.js - Product Details Functions
```javascript
loadProductDetail(productId)      - Tải chi tiết sản phẩm từ API
changeDetailQuantity(change)      - Thay đổi số lượng
addDetailToCart()                 - Thêm vào giỏ hàng
buyDetailNow()                    - Mua ngay
```

#### admin.js - Order Confirmation Functions
```javascript
showOrderConfirmation(order)      - Hiển thị trang xác nhận đơn hàng
```

#### admin.js - Admin Dashboard Functions
```javascript
showAdminTab(tabName)            - Chuyển đổi giữa các tab admin
loadAdminDashboard()             - Tải thống kê dashboard
loadAdminProducts()              - Tải danh sách sản phẩm
loadAdminOrders()                - Tải danh sách đơn hàng
loadAdminCategories()            - Tải danh sách danh mục
showAddProductForm()             - Hiển thị form thêm sản phẩm
editProduct(productId)           - Sửa sản phẩm
deleteProduct(productId)         - Xóa sản phẩm
showAddCategoryForm()            - Hiển thị form thêm danh mục
editCategory(categoryId)         - Sửa danh mục
deleteCategory(categoryId)       - Xóa danh mục
viewOrder(orderId)               - Xem chi tiết đơn hàng
updateOrderStatus(orderId)       - Cập nhật trạng thái đơn hàng
checkAdminAccess()               - Kiểm tra quyền admin
```

---

### 5. Data Transfer Objects (DTOs)

#### OrderDTO
- **File**: `src/main/java/vn/nhom16/trai_cay/dto/OrderDTO.java`
- **Mục đích**: Chuyển dữ liệu đơn hàng từ API sang frontend

#### OrderItemDTO
- **File**: `src/main/java/vn/nhom16/trai_cay/dto/OrderItemDTO.java`
- **Mục đích**: Chuyển dữ liệu chi tiết đơn hàng từ API sang frontend

---

### 6. Testing

#### PurchaseFlowIntegrationTest
- **File**: `src/test/java/vn/nhom16/trai_cay/PurchaseFlowIntegrationTest.java`
- **Test Cases**:

1. **testCompletePurchaseFlow()** - Kiểm thử toàn bộ luồng mua hàng
   - Lấy danh mục
   - Lấy sản phẩm
   - Tìm kiếm sản phẩm
   - Lấy chi tiết sản phẩm
   - Đăng nhập
   - Tạo đơn hàng
   - Xem chi tiết đơn hàng
   - Cập nhật trạng thái đơn hàng

2. **testProductCRUD()** - Kiểm thử CRUD sản phẩm
   - Tạo sản phẩm
   - Đọc sản phẩm
   - Cập nhật sản phẩm
   - Xóa sản phẩm

3. **testCategoryManagement()** - Kiểm thử quản lý danh mục
   - Tạo danh mục
   - Tìm danh mục theo tên
   - Xóa danh mục

---

### 7. Configuration Updates

#### DataInitializer
- **File**: `src/main/java/vn/nhom16/trai_cay/config/DataInitializer.java`
- **Cập nhật**: 
  - Thêm CategoryRepository vào dependency injection
  - Khởi tạo 5 danh mục mặc định
  - Cập nhật khởi tạo sản phẩm để sử dụng categories

#### SecurityConfig
- **File**: `src/main/java/vn/nhom16/trai_cay/config/SecurityConfig.java`
- **Cập nhật**:
  - Thêm endpoints cho categories
  - Enforce role-based access control

---

## Cách Sử Dụng

### 1. Khởi Động Ứng Dụng
```bash
mvn spring-boot:run
```

### 2. Truy Cập Ứng Dụng
```
http://localhost:8080
```

### 3. Đăng Nhập Admin
```
Username: admin
Password: admin123
```

### 4. Đăng Nhập Khách Hàng
```
Username: customer1
Password: customer123
```

### 5. Chạy Tests
```bash
mvn test
```

---

## Trạng Thái Tính Năng

| Tính Năng | Trạng Thái | Ghi Chú |
|-----------|-----------|--------|
| Bảng categories | ✅ Hoàn thành | Tạo entity, repository, service, controller |
| Cập nhật Product | ✅ Hoàn thành | Liên kết với Category |
| APIs sản phẩm | ✅ Hoàn thành | 7 endpoints hoạt động |
| APIs danh mục | ✅ Hoàn thành | 6 endpoints hoạt động |
| Trang chi tiết sản phẩm | ✅ Hoàn thành | Hiển thị từ API |
| Trang thanh toán | ✅ Hoàn thành | Form giao hàng + payment method |
| Xác nhận đơn hàng | ✅ Hoàn thành | Hiển thị thông tin chi tiết |
| Admin Dashboard | ✅ Hoàn thành | 4 tab (Dashboard, Products, Orders, Categories) |
| Role-based access | ✅ Hoàn thành | Enforce trong SecurityConfig |
| SQL Migration | ✅ Hoàn thành | schema.sql có sẵn |
| Tests | ✅ Hoàn thành | 3 test cases chính |

---

## Cấu Trúc Thư Mục

```
src/main/
├── java/vn/nhom16/trai_cay/
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── CategoryController.java (NEW)
│   │   ├── NewsController.java
│   │   ├── OrderController.java
│   │   └── ProductController.java
│   ├── dto/
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── OrderDTO.java (NEW)
│   │   ├── OrderItemDTO.java (NEW)
│   │   └── RegisterRequest.java
│   ├── entity/
│   │   ├── Category.java (NEW)
│   │   ├── News.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── Product.java (UPDATED)
│   │   └── User.java
│   ├── repository/
│   │   ├── CategoryRepository.java (NEW)
│   │   ├── NewsRepository.java
│   │   ├── OrderRepository.java
│   │   ├── ProductRepository.java (UPDATED)
│   │   └── UserRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── CategoryService.java (NEW)
│   │   ├── NewsService.java
│   │   ├── OrderService.java
│   │   └── ProductService.java (UPDATED)
│   └── config/
│       ├── DataInitializer.java (UPDATED)
│       └── SecurityConfig.java (UPDATED)
├── resources/
│   ├── application.properties
│   ├── schema.sql (NEW)
│   └── static/
│       ├── index.html (UPDATED)
│       ├── app.js (UPDATED)
│       ├── admin.js (NEW)
│       ├── style.css
│       └── admin-styles.css (NEW)
└── test/
    └── java/vn/nhom16/trai_cay/
        └── PurchaseFlowIntegrationTest.java (NEW)
```

---

## Lưu Ý Quan Trọng

1. **Đặc lại cơ sở dữ liệu**: Nếu bạn cần thiết lập lại schema, chạy file `schema.sql` trực tiếp trong MySQL
2. **JWT Token**: Admin actions yêu cầu JWT token hợp lệ
3. **CORS**: Tất cả endpoints được cấu hình cho CORS
4. **Password hashing**: Sử dụng BCrypt để mã hóa mật khẩu

---

## Các Bước Tiếp Theo (Future Enhancements)

- [ ] Thêm tính năng lọc nâng cao cho sản phẩm
- [ ] Thêm review/rating sản phẩm
- [ ] Thêm voucher/discount codes
- [ ] Thêm wishlist
- [ ] Thêm notification system
- [ ] Thêm payment gateway integration
- [ ] Thêm shipping tracking
