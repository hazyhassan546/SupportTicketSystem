# JWT Authentication Implementation Guide

## 🔐 Overview

JWT (JSON Web Token) authentication has been integrated into the Support Ticket System. All API routes except authentication endpoints now require a valid JWT token.

---

## 📦 New Dependencies

- `jsonwebtoken` - JWT token generation and verification
- `bcryptjs` - Password hashing and comparison

## 🔧 Installation

```bash
npm install
```

---

## 🗄️ Database Changes

The `users` table now includes a `password` column:
```sql
password VARCHAR(255) NOT NULL
```

All sample users have been created with a hashed password.

---

## 🔑 Environment Configuration

Update `.env` file with:
```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` in production!

---

## 📋 Authentication Endpoints

### 1. Register New User
**Public endpoint** - No token required

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "1234567890",
  "role_id": 1,
  "department_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 7,
      "name": "John Doe",
      "email": "john@example.com",
      "role_id": 1,
      "role_name": "user",
      "department_id": 1,
      "department_name": "IT Support"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User
**Public endpoint** - No token required

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role_id": 3,
      "role_name": "admin",
      "department_id": 4,
      "department_name": "Operations",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Verify Token
**Protected endpoint** - Token required

```
POST /api/auth/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role_id": 3,
      "name": "Admin User"
    }
  }
}
```

---

### 4. Get Current User Profile
**Protected endpoint** - Token required

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "1234567890",
    "role_id": 3,
    "role_name": "admin",
    "department_id": 4,
    "department_name": "Operations",
    "status": "active",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 5. Change Password
**Protected endpoint** - Token required

```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🔒 Protected Endpoints

All endpoints below require a valid JWT token in the Authorization header:

### User Management
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/stats
```

### Ticket Management
```
GET    /api/tickets
GET    /api/tickets/:id
POST   /api/tickets
PUT    /api/tickets/:id
DELETE /api/tickets/:id
POST   /api/tickets/:id/comments
GET    /api/tickets/:id/comments
```

### Lookups
```
GET    /api/lookups/all
GET    /api/lookups/roles
GET    /api/lookups/priorities
GET    /api/lookups/categories
GET    /api/lookups/departments
... and more
```

---

## 📤 Using the Token

Include the token in the `Authorization` header with the `Bearer` scheme:

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🧪 Quick Testing with cURL

### Step 1: Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Save the returned `token`.

### Step 2: Use Token for Protected Endpoints
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Login with Existing User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!"
  }'
```

---

## 🛡️ Token Security Features

### Password Requirements
- Minimum 6 characters
- Hashed using bcryptjs with salt rounds of 10
- Never stored in plain text

### Token Features
- Expires after 7 days (configurable via `JWT_EXPIRE`)
- Contains user ID, email, role ID, and name
- Signed with `JWT_SECRET`
- Used for identifying user in requests

### Security Best Practices
1. ✅ Keep `JWT_SECRET` secure - change in production
2. ✅ Use HTTPS in production
3. ✅ Implement token refresh logic for long-lived sessions
4. ✅ Store tokens securely on client (HttpOnly cookies recommended)
5. ✅ Validate token expiration

---

## ⚠️ Error Responses

### Missing Token
```json
{
  "success": false,
  "message": "No token provided. Please log in first."
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or malformed token."
}
```

### Token Expired
```json
{
  "success": false,
  "message": "Token has expired. Please log in again."
}
```

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Inactive User
```json
{
  "success": false,
  "message": "User account is inactive"
}
```

---

## 📋 Sample Users (for testing)

All sample users have password: **`Password123!`**

| Email | Role | Password |
|-------|------|----------|
| admin@example.com | admin | Password123! |
| supervisor@example.com | supervisor | Password123! |
| sarah@example.com | supervisor | Password123! |
| john@example.com | user | Password123! |
| jane@example.com | user | Password123! |
| mike@example.com | supervisor | Password123! |

---

## 🔄 Token Workflow

```
1. User Registration/Login
   ↓
2. Server generates JWT token
   ↓
3. Client stores token
   ↓
4. Client includes token in Authorization header for each request
   ↓
5. Server verifies token
   ↓
6. Request processed (if token valid)
```

---

## 🔐 Middleware Usage

Two middleware functions are available:

### 1. `verifyToken` - Verify JWT Token
```javascript
const { verifyToken } = require('./middleware/auth');
router.get('/protected', verifyToken, (req, res) => {
  // req.user contains decoded token data
  res.json({ userId: req.user.id });
});
```

### 2. `checkRole` - Verify User Role
```javascript
const { checkRole } = require('./middleware/auth');
// Allow only supervisors and admins (role_id 2 and 3)
router.delete('/admin-only', verifyToken, checkRole([3]), (req, res) => {
  // Only admins can access
});
```

---

## 🔄 API Flow Example

### Complete Authentication Flow

1. **User Registers**
   ```bash
   POST /api/auth/register
   → Returns: token + user data
   ```

2. **User Logs In**
   ```bash
   POST /api/auth/login
   → Returns: token + user data
   ```

3. **Create Ticket (with authentication)**
   ```bash
   POST /api/tickets
   Authorization: Bearer <token>
   → Returns: ticket created
   ```

4. **View User Profile**
   ```bash
   GET /api/auth/me
   Authorization: Bearer <token>
   → Returns: current user profile
   ```

5. **Change Password**
   ```bash
   POST /api/auth/change-password
   Authorization: Bearer <token>
   → Returns: success message
   ```

---

## 🎯 Integration with Frontend

### JavaScript/React Example
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.data.token);

// Use token for API calls
const ticketsResponse = await fetch('/api/tickets', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```

---

## 📚 Related Files

- [routes/auth.js](routes/auth.js) - Authentication endpoints
- [middleware/auth.js](middleware/auth.js) - JWT verification middleware
- [app.js](app.js) - Application configuration with auth routes
- [database.sql](database.sql) - Updated with password field

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No token provided" | Include `Authorization: Bearer <token>` header |
| "Token has expired" | Login again to get a new token |
| "Invalid email or password" | Verify credentials are correct |
| "User account is inactive" | Contact admin to reactivate account |
| Password too short | Use at least 6 characters |

---

## 📈 Next Steps

1. ✅ Implement JWT authentication
2. ⭕ Add refresh token mechanism
3. ⭕ Implement rate limiting
4. ⭕ Add audit logging for authentication events
5. ⭕ Implement 2FA (Two-Factor Authentication)
6. ⭕ Add OAuth2 support

---

**JWT Authentication is now fully integrated!** 🎉
