const mongoose = require('mongoose');

// Check if string is valid MongoDB ObjectId
exports.isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Format date for display
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate ticket number
exports.generateTicketNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT-${timestamp.slice(-6)}-${random}`;
};

// Sanitize search query
exports.sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  return query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Build aggregation pipeline for search
exports.buildSearchPipeline = (searchQuery, userRole, userId) => {
  const pipeline = [];

  // Match stage based on user role
  const matchStage = {};
  
  if (userRole === 'user') {
    matchStage.createdBy = new mongoose.Types.ObjectId(userId);
  } else if (userRole === 'agent') {
    matchStage.$or = [
      { assignedTo: new mongoose.Types.ObjectId(userId) },
      { createdBy: new mongoose.Types.ObjectId(userId) }
    ];
  }

  // Add search criteria
  if (searchQuery) {
    const searchRegex = { $regex: searchQuery, $options: 'i' };
    matchStage.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }

  pipeline.push({ $match: matchStage });

  // Lookup comments for search
  if (searchQuery) {
    pipeline.push({
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'ticketId',
        as: 'comments'
      }
    });

    // Add comment search
    pipeline.push({
      $addFields: {
        commentMatch: {
          $anyElementTrue: {
            $map: {
              input: '$comments',
              as: 'comment',
              in: {
                $regexMatch: {
                  input: '$$comment.content',
                  regex: searchQuery,
                  options: 'i'
                }
              }
            }
          }
        }
      }
    });
  }

  return pipeline;
};
