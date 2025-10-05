const cron = require('node-cron');
const Ticket = require('../models/Ticket');
const SLACalculator = require('../utils/slaCalculator');

// Job to check and update SLA breaches
const checkSLABreaches = async () => {
  try {
    console.log('Running SLA breach check...');
    
    const now = new Date();
    
    // Find tickets that should be marked as breached
    const ticketsToUpdate = await Ticket.find({
      slaDeadline: { $lt: now },
      status: { $nin: ['resolved', 'closed'] },
      slaBreached: false
    });

    if (ticketsToUpdate.length > 0) {
      // Update breached tickets
      const updateResult = await Ticket.updateMany(
        {
          _id: { $in: ticketsToUpdate.map(t => t._id) }
        },
        {
          $set: { slaBreached: true },
          $push: {
            timeline: {
              action: 'sla_breached',
              performedBy: null,
              details: 'SLA deadline exceeded',
              timestamp: now
            }
          }
        }
      );

      console.log(`Updated ${updateResult.modifiedCount} tickets as SLA breached`);
    } else {
      console.log('No tickets found with SLA breaches');
    }
  } catch (error) {
    console.error('SLA check job error:', error);
  }
};

// Schedule job to run every 5 minutes
const startSLAChecker = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', checkSLABreaches);
  
  // Also run on startup
  checkSLABreaches();
  
  console.log('SLA checker job scheduled to run every 5 minutes');
};

module.exports = { startSLAChecker, checkSLABreaches };
