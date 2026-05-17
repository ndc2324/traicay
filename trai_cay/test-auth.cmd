@echo off
REM Authentication Testing Script for Trai Cay Application (Windows)
REM Usage: test-auth.cmd

set API_URL=http://localhost:8080/api
set ADMIN_USER=admin
set ADMIN_PASS=admin123
set CUSTOMER_USER=customer1
set CUSTOMER_PASS=customer123

echo === Trai Cay Authentication Testing ===
echo.

REM Test 1: Admin Login
echo Test 1: Admin Login
echo Request: POST %API_URL%/auth/login
curl -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%ADMIN_USER%\",\"password\":\"%ADMIN_PASS%\"}"

echo.
echo ---
echo.

REM Test 2: Customer Login
echo Test 2: Customer Login
echo Request: POST %API_URL%/auth/login
curl -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%CUSTOMER_USER%\",\"password\":\"%CUSTOMER_PASS%\"}"

echo.
echo ---
echo.

REM Test 3: Register New User
echo Test 3: Register New User
echo Request: POST %API_URL%/auth/register
curl -X POST "%API_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"test12345\",\"fullName\":\"Test User\",\"email\":\"testuser@example.com\",\"phone\":\"0987654321\",\"address\":\"123 Test St\"}"

echo.
echo ---
echo.

REM Test 4: Get Products (Public)
echo Test 4: Get Products (Public)
echo Request: GET %API_URL%/products
curl -X GET "%API_URL%/products" ^
  -H "Content-Type: application/json"

echo.
echo ===================================
echo All tests completed!
echo.
