# 📊 Authentication Flow Diagrams

## 1. Login Flow Diagram

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Enter username/password
       │    Click Login
       ▼
┌──────────────────────┐
│ Login Form (UI)      │
│ index.html/app.js    │
└──────┬───────────────┘
       │
       │ 2. POST /api/auth/login
       │    {username, password}
       ▼
┌─────────────────────────────────┐
│  AuthController                 │
│  /api/auth/login                │
└──────┬────────────────────────────┘
       │
       │ 3. Delegate
       ▼
┌──────────────────────────────────┐
│  AuthService.login()             │
└──────┬───────────────────────────┘
       │
       │ 4. Authenticate
       ▼
┌──────────────────────────────────┐
│  AuthenticationManager           │
│  (Spring Security)               │
└──────┬───────────────────────────┘
       │
       │ 5. Load user details
       ▼
┌──────────────────────────────────┐
│  UserDetailsServiceImpl           │
│  loadUserByUsername()            │
└──────┬───────────────────────────┘
       │
       │ 6. Query database
       ▼
┌──────────────────────────────────┐
│  UserRepository                  │
│  findByUsername(username)        │
└──────┬───────────────────────────┘
       │
       │ 7. Return user data
       ▼
┌──────────────────────────────────┐
│  Database (users table)          │
│  ┌────────────────────────────┐  │
│  │ id | username | password   │  │
│  │ 1  | admin    | $2a$10... │  │
│  └────────────────────────────┘  │
└──────┬───────────────────────────┘
       │
       │ 8. Return encrypted password
       ▼
┌──────────────────────────────────┐
│  PasswordEncoder.matches()       │
│  Compare passwords (BCrypt)      │
└──────┬───────────────────────────┘
       │
       │ 9. If MATCH ✓
       ▼
┌──────────────────────────────────┐
│  JwtUtil.generateToken()         │
│  Create JWT token                │
└──────┬───────────────────────────┘
       │
       │ 10. Return token
       ▼
┌──────────────────────────────────┐
│  AuthResponse {                  │
│    token: "eyJ...",              │
│    username: "admin",            │
│    role: "ADMIN"                 │
│  }                               │
└──────┬───────────────────────────┘
       │
       │ 11. HTTP 200 OK
       ▼
┌─────────────────────────────────┐
│  Browser                         │
│  Store token in localStorage     │
│  Redirect to dashboard           │
└─────────────────────────────────┘
```

---

## 2. Protected Endpoint Request Flow

```
┌──────────────────────────────────┐
│  Frontend (with token)           │
│  localStorage.getItem('token')   │
└──────┬──────────────────────────┘
       │
       │ 1. Request to protected endpoint
       │    GET /api/orders
       │    Header: Authorization: Bearer <token>
       ▼
┌──────────────────────────────────┐
│  Spring Security Filter Chain    │
└──────┬──────────────────────────┘
       │
       │ 2. Extract Authorization header
       ▼
┌──────────────────────────────────┐
│  JwtAuthenticationFilter         │
│  (Custom Filter)                 │
└──────┬──────────────────────────┘
       │
       │ 3. Extract token from header
       │    Remove "Bearer " prefix
       ▼
┌──────────────────────────────────┐
│  JwtUtil.extractUsername()       │
│  Parse JWT token                 │
└──────┬──────────────────────────┘
       │
       │ 4. Validate signature
       │    Check expiration
       ▼
┌──────────────────────────────────┐
│  JwtUtil.validateToken()         │
│  ✓ Signature OK                  │
│  ✓ Not Expired                   │
└──────┬──────────────────────────┘
       │
       │ 5. Load user details
       ▼
┌──────────────────────────────────┐
│  UserDetailsServiceImpl           │
│  loadUserByUsername(username)    │
└──────┬──────────────────────────┘
       │
       │ 6. Create Authentication
       │    Set authorities/roles
       ▼
┌──────────────────────────────────┐
│  SecurityContextHolder           │
│  setAuthentication(...)          │
└──────┬──────────────────────────┘
       │
       │ 7. Continue request
       ▼
┌──────────────────────────────────┐
│  OrderController                 │
│  @GetMapping("/api/orders")      │
└──────┬──────────────────────────┘
       │
       │ 8. Process request
       ▼
┌──────────────────────────────────┐
│  OrderService.getMyOrders()      │
└──────┬──────────────────────────┘
       │
       │ 9. Query database
       ▼
┌──────────────────────────────────┐
│  Database Query                  │
│  SELECT * FROM orders            │
│  WHERE user_id = ?               │
└──────┬──────────────────────────┘
       │
       │ 10. Return results
       ▼
┌──────────────────────────────────┐
│  HTTP 200 OK                     │
│  Response: [orders...]           │
└──────┬──────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Frontend receives data          │
│  Display orders to user          │
└──────────────────────────────────┘
```

---

## 3. Role-Based Authorization Flow

```
                ┌─────────────────────────────────┐
                │   Protected Endpoint             │
                │   (e.g., POST /api/products)    │
                │   @PostMapping                   │
                │   @PreAuthorize("hasRole(..)") │
                └────────────┬────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Request comes   │
                    │  with JWT token  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  JwtFilter      │
                    │  extracts token │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────────┐
                    │  Token parsed           │
                    │  username: "admin"      │
                    │  exp: 1715787900        │
                    └────────┬────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Load user      │
                    │  from DB        │
                    └────────┬────────┘
                             │
              ┌──────────────▼──────────────┐
              │  User.role = "ADMIN"        │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │ Check @PreAuth  │
                    │ hasRole(ADMIN)  │
                    │ ?               │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
         ┌────▼────┐                ┌─────▼────┐
         │ MATCH   │                │NO MATCH  │
         │✓ ADMIN  │                │✗ NOT OK  │
         └────┬────┘                └─────┬────┘
              │                          │
         ┌────▼─────────┐           ┌────▼──────────┐
         │ Continue     │           │ Reject        │
         │ request      │           │ 403 Forbidden │
         └────┬─────────┘           └───────────────┘
              │
    ┌─────────▼────────────┐
    │ Execute endpoint     │
    │ Perform action       │
    │ Return response      │
    └──────────────────────┘
```

---

## 4. Registration Flow

```
┌──────────────────────────────┐
│  User clicks "Sign Up"       │
│  Fills registration form      │
└──────┬──────────────────────┘
       │
       │ POST /api/auth/register
       │ {
       │   username: "john",
       │   password: "pass123",
       │   email: "john@ex.com",
       │   ...
       │ }
       ▼
┌──────────────────────────────┐
│  AuthController              │
│  @PostMapping("/register")   │
└──────┬──────────────────────┘
       │
       │ Validate input
       ▼
┌──────────────────────────────┐
│  AuthService.register()      │
└──────┬──────────────────────┘
       │
       ├─ Check username exists?
       │   ├─ No ✓ → continue
       │   └─ Yes ✗ → Error 400
       │
       ├─ Check email exists?
       │   ├─ No ✓ → continue
       │   └─ Yes ✗ → Error 400
       │
       ▼
┌──────────────────────────────┐
│  Encode password             │
│  BCrypt.encode(password)     │
│  → $2a$10$...               │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Create User entity          │
│  ┌────────────────────────┐  │
│  │ username: "john"       │  │
│  │ password: "$2a$10..."  │  │
│  │ email: "john@ex.com"   │  │
│  │ role: "CUSTOMER"       │  │
│  │ enabled: true          │  │
│  └────────────────────────┘  │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Save to database            │
│  userRepository.save(user)   │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Generate JWT token          │
│  (like login)                │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Return AuthResponse         │
│  {                           │
│    token: "eyJ...",          │
│    username: "john",         │
│    role: "CUSTOMER"          │
│  }                           │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  HTTP 200 OK                 │
│  User registered &           │
│  automatically logged in     │
└──────────────────────────────┘
```

---

## 5. Token Structure (JWT)

```
╔═══════════════════════════════════════════════════════════════╗
║  eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxNTc  ║
║  wMTUwMCwiZXhwIjoxNzE1Nzg3OTAwfQ.2SxJq8g9kL3mN1oPpQr5sT7   ║
║  uVwXyZaBcDeFgHiJkLmN                                         ║
╚═══════════════════════════════════════════════════════════════╝

                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
    ┌────────┐     ┌────────┐      ┌─────────┐
    │ Header │     │ Payload│      │Signature│
    └────────┘     └────────┘      └─────────┘

════════════════════════════════════════════════════════════════

HEADER (decoded):
{
  "alg": "HS256",
  "typ": "JWT"
}

PAYLOAD (decoded):
{
  "sub": "admin",              ← Username
  "iat": 1715701500,           ← Issued at (timestamp)
  "exp": 1715787900            ← Expires (timestamp)
}

SIGNATURE (not decoded):
  HMACSHA256(
    base64(header) + "." + base64(payload),
    secret_key
  )

════════════════════════════════════════════════════════════════

VERIFICATION:

1. Extract header, payload, signature
2. Verify signature using secret key
3. Check if "exp" > current timestamp
4. Extract "sub" to get username
5. Load user from database
6. Set authentication context
```

---

## 6. Error Handling Flow

```
REQUEST
   │
   ▼
┌─────────────────────────────────────┐
│  Try to process request             │
└──────┬──────────────────────────────┘
       │
       ├─ No Authorization header?
       │   └─ 401 Unauthorized
       │
       ├─ Invalid token format?
       │   └─ 401 Unauthorized
       │
       ├─ Token expired?
       │   └─ 401 Unauthorized (user logs in again)
       │
       ├─ Invalid signature?
       │   └─ 401 Unauthorized
       │
       ├─ User not found in DB?
       │   └─ 401 Unauthorized
       │
       ├─ Role mismatch (@PreAuthorize)?
       │   └─ 403 Forbidden
       │
       ├─ Invalid input data?
       │   └─ 400 Bad Request
       │
       ├─ Resource not found?
       │   └─ 404 Not Found
       │
       └─ Unexpected error?
           └─ 500 Internal Server Error
```

---

## 7. Token Lifecycle

```
START
  │
  ├─ User logs in
  │   └─ NEW TOKEN GENERATED ✓
  │       ├─ Issued at: 2026-05-14 10:00:00
  │       └─ Expires at: 2026-05-15 10:00:00 (24 hours)
  │
  ├─ User makes requests (0-24 hours) ✓
  │   └─ Each request: Token validated
  │   └─ Result: VALID ✓
  │
  ├─ Time passes (24 hours+) ✓
  │   └─ User makes request
  │   └─ Token check: exp < current_time
  │   └─ Result: EXPIRED ✗
  │
  ├─ Token expires
  │   └─ Request rejected: 401 Unauthorized
  │   └─ User must login again
  │
  └─ User logs in again
      └─ NEW TOKEN GENERATED ✓
         └─ Cycle repeats
END
```

---

## 8. Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   USER REQUEST                          │
│              (Login, API call, etc.)                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 1: HTTPS (In Production)                         │
│  Encrypt data in transit                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 2: CORS Filter                                   │
│  Check allowed origins                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 3: CSRF Protection                               │
│  (Disabled for stateless JWT)                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 4: JWT Authentication Filter                     │
│  Extract and validate token                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 5: Authorization (@PreAuthorize)                 │
│  Check roles and permissions                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 6: Business Logic                                │
│  Execute endpoint                                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  LAYER 7: Database                                      │
│  With encrypted passwords (BCrypt)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
                 RESPONSE
```

---

**These diagrams show the complete authentication flow of your Trai Cay application!** 🎯
