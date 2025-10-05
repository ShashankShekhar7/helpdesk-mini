import React, { createContext, useContext, useState, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import { useAuth } from './AuthContext';

const TicketContext = createContext();

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const { token } = useAuth();

  const clearError = () => setError(null);

  const fetchTickets = useCallback(async (params = {}) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ticketService.getTickets(params);
      
      if (response.success) {
        setTickets(response.tickets);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTicket = useCallback(async (id) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ticketService.getTicket(id);
      
      if (response.success) {
        setCurrentTicket(response.ticket);
        return response;
      } else {
        setError(response.message || 'Failed to fetch ticket');
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch ticket';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createTicket = async (ticketData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ticketService.createTicket(ticketData);
      
      if (response.success) {
        // Add new ticket to the beginning of the list
        setTickets(prev => [response.ticket, ...prev]);
        return { success: true, ticket: response.ticket };
      } else {
        setError(response.message || 'Failed to create ticket');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create ticket';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id, updateData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ticketService.updateTicket(id, updateData);
      
      if (response.success) {
        const updatedTicket = response.ticket;
        
        // Update ticket in list
        setTickets(prev => 
          prev.map(ticket => 
            ticket._id === id ? updatedTicket : ticket
          )
        );
        
        // Update current ticket if it's the same one
        if (currentTicket?._id === id) {
          setCurrentTicket(updatedTicket);
        }
        
        return { success: true, ticket: updatedTicket };
      } else {
        setError(response.message || 'Failed to update ticket');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update ticket';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (ticketId, commentData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    
    try {
      const response = await ticketService.addComment(ticketId, commentData);
      
      if (response.success) {
        // Refresh current ticket to get updated comments
        if (currentTicket?._id === ticketId) {
          await fetchTicket(ticketId);
        }
        return { success: true, comment: response.comment };
      } else {
        setError(response.message || 'Failed to add comment');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const getBreachedTickets = async () => {
    if (!token) return;
    
    try {
      const response = await ticketService.getBreachedTickets();
      return response;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch breached tickets');
      return { success: false };
    }
  };

  const value = {
    tickets,
    currentTicket,
    loading,
    error,
    pagination,
    clearError,
    fetchTickets,
    fetchTicket,
    createTicket,
    updateTicket,
    addComment,
    getBreachedTickets,
    setCurrentTicket
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};
