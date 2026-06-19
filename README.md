# Support Ticket System - Backend API

Complete Express.js backend for a Support Ticket Management System with MySQL integration.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MySQL Setup

#### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Run the database setup script
source database.sql
```

#### Option B: Using a MySQL GUI
- Open [database.sql](database.sql) in your MySQL GUI tool (e.g., phpMyAdmin, MySQL Workbench)
- Execute the SQL commands

### 3. Configure Environment Variables
1. Update [.env](.env) with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=support_ticket_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

### 4. Start the Server
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### User Management

#### Get All Users
```
GET /api/users
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "status": "active",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

#### Get Single User
```
GET /api/users/:id
```
Returns user details with associated tickets.

#### Create User
```
POST /api/users
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "role": "user"
}
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "phone": "1111111111",
  "role": "admin",
  "status": "active"
}
```

#### Delete User
```
DELETE /api/users/:id
```

#### Get User Statistics
```
GET /api/users/:id/stats
```
Returns ticket statistics for the user (total, open, in progress, resolved, closed, urgent).

---

### Ticket Management

#### Get All Tickets
```
GET /api/tickets
```
Returns all tickets with user and assignment information.

#### Get Single Ticket
```
GET /api/tickets/:id
```
Returns ticket details with associated comments.

#### Create Ticket
```
POST /api/tickets
Content-Type: application/json

{
  "user_id": 2,
  "title": "Login Issue",
  "description": "Unable to login to the system",
  "category": "Technical Support",
  "priority": "high"
}
```

**Priority options:** `low`, `medium`, `high`, `urgent` (default: `medium`)

#### Update Ticket
```
PUT /api/tickets/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": 1
}
```

**Status options:** `open`, `in_progress`, `on_hold`, `resolved`, `closed`

#### Delete Ticket
```
DELETE /api/tickets/:id
```

#### Add Comment to Ticket
```
POST /api/tickets/:id/comments
Content-Type: application/json

{
  "user_id": 1,
  "comment": "Working on this issue"
}
```

#### Get Ticket Comments
```
GET /api/tickets/:id/comments
```

---

## Database Schema

### Users Table
- `id` - Primary Key (AUTO_INCREMENT)
- `name` - User's name (VARCHAR 100)
- `email` - User's email (VARCHAR 100, UNIQUE)
- `phone` - User's phone number (VARCHAR 20)
- `role` - User role (admin/user)
- `status` - Account status (active/inactive)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Tickets Table
- `id` - Primary Key (AUTO_INCREMENT)
- `user_id` - Foreign Key to Users (creator)
- `title` - Ticket title (VARCHAR 255)
- `description` - Ticket description (TEXT)
- `category` - Ticket category (VARCHAR 50)
- `priority` - Ticket priority (low/medium/high/urgent)
- `status` - Ticket status (open/in_progress/on_hold/resolved/closed)
- `assigned_to` - Foreign Key to Users (assignee)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `resolved_at` - Resolution timestamp (nullable)

### Ticket Comments Table
- `id` - Primary Key (AUTO_INCREMENT)
- `ticket_id` - Foreign Key to Tickets
- `user_id` - Foreign Key to Users
- `comment` - Comment text (TEXT)
- `created_at` - Creation timestamp

---

## Health Check

```
GET /api/health
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

---

## Sample Data

The database setup script includes sample users:
- **Admin User** - admin@example.com (role: admin)
- **John Doe** - john@example.com (role: user)
- **Jane Smith** - jane@example.com (role: user)

---

## Testing with cURL

### Create a new user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"5555555555","role":"user"}'
```

### Get all users
```bash
curl http://localhost:3000/api/users
```

### Create a ticket
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"user_id":2,"title":"Test Ticket","description":"Test Description","category":"Support","priority":"high"}'
```

### Get all tickets
```bash
curl http://localhost:3000/api/tickets
```

---

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] Email notifications
- [ ] File attachments for tickets
- [ ] Ticket priority automation
- [ ] SLA management
- [ ] Knowledge base/FAQ integration
- [ ] Advanced search and filtering
- [ ] Report generation
- [ ] Ticket templates
- [ ] Multi-language support

---

## License

MIT
