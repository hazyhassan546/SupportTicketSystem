var express = require('express');
var router = express.Router();
var pool = require('../db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, phone, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    connection.release();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET single user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, name, email, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's tickets
    const [tickets] = await connection.query(
      `SELECT id, title, status, priority, created_at FROM tickets 
       WHERE user_id = ? ORDER BY created_at DESC`,
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: {
        ...users[0],
        tickets: tickets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// CREATE new user
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email'
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

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)',
        [name, email, phone || null, role || 'user']
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: result.insertId,
          name,
          email,
          phone: phone || null,
          role: role || 'user',
          status: 'active'
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
      message: 'Error creating user',
      error: error.message
    });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    try {
      await connection.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      connection.release();

      res.json({
        success: true,
        message: 'User updated successfully'
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
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    connection.release();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// GET user statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Verify user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get ticket statistics
    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tickets
       FROM tickets
       WHERE user_id = ?`,
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router;
