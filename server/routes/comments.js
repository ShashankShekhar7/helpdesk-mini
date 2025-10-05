const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { requireUser } = require('../middleware/roleAuth');
const {
  validateAddComment,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// These will be mounted at /api/tickets, so routes become:
// POST /api/tickets/:id/comments
// GET /api/tickets/:id/comments

// @route   POST /api/tickets/:id/comments
// @desc    Add comment to ticket
// @access  Private (All authenticated users)
router.post('/:id/comments', protect, requireUser, validateObjectId, validateAddComment, addComment);

// @route   GET /api/tickets/:id/comments  
// @desc    Get comments for ticket
// @access  Private (Role-based access)
router.get('/:id/comments', protect, requireUser, validateObjectId, validatePagination, getComments);

module.exports = router;
