# Hướng Dẫn Xác Thực (Authentication) - Trai Cay Application

## 📋 Mục Lục
1. [Chuẩn Bị Môi Trường](#chuẩn-bị-môi-trường)
2. [Thiết Lập Database](#thiết-lập-database)
3. [Chạy Application](#chạy-application)
4. [API Endpoints](#api-endpoints)
5. [Test Authentication](#test-authentication)
6. [Thông Tin Tài Khoản](#thông-tin-tài-khoản)

---

## 🔧 Chuẩn Bị Môi Trường

### Yêu Cầu
- **Java 25** trở lên
- **MySQL 8.0** trở lên
- **Maven 3.8+**
- **Postman** hoặc **Thunder Client** (để test API)

### Cài Đặt MySQL
1. Cài đặt MySQL Server
2. Tạo user `root` với mật khẩu `Chien2324@`
3. Hoặc sửa lại trong `application.properties` nếu cần

---

## 💾 Thiết Lập Database

### Cách 1: Tự Động (Recommended)
Khi application khởi chạy, nó sẽ:
1. Tự động tạo database `trai_cay`
2. Tạo tất cả các bảng (users, products, orders, news, order_items)
3. Insert dữ liệu ban đầu (sản phẩm, tin tức, user admin)

**Không cần làm gì thêm!**

### Cách 2: Thủ Công
Nếu muốn setup thủ công, chạy script SQL:
```sql
-- MySQL Command Line hoặc MySQL Workbench
source src/main/resources/schema.sql
```

---

## 🚀 Chạy Application

### Bước 1: Compile
```bash
cd trai_cay
mvn clean install
```

### Bước 2: Chạy
```bash
mvn spring-boot:run
```

Hoặc chạy file JAR:
```bash
mvn clean package
java -jar target/trai_cay-0.0.1-SNAPSHOT.jar
```

### Bước 3: Kiểm Tra
Mở browser: `http://localhost:8080`

Nếu thấy trang web → Application chạy thành công! ✅

---

## 📡 API Endpoints

### 1. **Đăng Nhập (Login)**
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response Success (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN",
  "userId": 1,
  "fullName": "Admin User",
  "email": "admin@freshfruit.vn"
}
```

### 2. **Đăng Ký (Register)**
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "fullName": "Tên Người Dùng",
  "email": "user@example.com",
  "phone": "0912345678",
  "address": "Địa chỉ"
}
```

**Response Success (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "newuser",
  "role": "CUSTOMER",
  "userId": 2,
  "fullName": "Tên Người Dùng",
  "email": "user@example.com"
}
```

### 3. **Sử Dụng Token**
Lưu token từ login, sau đó gửi với header:
```
Authorization: Bearer <token>
```

Ví dụ: Lấy danh sách sản phẩm
```
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 🧪 Test Authentication

### Sử Dụng Postman/Thunder Client

#### Test 1: Đăng Nhập
1. **Method**: POST
2. **URL**: `http://localhost:8080/api/auth/login`
3. **Body** (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```
4. Click **Send** → Nhận token

#### Test 2: Sử Dụng Token
1. **Method**: GET
2. **URL**: `http://localhost:8080/api/products`
3. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer <token_từ_bước_trên>`
4. Click **Send** → Xem danh sách sản phẩm

#### Test 3: Đăng Ký Tài Khoản
1. **Method**: POST
2. **URL**: `http://localhost:8080/api/auth/register`
3. **Body** (JSON):
```json
{
  "username": "john_doe",
  "password": "secure_pass_123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0987654321",
  "address": "123 Main St"
}
```
4. Click **Send** → Tài khoản được tạo và nhận token

---

## 👤 Thông Tin Tài Khoản

### Admin Account
| Field | Value |
|-------|-------|
| **Username** | admin |
| **Password** | admin123 |
| **Role** | ADMIN |
| **Email** | admin@freshfruit.vn |

**Quyền hạn:**
- Quản lý sản phẩm (POST, PUT, DELETE)
- Quản lý tin tức (POST, PUT, DELETE)
- Quản lý đơn hàng
- Xem tất cả dữ liệu

### Demo Customer
| Field | Value |
|-------|-------|
| **Username** | customer1 |
| **Password** | customer123 |
| **Role** | CUSTOMER |
| **Email** | customer1@example.com |

**Quyền hạn:**
- Xem sản phẩm
- Xem tin tức
- Tạo đơn hàng
- Xem đơn hàng của mình

---

## 🔐 Cấu Trúc Xác Thực

### Luồng Xác Thực
```
1. User gửi login request (username + password)
   ↓
2. AuthController nhận request
   ↓
3. AuthService xác thực (AuthenticationManager)
   ↓
4. UserDetailsServiceImpl tìm user trong database
   ↓
5. Mật khẩu được so sánh (BCrypt)
   ↓
6. Nếu đúng → JwtUtil tạo token
   ↓
7. Gửi token về client
   ↓
8. Client gửi token kèm request
   ↓
9. JwtAuthenticationFilter kiểm tra token
   ↓
10. Cho phép truy cập nếu token hợp lệ
```

### Token JWT
- **Loại**: JWT (JSON Web Token)
- **Thời hạn**: 24 giờ
- **Ký hiệu**: HS256 (HMAC with SHA-256)
- **Chứa**: username, role, thời gian tạo

### Bảo Mật Mật Khẩu
- **Mã hóa**: BCrypt
- **Salt rounds**: 10
- **Lưu trữ**: Chỉ lưu hash, không lưu mật khẩu gốc

---

## 📊 Database Schema

### Table: users
```
┌─────────────┬──────────────┐
│ Column      │ Type         │
├─────────────┼──────────────┤
│ id          │ BIGINT (PK)  │
│ username    │ VARCHAR(100) │
│ password    │ VARCHAR(255) │
│ full_name   │ VARCHAR(255) │
│ email       │ VARCHAR(100) │
│ phone       │ VARCHAR(20)  │
│ address     │ VARCHAR(255) │
│ role        │ ENUM         │
│ enabled     │ BOOLEAN      │
│ created_at  │ TIMESTAMP    │
│ updated_at  │ TIMESTAMP    │
└─────────────┴──────────────┘
```

### Quan Hệ
```
users (1) ──── (N) orders
orders (1) ──── (N) order_items
products (1) ──── (N) order_items
```

---

## ⚙️ Cấu Hình Bảo Mật

### SecurityConfig.java
- **CORS**: Cho phép tất cả origins
- **CSRF**: Tắt (vì sử dụng JWT)
- **Session**: Stateless (không lưu session)
- **JWT Filter**: Kiểm tra mọi request

### Phân Quyền
```
PUBLIC:
  - GET /api/products
  - GET /api/news
  - POST /api/auth/login
  - POST /api/auth/register

CUSTOMER (Authenticated):
  - GET /api/orders
  - POST /api/orders
  - PUT /api/orders/{id}

ADMIN:
  - POST /api/products
  - PUT /api/products/{id}
  - DELETE /api/products/{id}
  - Quản lý news, orders, users
```

---

## 🐛 Troubleshooting

### Lỗi: "Connection refused"
**Nguyên nhân**: MySQL không chạy
**Giải pháp**: Khởi động MySQL Server

### Lỗi: "Access denied for user 'root'"
**Nguyên nhân**: Mật khẩu MySQL sai
**Giải pháp**: Sửa `spring.datasource.password` trong `application.properties`

### Lỗi: "401 Unauthorized"
**Nguyên nhân**: Token không hợp lệ hoặc hết hạn
**Giải pháp**: Login lại để lấy token mới

### Lỗi: "403 Forbidden"
**Nguyên nhân**: Không có quyền hạn
**Giải pháp**: Sử dụng account admin hoặc tài khoản có quyền

### Lỗi: Database không được tạo
**Giải pháp**: 
1. Kiểm tra MySQL chạy
2. Kiểm tra `application.properties` cấu hình
3. Chạy schema.sql thủ công

---

## 📚 Dependencies

```xml
<!-- Spring Boot Web -->
<spring-boot-starter-web>

<!-- Spring Security -->
<spring-boot-starter-security>

<!-- JWT Token -->
<jjwt-api>, <jjwt-impl>, <jjwt-jackson>

<!-- Database -->
<spring-boot-starter-data-jpa>
<mysql-connector-j>

<!-- Utilities -->
<lombok>
```

---

## 🎯 Tiếp Theo

1. ✅ Setup authentication
2. ⬜ Thêm OAuth2 (Google, Facebook login)
3. ⬜ Email verification
4. ⬜ Password reset
5. ⬜ Two-factor authentication

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs của application
2. Verify database connection
3. Xem lại token expiration
4. Test API endpoints bằng Postman

---

**Happy Coding! 🚀**
