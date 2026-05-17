# 🚀 Quick Start Guide - Trai Cay Application

## ⚡ 5-Minute Setup

### 1. Database Setup (1 min)
```bash
# Make sure MySQL is running
# The app will auto-create database and tables

# OR manually in MySQL:
mysql -u root -p
# Enter password: Chien2324@

mysql> source src/main/resources/schema.sql;
```

### 2. Build Application (2 min)
```bash
cd trai_cay
mvn clean install
```

### 3. Run Application (1 min)
```bash
mvn spring-boot:run
```

### 4. Test (1 min)
Open browser: **http://localhost:8080**

---

## 🔑 Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Customer Account
- **Username**: `customer1`
- **Password**: `customer123`

---

## 📡 Quick API Test

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Products
```bash
curl -X GET http://localhost:8080/api/products
```

### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"newuser",
    "password":"pass123",
    "fullName":"New User",
    "email":"new@example.com",
    "phone":"0912345678",
    "address":"123 Street"
  }'
```

---

## 🐳 Using Docker (Optional)

### Setup Docker MySQL
```bash
docker run --name mysql_trai_cay \
  -e MYSQL_ROOT_PASSWORD=Chien2324@ \
  -e MYSQL_DATABASE=trai_cay \
  -p 3306:3306 \
  -d mysql:8.0
```

---

## 📚 Full Documentation
See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for complete guide

---

## ✅ Verification Checklist

- [ ] MySQL running
- [ ] Application built successfully
- [ ] Application started on port 8080
- [ ] Can access http://localhost:8080
- [ ] Admin login works
- [ ] Customer login works
- [ ] Can view products
- [ ] Can create new user

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| MySQL Connection Error | Verify MySQL running, check credentials in application.properties |
| Port 8080 In Use | Change `server.port` in application.properties |
| Build Error | Run `mvn clean install -DskipTests` |
| Token Expired | Login again to get new token |

---

## 📖 Architecture

```
Frontend (HTML/JS/CSS)
        ↓
REST API (Port 8080)
        ↓
Security Layer (JWT + Filters)
        ↓
Business Logic (Services)
        ↓
Database (MySQL)
```

---

## 🎯 Next Steps

1. ✅ Authentication setup complete
2. Frontend improvements (add login UI)
3. Add more features (payments, notifications)
4. Deploy to production

---

**Ready to go! 🎉**
