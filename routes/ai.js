var express = require('express');
var router = express.Router();
var { improveDescription } = require('../services/openai');

// POST /api/ai/improve-description
router.post('/improve-description', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: description'
      });
    }

    const improved = await improveDescription(description);

    res.json({
      success: true,
      data: {
        original: description,
        improved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error improving description',
      error: error.message
    });
  }
});

module.exports = router;
