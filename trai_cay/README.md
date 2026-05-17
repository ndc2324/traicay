# Fresh Fruit - Trái Cây Tươi Ngon

Một ứng dụng web bán trái cây với frontend HTML/CSS/JavaScript thuần và backend Java/Spring Boot với MySQL.

## 🚀 Công nghệ sử dụng

### Frontend
- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (ES6+)
- Font Awesome (icons)
- Google Fonts (Roboto)

### Backend
- Java 25
- Spring Boot 3.5.14
- Spring Data JPA
- Spring Security
- MySQL
- Lombok

## 📋 Tính năng

### Khách (Guest)
- ✅ Xem sản phẩm, tin tức
- ✅ Thêm vào giỏ hàng
- ❌ Đặt hàng (Yêu cầu đăng nhập)

### Người mua (Customer)
- ✅ Xem sản phẩm, tin tức
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng / Thanh toán
- ✅ Quản lý thông tin cá nhân

### Quản trị viên (Admin)
- ✅ Xem sản phẩm, tin tức
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng / Thanh toán
- ✅ Quản lý thông tin cá nhân
- ✅ Thêm/Sửa/Xóa sản phẩm
- ✅ Quản lý đơn hàng/User

## 🛠️ Cài đặt

### Yêu cầu
- JDK 25 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+
- IntelliJ IDEA (khuyên dùng)
- Postman (để test API)

### Bước 1: Cài đặt MySQL Database

```sql
-- Tạo database
CREATE DATABASE trai_cay;

-- Sử dụng database
USE trai_cay;

-- Tạo bảng news
CREATE TABLE news (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Tạo bảng users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    role ENUM('GUEST', 'CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Tạo bảng products
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DOUBLE NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Tạo bảng orders
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    notes TEXT,
    payment_method ENUM('TRANSFER', 'COD', 'EWALLET'),
    total_amount DOUBLE NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    created_at DATETIME NOT NULL,
    user_id BIGINT,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tạo bảng order_items
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    subtotal DOUBLE NOT NULL,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

### Bước 2: Cấu hình Database

Mở file `src/main/resources/application.properties` và cập nhật thông tin MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/trai_cay?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### Bước 3: Chạy ứng dụng

Sử dụng Maven:

```bash
cd trai_cay
./mvnw spring-boot:run
```

Hoặc chạy trực tiếp từ IntelliJ IDEA:
1. Mở file `TraiCayApplication.java`
2. Click chuột phải và chọn "Run 'TraiCayApplication'"

Ứng dụng sẽ chạy tại: http://localhost:8080

## 📡 API Endpoints

### Products API

- `GET /api/products` - Lấy danh sách tất cả sản phẩm
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm theo ID
- `GET /api/products/category/{category}` - Lấy sản phẩm theo danh mục
- `GET /api/products/search?name={name}` - Tìm kiếm sản phẩm theo tên
- `POST /api/products` - Thêm sản phẩm mới (Admin)
- `PUT /api/products/{id}` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/{id}` - Xóa sản phẩm (Admin)

### Orders API

- `GET /api/orders` - Lấy danh sách tất cả đơn hàng (Admin)
- `GET /api/orders/{id}` - Lấy chi tiết đơn hàng theo ID
- `GET /api/orders/user/{userId}` - Lấy đơn hàng theo user ID
- `GET /api/orders/status/{status}` - Lấy đơn hàng theo trạng thái
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/{id}/status?status={status}` - Cập nhật trạng thái đơn hàng (Admin)
- `DELETE /api/orders/{id}` - Xóa đơn hàng (Admin)

### News API

- `GET /api/news` - Lấy danh sách tất cả tin tức
- `GET /api/news/{id}` - Lấy chi tiết tin tức theo ID
- `GET /api/news/category/{category}` - Lấy tin tức theo danh mục
- `POST /api/news` - Thêm tin tức mới (Admin)
- `PUT /api/news/{id}` - Cập nhật tin tức (Admin)
- `DELETE /api/news/{id}` - Xóa tin tức (Admin)

## 🧪 Test với Postman

### 1. Lấy danh sách sản phẩm

```
GET http://localhost:8080/api/products
```

### 2. Tạo đơn hàng mới

```
POST http://localhost:8080/api/orders
Content-Type: application/json

{
    "customerName": "Nguyen Van A",
    "phone": "0909123456",
    "address": "123 Nguyen Van Linh, TP.HCM",
    "notes": "Giao hàng buổi sáng",
    "paymentMethod": "COD",
    "items": [
        {
            "productName": "Táo Envy",
            "price": 180000,
            "quantity": 2
        },
        {
            "productName": "Dâu tây Hàn Quốc",
            "price": 250000,
            "quantity": 1
        }
    ]
}
```

### 3. Lấy danh sách tin tức

```
GET http://localhost:8080/api/news
```

### 4. Thêm sản phẩm mới (Admin)

```
POST http://localhost:8080/api/products
Content-Type: application/json

{
    "name": "Cam Úc",
    "description": "Cam Úc tươi ngon, nhiều nước",
    "price": 150000,
    "imageUrl": "https://example.com/cam.jpg",
    "origin": "Úc",
    "quantity": 100,
    "available": true,
    "category": "Cam"
}
```

## 🎨 Frontend Features

### Các trang chính
- **Trang chủ**: Hero section, sản phẩm nổi bật
- **Giới thiệu**: Câu chuyện, nguồn gốc, giá trị cốt lõi
- **Sản phẩm**: Danh sách sản phẩm với bộ lọc
- **Tin tức**: Danh sách bài viết và sidebar danh mục
- **Giỏ hàng**: Quản lý sản phẩm, tính tổng tiền
- **Thanh toán**: Form thông tin giao hàng, phương thức thanh toán

### Thành phần giao diện
- **Header**: Logo, thanh tìm kiếm, giỏ hàng, user icon
- **Navigation**: Menu ngang với active state
- **Footer**: 3 cột thông tin liên hệ, dịch vụ, chứng nhận
- **FAB**: Nút chat tròn ở góc dưới bên phải
- **Popup Notification**: Thông báo mua hàng tự động (slide in sau 3s, biến mất sau 5s)

## 👤 Tài khoản mặc định

### Admin
- Username: `admin`
- Password: `admin123`

## 📁 Cấu trúc dự án

```
trai_cay/
├── src/
│   ├── main/
│   │   ├── java/vn/nhom10/trai_cay/
│   │   │   ├── config/          # Cấu hình Security, DataInitializer
│   │   │   ├── controller/      # REST API Controllers
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── repository/      # JPA Repositories
│   │   │   ├── service/         # Business Logic
│   │   │   └── TraiCayApplication.java
│   │   └── resources/
│   │       ├── static/          # Frontend files
│   │       │   ├── index.html
│   │       │   ├── style.css
│   │       │   └── app.js
│   │       └── application.properties
└── pom.xml
```

## 🔐 Bảo mật

- Spring Security được cấu hình để cho phép CORS
- Tất cả API endpoints hiện tại đều public (có thể thêm authentication sau)
- Password được mã hóa bằng BCrypt

## 📝 Ghi chú

- Ứng dụng sử dụng JPA `ddl-auto=none` vì database đã được tạo sẵn
- Dữ liệu mẫu được tự động insert khi chạy ứng dụng lần đầu
- Frontend sử dụng localStorage để lưu giỏ hàng
- Popup notification hiển thị sau 3 giây và tự động tắt sau 5 giây

## 🐛 Khắc phục sự cố

### MySQL connection refused
- Kiểm tra MySQL service đang chạy
- Xác nhận username và password trong application.properties
- Đảm bảo database `trai_cay` đã được tạo

### Port 8080 đang được sử dụng
- Thay đổi port trong application.properties: `server.port=8081`

### Frontend không load được API
- Kiểm tra CORS configuration trong SecurityConfig
- Xác nhận backend đang chạy đúng port

## 📞 Liên hệ

- Email: info@freshfruit.vn
- Phone: 0909 123 456
- Address: 123 Nguyễn Văn Linh, TP.HCM
