const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number
  }]
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ ticketId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
