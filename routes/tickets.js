var express = require('express');
var router = express.Router();
var pool = require('../db');

// GET all tickets
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tickets] = await connection.query(
      `SELECT t.*, u.name as user_name, u.email as user_email, 
              a.name as assigned_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ORDER BY t.created_at DESC`
    );
    connection.release();
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
});

// GET single ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const [tickets] = await connection.query(
      `SELECT t.*, u.name as user_name, u.email as user_email,
              a.name as assigned_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [id]
    );
    
    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Get comments for the ticket
    const [comments] = await connection.query(
      `SELECT tc.*, u.name, u.email
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = ?
       ORDER BY tc.created_at DESC`,
      [id]
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: {
        ...tickets[0],
        comments: comments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
});

// CREATE new ticket
router.post('/', async (req, res) => {
  try {
    const { user_id, title, description, category, priority } = req.body;

    // Validation
    if (!user_id || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, title, description, category'
      });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [result] = await connection.query(
      `INSERT INTO tickets (user_id, title, description, category, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, title, description, category, priority || 'medium']
    );
    
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        id: result.insertId,
        user_id,
        title,
        description,
        category,
        priority: priority || 'medium',
        status: 'open'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
});

// UPDATE ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, status, assigned_to } = req.body;

    const connection = await pool.getConnection();

    // Check if ticket exists
    const [tickets] = await connection.query(
      'SELECT id FROM tickets WHERE id = ?',
      [id]
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
      
      // Set resolved_at if status is resolved
      if (status === 'resolved') {
        updateFields.push('resolved_at = NOW()');
      }
    }
    if (assigned_to !== undefined) {
      updateFields.push('assigned_to = ?');
      updateValues.push(assigned_to);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await connection.query(
      `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    connection.release();

    res.json({
      success: true,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
});

// DELETE ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if ticket exists
    const [tickets] = await connection.query(
      'SELECT id FROM tickets WHERE id = ?',
      [id]
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await connection.query('DELETE FROM tickets WHERE id = ?', [id]);
    connection.release();

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket',
      error: error.message
    });
  }
});

// ADD comment to ticket
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, comment } = req.body;

    if (!user_id || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, comment'
      });
    }

    const connection = await pool.getConnection();

    // Check if ticket exists
    const [tickets] = await connection.query(
      'SELECT id FROM tickets WHERE id = ?',
      [id]
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [result] = await connection.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [id, user_id, comment]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        id: result.insertId,
        ticket_id: id,
        user_id,
        comment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
});

// GET ticket comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [comments] = await connection.query(
      `SELECT tc.*, u.name, u.email
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = ?
       ORDER BY tc.created_at DESC`,
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

module.exports = router;
