# 🔗 API Examples - Complete Request/Response Guide

## Base URL
```
http://localhost:8080
```

---

## 1️⃣ Authentication APIs

### A. Login
Login with existing credentials to get JWT token.

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxNTcwMTUwMCwiZXhwIjoxNzE1Nzg3OTAwfQ.2SxJq8g9kL3mN1oPpQr5sT7uVwXyZaBcDeFgHiJkLmN",
  "username": "admin",
  "role": "ADMIN",
  "userId": 1,
  "fullName": "Admin User",
  "email": "admin@freshfruit.vn"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid credentials"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

### B. Register
Create a new user account.

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0987654321",
  "address": "123 Main Street, City, Country"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huX2RvZSIsImlhdCI6MTcxNTcwMTYwMCwiZXhwIjoxNzE1Nzg4MDAwfQ.3UwKk9h0iL2nO4pQrS6tU8vWxYzAbCdEfGhIjKlMnOp",
  "username": "john_doe",
  "role": "CUSTOMER",
  "userId": 5,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Error - User Exists (400 Bad Request):**
```json
{
  "error": "Username already exists"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePassword123!",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0987654321",
    "address": "123 Main Street, City, Country"
  }'
```

---

## 2️⃣ Product APIs

### A. Get All Products (Public)
No authentication required.

**Request:**
```http
GET /api/products HTTP/1.1
Host: localhost:8080
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Táo Envy",
    "description": "Táo Envy nhập khẩu từ New Zealand, giòn ngọt, hương vị tuyệt vời",
    "price": 180000.0,
    "imageUrl": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300",
    "origin": "New Zealand",
    "quantity": 100,
    "category": "Táo",
    "active": true
  },
  {
    "id": 2,
    "name": "Dâu tây Hàn Quốc",
    "description": "Dâu tây tươi ngon từ Hàn Quốc, ngọt thanh, giàu vitamin C",
    "price": 250000.0,
    "imageUrl": "https://images.unsplash.com/photo-1464965911861-746a04b4b0ae?w=300",
    "origin": "Hàn Quốc",
    "quantity": 80,
    "category": "Quả mọng",
    "active": true
  }
]
```

**Using cURL:**
```bash
curl -X GET http://localhost:8080/api/products \
  -H "Content-Type: application/json"
```

---

### B. Get Product by ID (Public)
**Request:**
```http
GET /api/products/1 HTTP/1.1
Host: localhost:8080
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Táo Envy",
  "description": "Táo Envy nhập khẩu từ New Zealand, giòn ngọt, hương vị tuyệt vời",
  "price": 180000.0,
  "imageUrl": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300",
  "origin": "New Zealand",
  "quantity": 100,
  "category": "Táo",
  "active": true
}
```

---

### C. Create Product (Admin Only)
Requires authentication and ADMIN role.

**Request:**
```http
POST /api/products HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxNTcwMTUwMCwiZXhwIjoxNzE1Nzg3OTAwfQ.2SxJq8g9kL3mN1oPpQr5sT7uVwXyZaBcDeFgHiJkLmN

{
  "name": "Xoài vàng Úc",
  "description": "Xoài vàng tươi ngon từ Úc, thịt dày, hương vị ngọt đậm",
  "price": 150000,
  "origin": "Úc",
  "quantity": 200,
  "category": "Xoài",
  "active": true
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "name": "Xoài vàng Úc",
  "description": "Xoài vàng tươi ngon từ Úc, thịt dày, hương vị ngọt đậm",
  "price": 150000.0,
  "origin": "Úc",
  "quantity": 200,
  "category": "Xoài",
  "active": true
}
```

**Error - Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error - Forbidden (403):**
```json
{
  "error": "Access Denied - Admin only"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -d '{
    "name": "Xoài vàng Úc",
    "description": "Xoài vàng tươi ngon từ Úc",
    "price": 150000,
    "origin": "Úc",
    "quantity": 200,
    "category": "Xoài",
    "active": true
  }'
```

---

### D. Update Product (Admin Only)
**Request:**
```http
PUT /api/products/1 HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "name": "Táo Envy Updated",
  "description": "Updated description",
  "price": 190000,
  "origin": "New Zealand",
  "quantity": 150,
  "category": "Táo",
  "active": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Táo Envy Updated",
  "description": "Updated description",
  "price": 190000.0,
  "origin": "New Zealand",
  "quantity": 150,
  "category": "Táo",
  "active": true
}
```

---

### E. Delete Product (Admin Only)
**Request:**
```http
DELETE /api/products/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <TOKEN>
```

**Response (204 No Content)**

---

## 3️⃣ Orders APIs

### A. Get My Orders (Authenticated)
**Request:**
```http
GET /api/orders HTTP/1.1
Host: localhost:8080
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 2,
    "totalPrice": 430000.0,
    "status": "PENDING",
    "shippingAddress": "123 Main Street, City",
    "phone": "0912345678",
    "note": "Please deliver in the morning",
    "createdAt": "2026-05-14T10:30:00",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "Táo Envy",
        "quantity": 2,
        "price": 180000.0
      },
      {
        "id": 2,
        "productId": 2,
        "productName": "Dâu tây Hàn Quốc",
        "quantity": 1,
        "price": 250000.0
      }
    ]
  }
]
```

---

### B. Create Order (Authenticated)
**Request:**
```http
POST /api/orders HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Main Street, City",
  "phone": "0912345678",
  "note": "Please deliver in the morning"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 2,
  "totalPrice": 430000.0,
  "status": "PENDING",
  "shippingAddress": "123 Main Street, City",
  "phone": "0912345678",
  "note": "Please deliver in the morning",
  "createdAt": "2026-05-14T10:30:00"
}
```

---

## 4️⃣ News APIs

### A. Get All News (Public)
**Request:**
```http
GET /api/news HTTP/1.1
Host: localhost:8080
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Cách chọn dâu tây tươi ngon",
    "content": "Hướng dẫn chi tiết cách chọn dâu tây tươi ngon...",
    "imageUrl": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200",
    "category": "Cẩm nang chọn quả",
    "publishedAt": "2026-05-09T10:00:00",
    "active": true
  },
  {
    "id": 2,
    "title": "Khuyến mãi mùa dâu tây",
    "content": "Ưu đãi đặc biệt cho mùa dâu tây...",
    "imageUrl": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200",
    "category": "Tin khuyến mãi",
    "publishedAt": "2026-05-04T10:00:00",
    "active": true
  }
]
```

---

## 🔐 Authorization Header

All authenticated requests must include:

```
Authorization: Bearer <token>
```

Where `<token>` is the JWT token received from login.

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxNTcwMTUwMCwiZXhwIjoxNzE1Nzg3OTAwfQ.2SxJq8g9kL3mN1oPpQr5sT7uVwXyZaBcDeFgHiJkLmN
```

---

## 📊 HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## 💡 Tips

1. **Token Management**
   - Store token in browser localStorage
   - Include in all authenticated requests
   - Token expires after 24 hours
   - Login again to get new token

2. **Error Handling**
   - Check status code for error type
   - Read response body for error details
   - Handle 401 by redirecting to login
   - Handle 403 by showing permission error

3. **Best Practices**
   - Use HTTPS in production
   - Never expose tokens in URL
   - Validate input before sending
   - Handle network timeouts
   - Implement retry logic

---

## 🧪 Quick Test Commands

```bash
# 1. Save token to variable
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# 2. Use token in request
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer $TOKEN"

# 3. Pretty print response
curl -s -X GET http://localhost:8080/api/products | jq '.'
```

---

**Happy API Testing! 🚀**
