# 🍎 Trai Cay Application - Authentication System

> Complete JWT-based authentication system for Spring Boot e-commerce application

## 📌 Status: ✅ COMPLETE & READY TO USE

---

## 🚀 Quick Start (2 minutes)

### Prerequisites
- Java 25+
- MySQL 8.0+

### Setup
```bash
# 1. Navigate to project
cd trai_cay

# 2. Build
mvnw clean install

# 3. Run
mvnw spring-boot:run

# 4. Access
http://localhost:8080
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📚 Documentation

Start with these files in order:

| File | Purpose | Read Time |
|------|---------|-----------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide | 5 min |
| [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) | Complete authentication guide | 15 min |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Request/response examples | 10 min |
| [AUTHENTICATION_FLOW_DIAGRAMS.md](AUTHENTICATION_FLOW_DIAGRAMS.md) | Visual flow diagrams | 10 min |
| [AUTHENTICATION_SUMMARY.md](AUTHENTICATION_SUMMARY.md) | Technical overview | 10 min |
| [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md) | What was implemented | 5 min |

---

## 👥 Default Accounts

| Account | Username | Password | Role |
|---------|----------|----------|------|
| Admin | `admin` | `admin123` | ADMIN |
| Customer | `customer1` | `customer123` | CUSTOMER |

---

## 🔐 Key Features

✅ **JWT Authentication** - Secure token-based auth
✅ **User Registration** - Self-service signup
✅ **Role-Based Access** - ADMIN, CUSTOMER, GUEST roles
✅ **Password Encryption** - BCrypt hashing (10 rounds)
✅ **Token Validation** - Automatic on every request
✅ **CORS Support** - Cross-origin requests enabled
✅ **Stateless** - No session storage required
✅ **Auto Schema** - Database tables created on startup

---

## 📡 API Endpoints

### Authentication (Public)
```
POST   /api/auth/login       # Login and get token
POST   /api/auth/register    # Register new account
```

### Products (Mixed)
```
GET    /api/products         # Get all (public)
GET    /api/products/{id}    # Get one (public)
POST   /api/products         # Create (admin only)
PUT    /api/products/{id}    # Update (admin only)
DELETE /api/products/{id}    # Delete (admin only)
```

### Orders (Protected)
```
GET    /api/orders           # Get my orders
POST   /api/orders           # Create order
PUT    /api/orders/{id}      # Update order
```

### News (Mixed)
```
GET    /api/news             # Get all (public)
GET    /api/news/{id}        # Get one (public)
POST   /api/news             # Create (admin only)
PUT    /api/news/{id}        # Update (admin only)
DELETE /api/news/{id}        # Delete (admin only)
```

---

## 🧪 Testing

### Option 1: Postman (Recommended)
1. Import `Trai_Cay_API.postman_collection.json`
2. Set `base_url` = `http://localhost:8080`
3. Run requests

### Option 2: Test Scripts
```bash
# Linux/Mac
bash test-auth.sh

# Windows
.\test-auth.cmd
```

### Option 3: Manual Testing
See [API_EXAMPLES.md](API_EXAMPLES.md) for cURL commands

---

## 📊 Architecture

```
Frontend → REST API → Security → Services → Database
(HTML)     (Spring)    (JWT)     (Logic)    (MySQL)
```

### Stack
- **Framework**: Spring Boot 3.5.14
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: BCrypt
- **Build**: Maven

---

## 🔑 How It Works

### 1. User Logs In
```
POST /api/auth/login
{username, password}
        ↓
Credentials validated
        ↓
JWT token generated
        ↓
Token returned
```

### 2. User Makes Authenticated Request
```
GET /api/orders
Header: Authorization: Bearer <token>
        ↓
Token extracted & validated
        ↓
User loaded from database
        ↓
Request processed
        ↓
Response returned
```

### 3. Role-Based Authorization
```
POST /api/products (create)
        ↓
Check user role
        ↓
Only ADMIN allowed?
        ✓ YES → Process
        ✗ NO → 403 Forbidden
```

---

## 🛠️ Configuration

### Database Connection
File: `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/trai_cay
spring.datasource.username=root
spring.datasource.password=Chien2324@
```

### JWT Settings
File: `src/main/java/vn/nhom16/trai_cay/security/JwtUtil.java`
```
Token Expiry: 24 hours
Algorithm: HS256 (HMAC with SHA-256)
Secret: FreshFruitSecretKeyForJWTTokenGeneration2026
```

### Security Rules
File: `src/main/java/vn/nhom16/trai_cay/config/SecurityConfig.java`
- Stateless sessions
- CORS enabled
- CSRF disabled (for JWT)
- Role-based authorization

---

## 📁 Project Structure

```
trai_cay/
├── src/main/
│   ├── java/vn/nhom16/trai_cay/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java      ← Security configuration
│   │   │   └── DataInitializer.java     ← Initialize data
│   │   ├── controller/
│   │   │   ├── AuthController.java      ← Login/Register
│   │   │   ├── ProductController.java
│   │   │   ├── OrderController.java
│   │   │   └── NewsController.java
│   │   ├── security/
│   │   │   ├── JwtUtil.java             ← JWT token generation
│   │   │   ├── JwtAuthenticationFilter.java ← Token validation
│   │   │   └── UserDetailsServiceImpl.java  ← Load user details
│   │   ├── service/
│   │   │   ├── AuthService.java         ← Authentication logic
│   │   │   ├── ProductService.java
│   │   │   ├── OrderService.java
│   │   │   └── NewsService.java
│   │   ├── entity/
│   │   │   ├── User.java                ← User entity with roles
│   │   │   ├── Product.java
│   │   │   ├── Order.java
│   │   │   ├── OrderItem.java
│   │   │   └── News.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   └── AuthResponse.java
│   │   └── repository/
│   │       ├── UserRepository.java
│   │       ├── ProductRepository.java
│   │       ├── OrderRepository.java
│   │       └── NewsRepository.java
│   └── resources/
│       ├── application.properties
│       ├── schema.sql                   ← Database initialization
│       └── static/
│           ├── index.html
│           ├── app.js
│           └── style.css
├── QUICK_START.md                       ← Start here
├── AUTHENTICATION_SETUP.md
├── AUTHENTICATION_SUMMARY.md
├── API_EXAMPLES.md
├── AUTHENTICATION_FLOW_DIAGRAMS.md
├── COMPLETION_CHECKLIST.md
├── Trai_Cay_API.postman_collection.json
├── test-auth.sh
├── test-auth.cmd
└── pom.xml
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 8080 in use** | Change `server.port` in properties |
| **MySQL connection failed** | Start MySQL, verify credentials |
| **Build fails** | Run `mvnw clean install -DskipTests` |
| **Token expired (401)** | Login again to get new token |
| **Permission denied (403)** | Use admin account for admin operations |
| **Database tables not created** | Ensure schema.sql is in resources folder |

---

## ✨ What Was Implemented

✅ Complete authentication system
✅ User registration with validation
✅ JWT token generation & validation
✅ Role-based access control
✅ BCrypt password encryption
✅ Database schema with initialization
✅ Automatic user seeding
✅ API endpoints with proper security
✅ CORS configuration
✅ Comprehensive documentation
✅ Test scripts & Postman collection

---

## 🎯 Next Steps

1. **Verify Setup**
   - Start application
   - Test login with admin/admin123

2. **Connect Frontend**
   - Update login page to POST to `/api/auth/login`
   - Store token in localStorage
   - Send token in Authorization header

3. **Enhance Features**
   - Add email verification
   - Implement password reset
   - Add OAuth2 (Google, Facebook)
   - Add refresh tokens
   - Add two-factor auth

4. **Production Deployment**
   - Use environment variables for secrets
   - Update CORS origins
   - Enable HTTPS
   - Use environment-specific configs
   - Monitor authentication logs

---

## 📞 Support

**Questions?** Check these files:
- [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) - Detailed guide
- [API_EXAMPLES.md](API_EXAMPLES.md) - API reference
- [AUTHENTICATION_FLOW_DIAGRAMS.md](AUTHENTICATION_FLOW_DIAGRAMS.md) - Visual guide
- Test scripts in terminal output

---

## 📜 License

This authentication system is part of Trai Cay e-commerce application.

---

## 🎉 You're Ready!

Your authentication system is:
- ✅ Fully implemented
- ✅ Well documented
- ✅ Tested and verified
- ✅ Ready for development
- ✅ Production-ready (with configuration)

---

### Start Here 👇

1. Read [QUICK_START.md](QUICK_START.md)
2. Run the application
3. Test with Postman collection
4. Read [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) for details

---

**Happy Coding! 🚀**

---

**Created**: May 14, 2026
**Status**: Production Ready ✅
**Last Updated**: Today
