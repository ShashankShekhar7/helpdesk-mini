const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const config = require('../config/config');
const { validationResult } = require('express-validator');

// Add Comment to Ticket
exports.addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id: ticketId } = req.params;
    const { content, isInternal = false } = req.body;

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === config.roles.USER) {
      // Users can only comment on their own tickets and cannot create internal comments
      if (ticket.createdBy.toString() !== req.user.id || isInternal) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      ticketId,
      authorId: req.user.id,
      content,
      isInternal: req.user.role !== config.roles.USER ? isInternal : false
    });

    // Populate comment
    await comment.populate('authorId', 'name email role');

    // Add to ticket timeline
    const timelineEntry = {
      action: 'comment_added',
      performedBy: req.user.id,
      details: isInternal ? 'Added internal comment' : 'Added comment',
      timestamp: new Date()
    };

    await Ticket.findByIdAndUpdate(ticketId, {
      $push: { timeline: timelineEntry }
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// Get Comments for Ticket
exports.getComments = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if ticket exists and user has access
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === config.roles.USER && 
        ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build filter
    const filter = { ticketId };
    
    // Hide internal comments from users
    if (req.user.role === config.roles.USER) {
      filter.isInternal = false;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments
    const comments = await Comment.find(filter)
      .populate('authorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments'
    });
  }
};
