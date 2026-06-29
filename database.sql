-- Create database if not exists
CREATE DATABASE IF NOT EXISTS support_ticket_db;
USE support_ticket_db;

-- ===================== LOOKUP TABLES =====================

-- Roles Lookup Table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  permissions JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Priority Lookup Table
CREATE TABLE IF NOT EXISTS priorities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  level INT NOT NULL,
  description VARCHAR(255),
  color_code VARCHAR(7),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Ticket Status Lookup Table
CREATE TABLE IF NOT EXISTS ticket_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  color_code VARCHAR(7),
  is_final BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Ticket Category Lookup Table
CREATE TABLE IF NOT EXISTS ticket_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Department Lookup Table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  manager_id INT,
  email VARCHAR(100),
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- ===================== MAIN TABLES =====================

-- Users table (Updated with role_id foreign key)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role_id INT NOT NULL DEFAULT 1,
  department_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_role_id (role_id),
  INDEX idx_department_id (department_id)
);

-- Tickets table (Updated with foreign keys for lookups)
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id INT NOT NULL,
  department_id INT DEFAULT NULL,
  priority_id INT NOT NULL DEFAULT 2,
  status_id INT NOT NULL DEFAULT 1,
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE RESTRICT,
  FOREIGN KEY (status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status_id (status_id),
  INDEX idx_priority_id (priority_id),
  INDEX idx_category_id (category_id),
  INDEX idx_assigned_to (assigned_to)
);

-- Ticket comments/history table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_user_id (user_id)
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ===================== INSERT LOOKUP DATA =====================

-- -- Insert Roles
-- INSERT INTO roles (name, description, status) VALUES 
--   ('user', 'Regular user who can create and view tickets', 'active'),
--   ('supervisor', 'Supervisor who can manage team tickets and users', 'active'),
--   ('admin', 'Administrator with full system access', 'active');

-- -- Insert Priorities
-- INSERT INTO priorities (name, level, description, color_code, status) VALUES 
--   ('low', 1, 'Low priority - Can be resolved at convenience', '#28a745', 'active'),
--   ('medium', 2, 'Medium priority - Should be resolved soon', '#ffc107', 'active'),
--   ('high', 3, 'High priority - Needs urgent attention', '#fd7e14', 'active'),
--   ('urgent', 4, 'Urgent - Critical issue requiring immediate action', '#dc3545', 'active');

-- -- Insert Ticket Statuses
-- INSERT INTO ticket_statuses (name, description, color_code, is_final, status) VALUES 
--   ('open', 'Ticket is open and waiting for assignment', '#0dcaf0', FALSE, 'active'),
--   ('in_progress', 'Ticket is being worked on', '#0d6efd', FALSE, 'active'),
--   ('on_hold', 'Ticket is on hold waiting for customer response', '#6c757d', FALSE, 'active'),
--   ('resolved', 'Ticket has been resolved', '#198754', TRUE, 'active'),
--   ('closed', 'Ticket is closed', '#212529', TRUE, 'active');

-- -- Insert Ticket Categories
-- INSERT INTO ticket_categories (name, description, status) VALUES 
--   ('Technical Support', 'Technical issues and bugs', 'active'),
--   ('Account Management', 'Account-related requests', 'active'),
--   ('Billing & Payments', 'Billing and payment inquiries', 'active'),
--   ('Feature Request', 'Requests for new features', 'active'),
--   ('General Inquiry', 'General questions and inquiries', 'active'),
--   ('Bug Report', 'Bug reports and defects', 'active');

-- -- Insert Departments
-- INSERT INTO departments (name, description, email, phone, status) VALUES 
--   ('IT Support', 'Information Technology Support Department', 'itsupport@example.com', '1234567800', 'active'),
--   ('Billing', 'Billing and Finance Department', 'billing@example.com', '1234567801', 'active'),
--   ('Sales', 'Sales and Customer Acquisition', 'sales@example.com', '1234567802', 'active'),
--   ('Operations', 'Operations and Management', 'operations@example.com', '1234567803', 'active');

-- -- ===================== INSERT SAMPLE DATA =====================

-- -- Insert Users with roles and departments
-- -- Insert Users with hashed passwords (Password123! bcrypt hashed)
-- INSERT INTO users (name, email, password, phone, role_id, department_id, status) VALUES 
--   ('Admin User', 'admin@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567890', 3, 4, 'active'),
--   ('Supervisor John', 'supervisor@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567891', 2, 1, 'active'),
--   ('Support Agent Sarah', 'sarah@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567892', 2, 1, 'active'),
--   ('Regular User John', 'john@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567893', 1, NULL, 'active'),
--   ('Regular User Jane', 'jane@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567894', 1, NULL, 'active'),
--   ('Billing Manager Mike', 'mike@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567895', 2, 2, 'active'),
--   ('Sales Supervisor Lisa', 'lisa@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567896', 2, 3, 'active'),
--   ('Operations Manager David', 'david@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567897', 2, 4, 'active'),
--   ('Regular User Alice', 'alice@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567898', 1, NULL, 'active'),
--   ('Regular User Bob', 'bob@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567899', 1, NULL, 'active'),
--   ('Regular User Emma', 'emma@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567900', 1, NULL, 'active'),
--   ('IT Agent Tom', 'tom@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567901', 2, 1, 'active'),
--   ('Inactive User Chris', 'chris@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567902', 1, NULL, 'inactive'),
--   ('Second Admin Amy', 'amy@example.com', '$2a$10$Rnw4rxKBDxlJYKJIJ8K9WuGLbYn.TFxJW7PxVPLyYJR8h.1DWZzCG', '1234567903', 3, 4, 'active');
-- -- Sample credentials: email: *@example.com, password: Password123!

-- -- Insert Sample Tickets
-- INSERT INTO tickets (user_id, title, description, category_id, priority_id, status_id, assigned_to) VALUES 
--   (4, 'Cannot login to account', 'I am unable to login to my account. Getting authentication error.', 2, 3, 2, 2),
--   (5, 'Feature request - Dark mode', 'Would like to see a dark mode option in the application.', 4, 1, 1, 3),
--   (4, 'Bug: Import function not working', 'The bulk import feature crashes when uploading CSV files larger than 10MB.', 6, 3, 2, 2),
--   (5, 'Billing question', 'Can you explain the charge on my invoice from last month?', 3, 2, 1, 6);

-- -- Insert Sample Comments
-- INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES 
--   (1, 2, 'I have investigated the issue. It appears to be related to cached credentials. Let me clear your session.'),
--   (1, 4, 'Thank you for the quick response!'),
--   (3, 2, 'This is a known issue. Our dev team is working on it. Expected fix in next release.'),
--   (4, 6, 'I have reviewed your invoice. The charge is for the premium plan upgrade from Oct 15.');
