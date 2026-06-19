var express = require('express');
var router = express.Router();
var pool = require('../db');

// ===================== ROLES ENDPOINTS =====================

// GET all roles
router.get('/roles', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [roles] = await connection.query(
      'SELECT * FROM roles ORDER BY id ASC'
    );
    connection.release();

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
});

// GET single role
router.get('/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [roles] = await connection.query(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    if (roles.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    connection.release();

    res.json({
      success: true,
      data: roles[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
});

// CREATE role (Admin only)
router.post('/roles', async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: name'
      });
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        'INSERT INTO roles (name, description, status) VALUES (?, ?, ?)',
        [name, description || null, status || 'active']
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: {
          id: result.insertId,
          name,
          description: description || null,
          status: status || 'active'
        }
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Role name already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
});

// UPDATE role
router.put('/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const connection = await pool.getConnection();

    const [roles] = await connection.query('SELECT id FROM roles WHERE id = ?', [id]);

    if (roles.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
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
        `UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      connection.release();

      res.json({
        success: true,
        message: 'Role updated successfully'
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Role name already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
});

// ===================== PRIORITIES ENDPOINTS =====================

// GET all priorities
router.get('/priorities', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [priorities] = await connection.query(
      'SELECT * FROM priorities WHERE status = "active" ORDER BY level ASC'
    );
    connection.release();

    res.json({
      success: true,
      data: priorities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching priorities',
      error: error.message
    });
  }
});

// GET single priority
router.get('/priorities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [priorities] = await connection.query(
      'SELECT * FROM priorities WHERE id = ?',
      [id]
    );

    if (priorities.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Priority not found'
      });
    }

    connection.release();

    res.json({
      success: true,
      data: priorities[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching priority',
      error: error.message
    });
  }
});

// ===================== TICKET STATUSES ENDPOINTS =====================

// GET all ticket statuses
router.get('/statuses', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [statuses] = await connection.query(
      'SELECT * FROM ticket_statuses WHERE status = "active" ORDER BY id ASC'
    );
    connection.release();

    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statuses',
      error: error.message
    });
  }
});

// GET single status
router.get('/statuses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [statuses] = await connection.query(
      'SELECT * FROM ticket_statuses WHERE id = ?',
      [id]
    );

    if (statuses.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Status not found'
      });
    }

    connection.release();

    res.json({
      success: true,
      data: statuses[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching status',
      error: error.message
    });
  }
});

// ===================== CATEGORIES ENDPOINTS =====================

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.query(
      'SELECT * FROM ticket_categories WHERE status = "active" ORDER BY name ASC'
    );
    connection.release();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET single category
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [categories] = await connection.query(
      'SELECT * FROM ticket_categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    connection.release();

    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// CREATE category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: name'
      });
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        'INSERT INTO ticket_categories (name, description, icon, status) VALUES (?, ?, ?, ?)',
        [name, description || null, icon || null, status || 'active']
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: result.insertId,
          name,
          description: description || null,
          icon: icon || null,
          status: status || 'active'
        }
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Category name already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// UPDATE category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, status } = req.body;

    const connection = await pool.getConnection();

    const [categories] = await connection.query(
      'SELECT id FROM ticket_categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (icon !== undefined) {
      updateFields.push('icon = ?');
      updateValues.push(icon);
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
        `UPDATE ticket_categories SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      connection.release();

      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Category name already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// ===================== DEPARTMENTS ENDPOINTS =====================

// GET all departments
router.get('/departments', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [departments] = await connection.query(
      `SELECT d.*, u.name as manager_name 
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.status = "active"
       ORDER BY d.name ASC`
    );
    connection.release();

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

// GET single department
router.get('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [departments] = await connection.query(
      `SELECT d.*, u.name as manager_name, COUNT(users.id) as employee_count
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       LEFT JOIN users ON users.department_id = d.id
       WHERE d.id = ?
       GROUP BY d.id`,
      [id]
    );

    if (departments.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    connection.release();

    res.json({
      success: true,
      data: departments[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
});

// CREATE department
router.post('/departments', async (req, res) => {
  try {
    const { name, description, manager_id, email, phone, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: name'
      });
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        'INSERT INTO departments (name, description, manager_id, email, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description || null, manager_id || null, email || null, phone || null, status || 'active']
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: {
          id: result.insertId,
          name,
          description: description || null,
          manager_id: manager_id || null,
          email: email || null,
          phone: phone || null,
          status: status || 'active'
        }
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Department name already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
});

// UPDATE department
router.put('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, manager_id, email, phone, status } = req.body;

    const connection = await pool.getConnection();

    const [departments] = await connection.query(
      'SELECT id FROM departments WHERE id = ?',
      [id]
    );

    if (departments.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (manager_id !== undefined) {
      updateFields.push('manager_id = ?');
      updateValues.push(manager_id);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
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
        `UPDATE departments SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      connection.release();

      res.json({
        success: true,
        message: 'Department updated successfully'
      });
    } catch (queryError) {
      connection.release();
      if (queryError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Department name already exists'
        });
      }
      throw queryError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
});

// ===================== DASHBOARD/ANALYTICS ENDPOINTS =====================

// GET all lookups at once (for UI initialization)
router.get('/all', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [roles] = await connection.query('SELECT * FROM roles WHERE status = "active"');
    const [priorities] = await connection.query('SELECT * FROM priorities WHERE status = "active" ORDER BY level ASC');
    const [statuses] = await connection.query('SELECT * FROM ticket_statuses WHERE status = "active"');
    const [categories] = await connection.query('SELECT * FROM ticket_categories WHERE status = "active"');
    const [departments] = await connection.query(
      `SELECT d.*, u.name as manager_name FROM departments d 
       LEFT JOIN users u ON d.manager_id = u.id 
       WHERE d.status = "active"`
    );

    connection.release();

    res.json({
      success: true,
      data: {
        roles,
        priorities,
        statuses,
        categories,
        departments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lookups',
      error: error.message
    });
  }
});

module.exports = router;
