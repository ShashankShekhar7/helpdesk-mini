const mongoose = require('mongoose');
const config = require('../config/config');

const timelineSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'general', 'feature-request'],
    default: 'general'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  slaDeadline: {
    type: Date,
    required: true
  },
  slaBreached: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 0
  },
  timeline: [timelineSchema]
}, {
  timestamps: true
});

// Calculate SLA deadline before validation runs
ticketSchema.pre('validate', function(next) {
  if (this.isNew && !this.slaDeadline) {
    // Ensure priority exists
    if (!this.priority) {
      this.priority = 'medium';
    }
    
    // Calculate SLA deadline
    const slaHours = config.slaHours[this.priority] || config.slaHours.medium;
    this.slaDeadline = new Date(Date.now() + (slaHours * 60 * 60 * 1000));
  }
  next();
});

// Add timeline entry after save
ticketSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add creation to timeline
    this.timeline.push({
      action: 'created',
      performedBy: this.createdBy,
      details: `Ticket created with priority: ${this.priority}`,
      timestamp: new Date()
    });
  }
  next();
});

// Index for search functionality
ticketSchema.index({
  title: 'text',
  description: 'text'
});

// Index for SLA monitoring
ticketSchema.index({ slaDeladline: 1, status: 1, slaBreached: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
