import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('helpdesk_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('helpdesk_token');
      
      if (savedToken && !isTokenExpired(savedToken)) {
        try {
          const userData = await authService.getProfile();
          setUser(userData.user);
          setToken(savedToken);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // Clear invalid token
          localStorage.removeItem('helpdesk_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Token expired or doesn't exist
        if (savedToken) {
          console.log('Token expired, clearing storage');
          localStorage.removeItem('helpdesk_token');
        }
        setToken(null);
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    if (token && user) {
      const checkTokenExpiry = () => {
        if (isTokenExpired(token)) {
          console.log('Token expired during session, logging out');
          logout();
        }
      };

      // Check every 5 minutes
      const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [token, user]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('helpdesk_token', response.token);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      
      // Clear any existing invalid token
      localStorage.removeItem('helpdesk_token');
      setToken(null);
      setUser(null);
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('helpdesk_token', response.token);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Registration failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('helpdesk_token');
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = () => {
    return !!token && !!user && !isTokenExpired(token);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAgent = () => {
    return user?.role === 'agent' || user?.role === 'admin';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated,
    hasRole,
    isAgent,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
