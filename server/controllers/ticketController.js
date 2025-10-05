const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const User = require('../models/User');
const config = require('../config/config');
const { validationResult } = require('express-validator');

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, priority, category } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      createdBy: req.user.id
    });

    // Populate created ticket
    await ticket.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating ticket'
    });
  }
};

// Get All Tickets with Pagination and Filters
exports.getTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add debugging
    console.log('User role:', req.user.role);
    console.log('Config roles:', config.roles);

    // Role-based filtering - FIXED VERSION
    if (req.user.role === config.roles.USER) {
      filter.createdBy = req.user.id;
      console.log('Applied USER filter - showing only own tickets');
    } else if (req.user.role === config.roles.AGENT || req.user.role === config.roles.ADMIN) {
      // Agents and Admins can see ALL tickets - no additional filter
      console.log('Applied AGENT/ADMIN filter - showing ALL tickets');
    } else {
      console.log('Unknown role, defaulting to user filter');
      filter.createdBy = req.user.id;
    }

    console.log('Final filter:', JSON.stringify(filter));

    // Apply additional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Ticket.countDocuments(filter);

    // Search in comments if search query exists
    let commentResults = [];
    if (search) {
      const comments = await Comment.find({
        content: { $regex: search, $options: 'i' }
      }).populate('ticketId');
      
      commentResults = comments.map(comment => comment.ticketId).filter(Boolean);
    }

    console.log('Found tickets:', tickets.length);

    res.json({
      success: true,
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      commentMatches: commentResults
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tickets'
    });
  }
};

// Get Single Ticket
exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('timeline.performedBy', 'name email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === config.roles.USER && 
        ticket.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get comments for this ticket
    const comments = await Comment.find({ ticketId: id })
      .populate('authorId', 'name email role')
      .sort({ createdAt: -1 });

    // Filter internal comments for non-agents
    const filteredComments = req.user.role === config.roles.USER 
      ? comments.filter(comment => !comment.isInternal)
      : comments;

    res.json({
      success: true,
      ticket,
      comments: filteredComments
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ticket'
    });
  }
};

// Update Ticket (with Optimistic Locking)
exports.updateTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { version, ...updateData } = req.body;

    // Find current ticket
    const currentTicket = await Ticket.findById(id);
    if (!currentTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === config.roles.USER) {
      return res.status(403).json({
        success: false,
        message: 'Users cannot update tickets'
      });
    }

    // Optimistic locking check
    if (version !== undefined && currentTicket.version !== version) {
      return res.status(409).json({
        success: false,
        message: 'Ticket was modified by another user. Please refresh and try again.',
        currentVersion: currentTicket.version
      });
    }

    // Prepare timeline entry
    const timelineEntry = {
      action: 'updated',
      performedBy: req.user.id,
      details: `Updated: ${Object.keys(updateData).join(', ')}`,
      timestamp: new Date()
    };

    // Update ticket with version increment
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $inc: { version: 1 },
        $push: { timeline: timelineEntry }
      },
      { new: true }
    ).populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'timeline.performedBy', select: 'name email role' }
    ]);

    res.json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating ticket'
    });
  }
};

// Get SLA Breached Tickets
exports.getBreachedTickets = async (req, res) => {
  try {
    const filter = {
      slaBreached: true,
      status: { $nin: ['resolved', 'closed'] }
    };

    // Role-based filtering for breached tickets
    if (req.user.role === config.roles.AGENT) {
      // Agents can see all breached tickets, not just assigned ones
      // This allows them to help with urgent issues
      console.log('Agent viewing all breached tickets');
    }
    // Admins can see all breached tickets by default

    const breachedTickets = await Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ slaDeadline: 1 });

    console.log('Found breached tickets:', breachedTickets.length);

    res.json({
      success: true,
      tickets: breachedTickets,
      count: breachedTickets.length
    });
  } catch (error) {
    console.error('Get breached tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching breached tickets'
    });
  }
};
