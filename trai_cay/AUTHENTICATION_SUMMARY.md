# 📋 Authentication System - Setup Summary

## ✅ What Has Been Completed

### 1. **Database Configuration**
- ✅ Updated `application.properties` with:
  - Database connection settings
  - JPA/Hibernate configuration
  - SQL script initialization
  - CORS configuration

### 2. **Database Schema**
- ✅ Created `schema.sql` with:
  - `users` table with roles (GUEST, CUSTOMER, ADMIN)
  - `products` table for fruits/items
  - `orders` table for customer orders
  - `order_items` table for order line items
  - `news` table for announcements
  - Proper indexes and foreign keys
  - Initial admin user (admin/admin123)
  - Demo customer user (customer1/customer123)

### 3. **Data Initialization**
- ✅ Enhanced `DataInitializer.java` to:
  - Use PasswordEncoder for secure password hashing
  - Create admin user automatically
  - Create demo customer user
  - Initialize sample products
  - Initialize sample news articles

### 4. **Authentication Infrastructure** (Already in place)
- ✅ JWT-based authentication
- ✅ BCrypt password encryption
- ✅ Role-based access control (RBAC)
- ✅ Token validation on every request
- ✅ CORS configuration

---

## 📁 Files Created/Modified

### New Files Created:
1. **`src/main/resources/schema.sql`** - Database schema and initial data
2. **`AUTHENTICATION_SETUP.md`** - Complete authentication guide
3. **`QUICK_START.md`** - 5-minute quick start guide
4. **`test-auth.sh`** - Bash script for testing authentication
5. **`test-auth.cmd`** - Windows batch script for testing
6. **`Trai_Cay_API.postman_collection.json`** - Postman collection for API testing

### Modified Files:
1. **`src/main/resources/application.properties`** - Updated database and SQL init config
2. **`src/main/java/vn/nhom16/trai_cay/config/DataInitializer.java`** - Enhanced with proper password encoding

---

## 🔑 User Accounts

### Admin Account
```
Username: admin
Password: admin123
Role: ADMIN
Email: admin@freshfruit.vn
```

### Customer Account
```
Username: customer1
Password: customer123
Role: CUSTOMER
Email: customer1@example.com
```

---

## 🚀 Getting Started

### Step 1: Install & Build
```bash
cd trai_cay
mvnw clean install
```

### Step 2: Run Application
```bash
mvnw spring-boot:run
```

### Step 3: Access Application
- **URL**: http://localhost:8080
- **API Base**: http://localhost:8080/api

### Step 4: Test API
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)
```
GET  /api/products              # Get all products
GET  /api/products/{id}         # Get product by ID
GET  /api/news                  # Get all news
GET  /api/news/{id}             # Get news by ID
POST /api/auth/login            # Login
POST /api/auth/register         # Register new user
```

### Authenticated Endpoints (Token Required)
```
GET  /api/orders                # Get my orders (CUSTOMER)
POST /api/orders                # Create order (CUSTOMER)
PUT  /api/orders/{id}           # Update order (CUSTOMER)
```

### Admin Endpoints (ADMIN role required)
```
POST   /api/products            # Create product
PUT    /api/products/{id}       # Update product
DELETE /api/products/{id}       # Delete product
POST   /api/news                # Create news
PUT    /api/news/{id}           # Update news
DELETE /api/news/{id}           # Delete news
```

---

## 🔐 Security Architecture

### Request Flow
```
1. Client sends login request
   ↓
2. AuthController receives request
   ↓
3. AuthService authenticates using AuthenticationManager
   ↓
4. UserDetailsServiceImpl loads user from database
   ↓
5. PasswordEncoder compares passwords (BCrypt)
   ↓
6. If valid: JwtUtil generates JWT token
   ↓
7. Token returned to client
```

### Token Usage
```
1. Client stores token locally
   ↓
2. Client sends token in Authorization header
   ↓
3. JwtAuthenticationFilter extracts token
   ↓
4. Token validated: username, expiration, signature
   ↓
5. UserDetails loaded from database
   ↓
6. Request authenticated and authorized
```

### Password Security
- **Algorithm**: BCrypt with 10 salt rounds
- **Storage**: Only hash stored in database
- **Comparison**: Secure comparison using BCrypt.matches()

---

## 🧪 Testing

### Using Postman
1. Import `Trai_Cay_API.postman_collection.json`
2. Set base_url environment variable to `http://localhost:8080`
3. Run requests in order:
   - Login (Admin) - saves token
   - Get Products
   - Create Product - demonstrates admin access
   - Login (Customer) - saves different token
   - Try Create Product - should fail (403 Forbidden)

### Using cURL
```bash
# Test 1: Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Test 2: Use token
curl -X GET http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN"

# Test 3: Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"test123",
    "fullName":"Test User",
    "email":"test@example.com",
    "phone":"0912345678",
    "address":"123 Street"
  }'
```

### Using Shell Scripts
```bash
# On Linux/Mac
bash test-auth.sh

# On Windows PowerShell
.\test-auth.cmd
```

---

## 🐛 Troubleshooting

### Database Connection Failed
**Problem**: "Communication link failure"
**Solution**: 
- Verify MySQL is running
- Check credentials in application.properties
- Ensure database exists: `CREATE DATABASE trai_cay;`

### Port Already in Use
**Problem**: "Bind exception - port 8080 already in use"
**Solution**: 
- Change port in application.properties: `server.port=8081`
- Or kill process using port 8080

### Build Failed
**Problem**: Maven build errors
**Solution**:
```bash
# Clean and rebuild
mvnw clean
mvnw install -DskipTests
```

### Token Invalid
**Problem**: "401 Unauthorized"
**Solution**:
- Login again to get fresh token
- Token expires after 24 hours
- Check token format: "Bearer <token>"

### Permission Denied
**Problem**: "403 Forbidden"
**Solution**:
- Use admin account for admin operations
- Customer cannot create/edit products
- Check user role in token

---

## 📚 Documentation Files

- **QUICK_START.md** - Get up and running in 5 minutes
- **AUTHENTICATION_SETUP.md** - Complete authentication guide with examples
- **This file** - Overview of what was set up

---

## ✨ Features Implemented

✅ JWT-based authentication
✅ User registration
✅ Role-based access control (Admin, Customer)
✅ Password encryption (BCrypt)
✅ Token validation
✅ Automatic database schema creation
✅ CORS support
✅ Stateless authentication
✅ Secure password comparison

---

## 🎯 Next Steps (Optional)

1. Add email verification for registration
2. Implement password reset functionality
3. Add OAuth2 (Google, Facebook login)
4. Implement refresh tokens
5. Add two-factor authentication
6. Add audit logging
7. Implement role-based URL restrictions
8. Add API rate limiting

---

## 📞 Support

For issues or questions:
1. Check AUTHENTICATION_SETUP.md for detailed guide
2. Review test-auth.sh for working examples
3. Import Postman collection for visual testing
4. Check application logs in console

---

**Authentication system is fully operational! 🎉**

Date Setup: May 14, 2026
Status: Ready for Development ✅
