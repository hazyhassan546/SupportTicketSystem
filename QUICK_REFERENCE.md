# Quick Reference Guide - Support Ticket System

## 🚀 Getting Started (2 minutes)

### Prerequisites
- Node.js and npm installed
- MySQL server running
- Credentials ready in .env

### Quick Setup
```bash
npm install
mysql -u root -p < database.sql  # Import database
npm start                          # Start server on port 3000
```

---

## 📌 Essential Endpoints Reference

### Lookup Data (For Frontend Dropdowns)
```
GET /api/lookups/all          ← Get all lookups at once
GET /api/lookups/roles        ← Get all user roles
GET /api/lookups/priorities   ← Get ticket priorities
GET /api/lookups/statuses     ← Get ticket statuses
GET /api/lookups/categories   ← Get ticket categories
GET /api/lookups/departments  ← Get departments
```

### User Management
```
GET    /api/users             ← List all users
GET    /api/users/:id         ← Get user with tickets
POST   /api/users             ← Create user
PUT    /api/users/:id         ← Update user
DELETE /api/users/:id         ← Delete user
GET    /api/users/:id/stats   ← Get user statistics
```

### Ticket Management
```
GET    /api/tickets           ← List all tickets
GET    /api/tickets/:id       ← Get ticket with comments
POST   /api/tickets           ← Create ticket
PUT    /api/tickets/:id       ← Update ticket
DELETE /api/tickets/:id       ← Delete ticket
```

### Ticket Comments
```
POST   /api/tickets/:id/comments   ← Add comment
GET    /api/tickets/:id/comments   ← Get comments
```

---

## 💡 Common Use Cases

### 1️⃣ Initialize Frontend (Get all lookup data)
```bash
curl http://localhost:3000/api/lookups/all
```
Returns: roles, priorities, statuses, categories, departments

### 2️⃣ Create a Support Agent
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Agent",
    "email": "agent@example.com",
    "role_id": 2,
    "department_id": 1
  }'
```
- role_id: 1=user, 2=supervisor, 3=admin
- department_id: 1=IT, 2=Billing, 3=Sales, 4=Operations

### 3️⃣ Customer Creates a Ticket
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 4,
    "title": "Cannot reset password",
    "description": "Email not arriving",
    "category_id": 2,
    "priority_id": 3
  }'
```
- category_id: Check /api/lookups/categories
- priority_id: 1=low, 2=medium, 3=high, 4=urgent

### 4️⃣ Assign & Update Ticket
```bash
curl -X PUT http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status_id": 2,
    "assigned_to": 2,
    "priority_id": 4
  }'
```
- status_id: 1=open, 2=in_progress, 3=on_hold, 4=resolved, 5=closed
- assigned_to: User ID of agent

### 5️⃣ Add Resolution Comment
```bash
curl -X POST http://localhost:3000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "comment": "Issue resolved. Password reset email sent."
  }'
```

### 6️⃣ Close the Ticket
```bash
curl -X PUT http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status_id": 5
  }'
```
Status 5 = closed, resolves_at timestamp is auto-set

---

## 📊 Sample Data Reference

### Default Users
| ID | Name | Email | Role | Department |
|---|---|---|---|---|
| 1 | Admin User | admin@example.com | admin | Operations |
| 2 | Supervisor John | supervisor@example.com | supervisor | IT Support |
| 3 | Support Agent Sarah | sarah@example.com | supervisor | IT Support |
| 4 | Regular User John | john@example.com | user | - |
| 5 | Regular User Jane | jane@example.com | user | - |
| 6 | Billing Manager Mike | mike@example.com | supervisor | Billing |

### Roles
| ID | Name | Description |
|---|---|---|
| 1 | user | Regular user |
| 2 | supervisor | Team manager |
| 3 | admin | Full access |

### Priorities
| ID | Name | Level |
|---|---|---|
| 1 | low | Level 1 |
| 2 | medium | Level 2 |
| 3 | high | Level 3 |
| 4 | urgent | Level 4 |

### Statuses
| ID | Name | Final |
|---|---|---|
| 1 | open | No |
| 2 | in_progress | No |
| 3 | on_hold | No |
| 4 | resolved | Yes |
| 5 | closed | Yes |

### Categories (Sample)
| ID | Name |
|---|---|
| 1 | Technical Support |
| 2 | Account Management |
| 3 | Billing & Payments |
| 4 | Feature Request |
| 5 | General Inquiry |
| 6 | Bug Report |

### Departments
| ID | Name | Manager |
|---|---|---|
| 1 | IT Support | Supervisor John |
| 2 | Billing | Billing Manager Mike |
| 3 | Sales | - |
| 4 | Operations | Admin User |

---

## ✅ Response Format

All successful responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

All error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

---

## 🔍 Most Used Queries

### Get All Users with Roles
```bash
curl http://localhost:3000/api/users | jq '.data[] | {id, name, email, role_name, department_name}'
```

### Get All Open Tickets
```bash
curl http://localhost:3000/api/tickets | jq '.data[] | select(.status_id == 1)'
```

### Get Urgent Tickets
```bash
curl http://localhost:3000/api/tickets | jq '.data[] | select(.priority_id == 4)'
```

### Get All Unassigned Tickets
```bash
curl http://localhost:3000/api/tickets | jq '.data[] | select(.assigned_to == null)'
```

### Get User's Statistics
```bash
curl http://localhost:3000/api/users/4/stats
```

---

## 📝 Request Body Reference

### Create User
```json
{
  "name": "string",              // required
  "email": "string",             // required, unique
  "phone": "string",             // optional
  "role_id": 1-3,                // optional, default=1
  "department_id": 1-4           // optional
}
```

### Create Ticket
```json
{
  "user_id": number,             // required
  "title": "string",             // required
  "description": "string",       // required
  "category_id": number,         // required (1-6)
  "priority_id": 1-4             // optional, default=2
}
```

### Update Ticket
```json
{
  "title": "string",             // optional
  "description": "string",       // optional
  "category_id": number,         // optional
  "priority_id": 1-4,            // optional
  "status_id": 1-5,              // optional
  "assigned_to": number          // optional
}
```

### Add Comment
```json
{
  "user_id": number,             // required
  "comment": "string"            // required
}
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check MySQL is running and .env credentials are correct |
| Email already exists | Use a unique email address |
| Invalid role_id | Use 1, 2, or 3 (check /api/lookups/roles) |
| Invalid category_id | Check /api/lookups/categories for valid IDs |
| Not found error | Verify the ID exists in the database |

---

## 📚 Full Documentation

For complete details, see:
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [LOOKUP_IMPLEMENTATION.md](LOOKUP_IMPLEMENTATION.md) - Lookup tables & roles
- [README.md](README.md) - Basic setup

---

## 🎯 Features Summary

✅ 3 User Roles (user, supervisor, admin)
✅ 5 Ticket Statuses (open, in_progress, on_hold, resolved, closed)
✅ 4 Priority Levels (low, medium, high, urgent)
✅ 6+ Ticket Categories
✅ Department Management
✅ Role-based User Management
✅ Ticket Assignment & Tracking
✅ Comments & Discussion
✅ User Statistics
✅ Data Integrity with Foreign Keys

---

## 🔗 API Base URL
```
http://localhost:3000
```

**Ready to use!** 🚀
