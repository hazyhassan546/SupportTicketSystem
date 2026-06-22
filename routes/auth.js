var express = require('express');
var router = express.Router();
var pool = require('../db');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role_id, department_id } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password strength validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user already exists
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        connection.release();
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, phone, role_id, department_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone || null, role_id || 1, department_id || null, 'active']
      );

      // Fetch the created user
      const [newUser] = await connection.query(
        `SELECT u.id, u.name, u.email, u.role_id, u.department_id, r.name as role_name, d.name as department_name 
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.id = ?`,
        [result.insertId]
      );

      // Generate token
      const token = generateToken(newUser[0]);

      // Save session to DB
      const expiresAt = new Date(jwt.decode(token).exp * 1000);
      await connection.query(
        'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
        [newUser[0].id, token, req.ip || null, req.headers['user-agent'] || null, expiresAt]
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser[0],
          token: token
        }
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.query(
        `SELECT u.id, u.name, u.email, u.password, u.role_id, u.department_id, u.status, 
                r.name as role_name, d.name as department_name
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.email = ?`,
        [email]
      );

      if (users.length === 0) {
        connection.release();
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = users[0];

      // Check if user is active
      if (user.status !== 'active') {
        connection.release();
        return res.status(403).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        connection.release();
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate token
      const token = generateToken(user);

      // Save session to DB
      const expiresAt = new Date(jwt.decode(token).exp * 1000);
      await connection.query(
        'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
        [user.id, token, req.ip || null, req.headers['user-agent'] || null, expiresAt]
      );

      connection.release();

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token: token
        }
      });
    } catch (queryError) {
      connection.release();
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// Verify token endpoint (to check if token is still valid)
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: decoded
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role_id, u.department_id, u.status, u.created_at, u.updated_at,
              r.name as role_name, d.name as department_name
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.id]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { currentPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: currentPassword, newPassword'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await pool.getConnection();

    try {
      // Get user with password
      const [users] = await connection.query(
        'SELECT id, password FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

      if (!isPasswordValid) {
        connection.release();
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, decoded.id]
      );

      connection.release();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (queryError) {
      connection.release();
      throw queryError;
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});

module.exports = router;
