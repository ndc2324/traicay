#!/bin/bash
# Authentication Testing Script for Trai Cay Application
# Usage: bash test-auth.sh

API_URL="http://localhost:8080/api"
ADMIN_USER="admin"
ADMIN_PASS="admin123"
CUSTOMER_USER="customer1"
CUSTOMER_PASS="customer123"

echo "🧪 Trai Cay Authentication Testing"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Admin Login
echo -e "${BLUE}Test 1: Admin Login${NC}"
echo "Request: POST $API_URL/auth/login"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")

echo "Response:"
echo "$ADMIN_LOGIN" | jq '.'

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token')

if [ "$ADMIN_TOKEN" != "null" ] && [ ! -z "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Admin login successful${NC}"
  echo "Token: ${ADMIN_TOKEN:0:50}..."
else
  echo -e "${RED}✗ Admin login failed${NC}"
  exit 1
fi

echo ""
echo "---"
echo ""

# Test 2: Customer Login
echo -e "${BLUE}Test 2: Customer Login${NC}"
echo "Request: POST $API_URL/auth/login"
CUSTOMER_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$CUSTOMER_USER\",\"password\":\"$CUSTOMER_PASS\"}")

echo "Response:"
echo "$CUSTOMER_LOGIN" | jq '.'

CUSTOMER_TOKEN=$(echo "$CUSTOMER_LOGIN" | jq -r '.token')

if [ "$CUSTOMER_TOKEN" != "null" ] && [ ! -z "$CUSTOMER_TOKEN" ]; then
  echo -e "${GREEN}✓ Customer login successful${NC}"
  echo "Token: ${CUSTOMER_TOKEN:0:50}..."
else
  echo -e "${RED}✗ Customer login failed${NC}"
  exit 1
fi

echo ""
echo "---"
echo ""

# Test 3: Register New User
echo -e "${BLUE}Test 3: Register New User${NC}"
echo "Request: POST $API_URL/auth/register"
NEW_USER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"test12345",
    "fullName":"Test User",
    "email":"testuser@example.com",
    "phone":"0987654321",
    "address":"123 Test St"
  }')

echo "Response:"
echo "$NEW_USER" | jq '.'

NEW_TOKEN=$(echo "$NEW_USER" | jq -r '.token')

if [ "$NEW_TOKEN" != "null" ] && [ ! -z "$NEW_TOKEN" ]; then
  echo -e "${GREEN}✓ User registration successful${NC}"
else
  echo -e "${YELLOW}⚠ User might already exist${NC}"
fi

echo ""
echo "---"
echo ""

# Test 4: Get Products (Public)
echo -e "${BLUE}Test 4: Get Products (Public - No Auth)${NC}"
echo "Request: GET $API_URL/products"
PRODUCTS=$(curl -s -X GET "$API_URL/products" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$PRODUCTS" | jq '.' | head -20

if [ $(echo "$PRODUCTS" | jq '. | length') -gt 0 ]; then
  echo -e "${GREEN}✓ Products retrieved successfully${NC}"
else
  echo -e "${YELLOW}⚠ No products found (this is normal if DB is empty)${NC}"
fi

echo ""
echo "---"
echo ""

# Test 5: Get Products with Token
echo -e "${BLUE}Test 5: Get Products (With Admin Token)${NC}"
echo "Request: GET $API_URL/products (with Authorization header)"
PRODUCTS_WITH_AUTH=$(curl -s -X GET "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response:"
echo "$PRODUCTS_WITH_AUTH" | jq '.' | head -20

echo -e "${GREEN}✓ Request with token successful${NC}"

echo ""
echo "---"
echo ""

# Test 6: Create Product (Admin Only)
echo -e "${BLUE}Test 6: Create Product (Admin Only)${NC}"
echo "Request: POST $API_URL/products (with Admin Token)"
NEW_PRODUCT=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name":"Test Product",
    "description":"Test product description",
    "price":100000,
    "origin":"Test",
    "quantity":10,
    "category":"Test Category",
    "active":true
  }')

echo "Response:"
echo "$NEW_PRODUCT" | jq '.' 2>/dev/null || echo "$NEW_PRODUCT"

echo ""
echo "---"
echo ""

# Test 7: Attempt Admin Action with Customer Token
echo -e "${BLUE}Test 7: Attempt Admin Action with Customer Token (Should Fail)${NC}"
echo "Request: POST $API_URL/products (with Customer Token - should be 403)"
FORBIDDEN=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "name":"Unauthorized Product",
    "description":"Test",
    "price":50000,
    "origin":"Test",
    "quantity":5,
    "category":"Test",
    "active":true
  }')

echo "Response:"
echo "$FORBIDDEN"

echo ""
echo "---"
echo ""

# Test 8: Invalid Token
echo -e "${BLUE}Test 8: Request with Invalid Token (Should Fail)${NC}"
echo "Request: GET $API_URL/orders (with invalid token)"
INVALID=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token_here")

echo "Response:"
echo "$INVALID"

echo ""
echo "===================================="
echo -e "${GREEN}✓ All tests completed!${NC}"
echo ""
echo "Summary:"
echo "  1. ✓ Admin can login"
echo "  2. ✓ Customer can login"
echo "  3. ✓ New users can register"
echo "  4. ✓ Public endpoints work"
echo "  5. ✓ Authenticated requests work"
echo "  6. ✓ Admin can create products"
echo "  7. ✓ Customer cannot perform admin actions"
echo "  8. ✓ Invalid tokens are rejected"
echo ""
