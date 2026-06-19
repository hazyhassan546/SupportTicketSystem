# Support Ticket System - Complete API Documentation

## Database Enhancements

The system now includes lookup tables for better data management and role-based access control:

### Lookup Tables
- **roles** - User roles (user, supervisor, admin)
- **priorities** - Ticket priorities (low, medium, high, urgent)
- **ticket_statuses** - Ticket statuses (open, in_progress, on_hold, resolved, closed)
- **ticket_categories** - Ticket categories for classification
- **departments** - Organization departments

### Sample Data Included
- **3 Roles**: user, supervisor, admin
- **4 Priority Levels**: low, medium, high, urgent
- **5 Ticket Statuses**: open, in_progress, on_hold, resolved, closed
- **6 Ticket Categories**: Technical Support, Account Management, Billing & Payments, Feature Request, General Inquiry, Bug Report
- **4 Departments**: IT Support, Billing, Sales, Operations
- **6 Sample Users** with different roles and departments
- **4 Sample Tickets** with real-world scenarios

---

## API Base URL
```
http://localhost:3000
```

---

## Health Check

### Endpoint
```
GET /api/health
```

### Response
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Lookup APIs

### Get All Lookups (Single Request)
Retrieve all lookup data in one call for UI initialization.

```
GET /api/lookups/all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [...],
    "priorities": [...],
    "statuses": [...],
    "categories": [...],
    "departments": [...]
  }
}
```

---

## Roles Management

### Get All Roles
```
GET /api/lookups/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "user",
      "description": "Regular user who can create and view tickets",
      "status": "active",
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "supervisor",
      "description": "Supervisor who can manage team tickets and users",
      "status": "active"
    },
    {
      "id": 3,
      "name": "admin",
      "description": "Administrator with full system access",
      "status": "active"
    }
  ]
}
```

### Get Single Role
```
GET /api/lookups/roles/:id
```

### Create Role
```
POST /api/lookups/roles
Content-Type: application/json

{
  "name": "manager",
  "description": "Manager with reporting access",
  "status": "active"
}
```

### Update Role
```
PUT /api/lookups/roles/:id
Content-Type: application/json

{
  "description": "Updated description",
  "status": "active"
}
```

---

## Priorities Management

### Get All Priorities
```
GET /api/lookups/priorities
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "low",
      "level": 1,
      "description": "Low priority - Can be resolved at convenience",
      "color_code": "#28a745"
    },
    {
      "id": 2,
      "name": "medium",
      "level": 2,
      "description": "Medium priority - Should be resolved soon",
      "color_code": "#ffc107"
    },
    {
      "id": 3,
      "name": "high",
      "level": 3,
      "description": "High priority - Needs urgent attention",
      "color_code": "#fd7e14"
    },
    {
      "id": 4,
      "name": "urgent",
      "level": 4,
      "description": "Urgent - Critical issue requiring immediate action",
      "color_code": "#dc3545"
    }
  ]
}
```

### Get Single Priority
```
GET /api/lookups/priorities/:id
```

---

## Ticket Statuses Management

### Get All Statuses
```
GET /api/lookups/statuses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "open",
      "description": "Ticket is open and waiting for assignment",
      "color_code": "#0dcaf0",
      "is_final": false
    },
    {
      "id": 2,
      "name": "in_progress",
      "description": "Ticket is being worked on",
      "color_code": "#0d6efd",
      "is_final": false
    },
    {
      "id": 3,
      "name": "on_hold",
      "description": "Ticket is on hold waiting for customer response",
      "color_code": "#6c757d",
      "is_final": false
    },
    {
      "id": 4,
      "name": "resolved",
      "description": "Ticket has been resolved",
      "color_code": "#198754",
      "is_final": true
    },
    {
      "id": 5,
      "name": "closed",
      "description": "Ticket is closed",
      "color_code": "#212529",
      "is_final": true
    }
  ]
}
```

### Get Single Status
```
GET /api/lookups/statuses/:id
```

---

## Ticket Categories Management

### Get All Categories
```
GET /api/lookups/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Technical Support",
      "description": "Technical issues and bugs",
      "icon": null,
      "status": "active"
    },
    {
      "id": 2,
      "name": "Account Management",
      "description": "Account-related requests",
      "status": "active"
    }
  ]
}
```

### Get Single Category
```
GET /api/lookups/categories/:id
```

### Create Category
```
POST /api/lookups/categories
Content-Type: application/json

{
  "name": "Security Issue",
  "description": "Security-related issues and vulnerabilities",
  "icon": "shield",
  "status": "active"
}
```

### Update Category
```
PUT /api/lookups/categories/:id
Content-Type: application/json

{
  "description": "Updated description"
}
```

---

## Departments Management

### Get All Departments
```
GET /api/lookups/departments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "IT Support",
      "description": "Information Technology Support Department",
      "manager_id": 2,
      "manager_name": "Supervisor John",
      "email": "itsupport@example.com",
      "phone": "1234567800",
      "status": "active"
    }
  ]
}
```

### Get Single Department (with employee count)
```
GET /api/lookups/departments/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "IT Support",
    "manager_name": "Supervisor John",
    "employee_count": 3,
    ...
  }
}
```

### Create Department
```
POST /api/lookups/departments
Content-Type: application/json

{
  "name": "Human Resources",
  "description": "HR Department",
  "manager_id": 2,
  "email": "hr@example.com",
  "phone": "1234567850"
}
```

### Update Department
```
PUT /api/lookups/departments/:id
Content-Type: application/json

{
  "manager_id": 3,
  "email": "newemail@example.com"
}
```

---

## User Management

### Get All Users
```
GET /api/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
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
  ]
}
```

### Get Single User with Tickets
```
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Regular User John",
    "email": "john@example.com",
    "role_id": 1,
    "role_name": "user",
    "department_id": null,
    "status": "active",
    "tickets": [
      {
        "id": 1,
        "title": "Cannot login to account",
        "status_id": 2,
        "status_name": "in_progress",
        "priority_id": 3,
        "priority_name": "high",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Create User
```
POST /api/users
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "5555555555",
  "role_id": 1,
  "department_id": 2
}
```

**Parameters:**
- `name` (required) - User's full name
- `email` (required) - User's email (must be unique)
- `phone` (optional) - User's phone number
- `role_id` (optional) - Role ID (defaults to 1 - user)
- `department_id` (optional) - Department ID

### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "role_id": 2,
  "department_id": 1,
  "status": "active"
}
```

### Delete User
```
DELETE /api/users/:id
```

### Get User Statistics
```
GET /api/users/:id/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_tickets": 4,
    "open_tickets": 1,
    "in_progress_tickets": 1,
    "resolved_tickets": 2,
    "closed_tickets": 0,
    "urgent_tickets": 1
  }
}
```

---

## Ticket Management

### Get All Tickets
```
GET /api/tickets
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 4,
      "user_name": "Regular User John",
      "user_email": "john@example.com",
      "title": "Cannot login to account",
      "description": "I am unable to login...",
      "category_id": 2,
      "category_name": "Account Management",
      "priority_id": 3,
      "priority_name": "high",
      "status_id": 2,
      "status_name": "in_progress",
      "assigned_to": 2,
      "assigned_name": "Supervisor John",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### Get Single Ticket with Comments
```
GET /api/tickets/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 4,
    "title": "Cannot login to account",
    "category_id": 2,
    "category_name": "Account Management",
    "priority_id": 3,
    "priority_name": "high",
    "status_id": 2,
    "status_name": "in_progress",
    "comments": [
      {
        "id": 1,
        "ticket_id": 1,
        "user_id": 2,
        "name": "Supervisor John",
        "role_name": "supervisor",
        "comment": "I have investigated the issue...",
        "created_at": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

### Create Ticket
```
POST /api/tickets
Content-Type: application/json

{
  "user_id": 4,
  "title": "Cannot reset password",
  "description": "I'm unable to reset my password. The email is not arriving.",
  "category_id": 2,
  "priority_id": 3
}
```

**Parameters:**
- `user_id` (required) - User ID creating the ticket
- `title` (required) - Ticket title
- `description` (required) - Ticket description
- `category_id` (required) - Category ID (from /api/lookups/categories)
- `priority_id` (optional) - Priority ID (defaults to 2 - medium)

### Update Ticket
```
PUT /api/tickets/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "priority_id": 4,
  "status_id": 2,
  "assigned_to": 3
}
```

**Parameters:**
- `title` - New title
- `description` - New description
- `category_id` - Category ID
- `priority_id` - Priority ID (1-4)
- `status_id` - Status ID (1-5)
- `assigned_to` - User ID to assign ticket to

### Delete Ticket
```
DELETE /api/tickets/:id
```

### Add Comment to Ticket
```
POST /api/tickets/:id/comments
Content-Type: application/json

{
  "user_id": 2,
  "comment": "I have investigated the issue. It appears to be a caching problem."
}
```

**Parameters:**
- `user_id` (required) - User ID adding the comment
- `comment` (required) - Comment text

### Get Ticket Comments
```
GET /api/tickets/:id/comments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_id": 1,
      "user_id": 2,
      "name": "Supervisor John",
      "email": "supervisor@example.com",
      "role_name": "supervisor",
      "comment": "I have investigated the issue...",
      "created_at": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: name, email"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating user",
  "error": "Database connection failed"
}
```

---

## Role-Based Access (Future Enhancement)

The system is prepared for role-based access control:
- **user**: Can create tickets, view own tickets and comments
- **supervisor**: Can manage team tickets, assign tickets, manage users
- **admin**: Full system access, can manage all data including roles, departments, and lookups

---

## Sample cURL Requests

### Get all lookups
```bash
curl http://localhost:3000/api/lookups/all
```

### Create a user with role and department
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "5555555555",
    "role_id": 2,
    "department_id": 1
  }'
```

### Create a ticket
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 4,
    "title": "Cannot access dashboard",
    "description": "Dashboard is showing 403 error",
    "category_id": 1,
    "priority_id": 3
  }'
```

### Update ticket status
```bash
curl -X PUT http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status_id": 2,
    "assigned_to": 2
  }'
```

### Add comment to ticket
```bash
curl -X POST http://localhost:3000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "comment": "Working on this issue"
  }'
```

---

## Database Statistics

- **Total Tables**: 8 (5 lookup + 3 main)
- **Total Indexes**: 20+
- **Foreign Keys**: 6
- **Cascade Deletes**: Enabled for data integrity

---

## Next Steps

1. **Install dependencies**: `npm install`
2. **Setup database**: `mysql -u root -p < database.sql`
3. **Configure .env**: Update database credentials
4. **Start server**: `npm start`
5. **Test API**: Use POSTMAN_COLLECTION.json or cURL commands
