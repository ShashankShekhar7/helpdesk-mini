const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  getBreachedTickets
} = require('../controllers/ticketController');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { requireUser, requireAgent } = require('../middleware/roleAuth');

// Simple validation functions (inline)
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

const validateCreateTicket = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }
  next();
};

const validateAddComment = (req, res, next) => {
  const { content } = req.body;
  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Comment content is required'
    });
  }
  next();
};

// TICKET ROUTES
// @route   GET /api/tickets
// @desc    Get all tickets with pagination and filters
// @access  Private (Role-based access)
router.get('/', protect, requireUser, getTickets);

// @route   POST /api/tickets
// @desc    Create new ticket
// @access  Private (All authenticated users)
router.post('/', protect, requireUser, validateCreateTicket, createTicket);

// @route   GET /api/tickets/breached
// @desc    Get SLA breached tickets
// @access  Private (Agents and Admins)
router.get('/breached', protect, requireAgent, getBreachedTickets);

// @route   GET /api/tickets/:id
// @desc    Get single ticket by ID
// @access  Private (Role-based access)
router.get('/:id', protect, requireUser, validateObjectId, getTicket);

// @route   PATCH /api/tickets/:id
// @desc    Update ticket (with optimistic locking)
// @access  Private (Agents and Admins)
router.patch('/:id', protect, requireAgent, validateObjectId, updateTicket);

// COMMENT ROUTES (added to tickets router)
// @route   POST /api/tickets/:id/comments
// @desc    Add comment to ticket
// @access  Private (All authenticated users)
router.post('/:id/comments', protect, requireUser, validateObjectId, validateAddComment, addComment);

// @route   GET /api/tickets/:id/comments
// @desc    Get comments for ticket
// @access  Private (Role-based access)
router.get('/:id/comments', protect, requireUser, validateObjectId, getComments);

module.exports = router;
