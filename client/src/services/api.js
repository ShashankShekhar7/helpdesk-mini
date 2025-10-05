import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('helpdesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 unauthorized - token issues
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      // Handle specific token errors
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'NO_TOKEN') {
        console.log('Token invalid/expired, clearing storage');
        localStorage.removeItem('helpdesk_token');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle 409 optimistic locking conflicts
    if (error.response?.status === 409) {
      return Promise.reject({
        ...error,
        isOptimisticLockError: true,
        currentVersion: error.response.data.currentVersion
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
