var express = require("express");
var router = express.Router();
var pool = require("../db");

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const user_id = req.user.id;
    const connection = await pool.getConnection();
    const [tickets] = await connection.query(
      `SELECT t.*, u.name as user_name, u.email as user_email,
              a.name as assigned_name, r.name as role_name,
              tc.name as category_name, p.name as priority_name, ts.name as status_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN ticket_categories tc ON t.category_id = tc.id
       LEFT JOIN priorities p ON t.priority_id = p.id
       LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
       WHERE t.user_id = ? OR t.assigned_to = ?
       ORDER BY t.created_at DESC`,
      [user_id, user_id],
    );
    connection.release();

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tickets",
      error: error.message,
    });
  }
});

// GET single ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [tickets] = await connection.query(
      `SELECT t.*, u.name as user_name, u.email as user_email,
              a.name as assigned_name, r.name as role_name,
              tc.name as category_name, p.name as priority_name, ts.name as status_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN ticket_categories tc ON t.category_id = tc.id
       LEFT JOIN priorities p ON t.priority_id = p.id
       LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
       WHERE t.id = ?`,
      [id],
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Get comments for the ticket
    const [comments] = await connection.query(
      `SELECT tc.*, u.name, u.email, r.name as role_name
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE tc.ticket_id = ?
       ORDER BY tc.created_at DESC`,
      [id],
    );

    connection.release();

    res.json({
      success: true,
      data: {
        ...tickets[0],
        comments: comments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching ticket",
      error: error.message,
    });
  }
});

// CREATE new ticket ( draft ticket creation route)
router.post("/", async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      title,
      description,
      category_id,
      priority_id,
      department_id,
      is_submitted,
    } = req.body;

    // Validation
    if (!title || !description || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, category_id",
      });
    }

    const connection = await pool.getConnection();

    // Check if category exists
    const [categories] = await connection.query(
      "SELECT id FROM ticket_categories WHERE id = ?",
      [category_id],
    );

    if (categories.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if department exists
    const [departments] = await connection.query(
      "SELECT id, manager_id FROM departments WHERE id = ?",
      [department_id],
    );

    if (departments.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    console.log("departments", departments);

    // Check if priority exists (if provided)
    if (priority_id) {
      const [priorities] = await connection.query(
        "SELECT id FROM priorities WHERE id = ?",
        [priority_id],
      );
      if (priorities.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: "Priority not found",
        });
      }
    }

    const status = is_submitted ? 1 : 6; // 1 for submitted, 6 for draft

    const [result] = await connection.query(
      `INSERT INTO tickets (user_id, title, description, category_id, department_id, assigned_to, priority_id, status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [
        user_id,
        title,
        description,
        category_id,
        department_id,
        departments[0].manager_id,
        priority_id || 2,
        status,
      ],
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: {
        id: result.insertId,
        user_id,
        title,
        description,
        category_id,
        department_id,
        priority_id: priority_id || 2,
        status_id: 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating ticket",
      error: error.message,
    });
  }
});

// UPDATE ticket
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      priority_id,
      status_id,
      assigned_to,
    } = req.body;

    const connection = await pool.getConnection();

    // Check if ticket exists
    const [tickets] = await connection.query(
      "SELECT id FROM tickets WHERE id = ?",
      [id],
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }
    if (category_id !== undefined) {
      updateFields.push("category_id = ?");
      updateValues.push(category_id);
    }
    if (priority_id !== undefined) {
      updateFields.push("priority_id = ?");
      updateValues.push(priority_id);
    }
    if (status_id !== undefined) {
      updateFields.push("status_id = ?");
      updateValues.push(status_id);

      // Set resolved_at if status is resolved (status_id = 4)
      if (status_id === 4) {
        updateFields.push("resolved_at = NOW()");
      }
    }
    if (assigned_to !== undefined) {
      updateFields.push("assigned_to = ?");
      updateValues.push(assigned_to);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updateValues.push(id);

    await connection.query(
      `UPDATE tickets SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );

    connection.release();

    res.json({
      success: true,
      message: "Ticket updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating ticket",
      error: error.message,
    });
  }
});

// DELETE ticket
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if ticket exists
    const [tickets] = await connection.query(
      "SELECT id FROM tickets WHERE id = ?",
      [id],
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    await connection.query("DELETE FROM tickets WHERE id = ?", [id]);
    connection.release();

    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting ticket",
      error: error.message,
    });
  }
});

// ADD comment to ticket
router.post("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: comment",
      });
    }

    const connection = await pool.getConnection();

    // Check if ticket exists
    const [tickets] = await connection.query(
      "SELECT id FROM tickets WHERE id = ?",
      [id],
    );

    if (tickets.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if user exists
    const [users] = await connection.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id],
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [result] = await connection.query(
      "INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)",
      [id, user_id, comment],
    );

    console.log("result", result);

    const [comments] = await connection.query(
      `SELECT tc.*, u.name, u.email
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?
       ORDER BY tc.created_at DESC`,
      [parseInt(result.insertId)],
    );

    console.log("comments", comments);

    connection.release();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comments[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
});

// GET ticket comments
router.get("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [comments] = await connection.query(
      `SELECT tc.*, u.name, u.email
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = ?
       ORDER BY tc.created_at DESC`,
      [id],
    );

    connection.release();

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
});

// DELETE comment by id
router.delete("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.id;
    const connection = await pool.getConnection();

    const [comments] = await connection.query(
      "SELECT id, user_id FROM ticket_comments WHERE id = ?",
      [commentId],
    );

    if (comments.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // only the author can delete their own comment
    if (comments[0].user_id !== user_id) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment",
      });
    }

    await connection.query("DELETE FROM ticket_comments WHERE id = ?", [commentId]);
    connection.release();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
});

module.exports = router;
