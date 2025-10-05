const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/config');
const { startSLAChecker } = require('./jobs/slaChecker');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start SLA checker job
    startSLAChecker();
    
    // Start server
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(`
🚀 HelpDesk Mini Server is running!
📍 Port: ${PORT}
🌍 Environment: ${config.env}
📅 Started: ${new Date().toLocaleString()}
      `);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
