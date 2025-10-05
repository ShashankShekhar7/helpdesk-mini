require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  slaHours: {
    critical: 2,
    high: 8,
    medium: 24,
    low: 72
  },
  roles: {
    USER: 'user',
    AGENT: 'agent',
    ADMIN: 'admin'
  }
};

module.exports = config;
