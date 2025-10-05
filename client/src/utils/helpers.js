
import { SLA_STATUS } from './constants';

// Format date for display
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

// Calculate SLA status and time remaining
export const calculateSLAStatus = (slaDeadline, currentTime = new Date()) => {
  if (!slaDeadline) return { status: SLA_STATUS.SAFE, timeLeft: 0, formatted: 'N/A' };
  
  const deadline = new Date(slaDeadline);
  const remaining = deadline.getTime() - currentTime.getTime();
  
  if (remaining <= 0) {
    const overdue = currentTime.getTime() - deadline.getTime();
    return {
      status: SLA_STATUS.BREACHED,
      timeLeft: -overdue,
      formatted: `Overdue by ${formatDuration(overdue)}`,
      isBreached: true
    };
  }
  
  const hours = remaining / (1000 * 60 * 60);
  
  let status = SLA_STATUS.SAFE;
  if (hours < 1) {
    status = SLA_STATUS.CRITICAL;
  } else if (hours < 4) {
    status = SLA_STATUS.WARNING;
  }
  
  return {
    status,
    timeLeft: remaining,
    formatted: formatDuration(remaining),
    isBreached: false
  };
};

// Format duration in human readable format
export const formatDuration = (milliseconds) => {
  const totalMinutes = Math.floor(Math.abs(milliseconds) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Debounce function for search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get ticket display ID (last 6 characters of MongoDB ObjectId)
export const getTicketDisplayId = (ticketId) => {
  if (!ticketId) return 'N/A';
  return `#${ticketId.toString().slice(-6).toUpperCase()}`;
};

// Sort array by property
export const sortBy = (array, property, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};
