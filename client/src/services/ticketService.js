import api from './api';

export const ticketService = {
  // Get tickets with pagination and filters
  getTickets: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/tickets?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single ticket by ID
  getTicket: async (id) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update ticket (with optimistic locking)
  updateTicket: async (id, updateData) => {
    try {
      const response = await api.patch(`/tickets/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add comment to ticket
  addComment: async (ticketId, commentData) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/comments`, commentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get comments for ticket
  getComments: async (ticketId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/tickets/${ticketId}/comments?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get SLA breached tickets
  getBreachedTickets: async () => {
    try {
      const response = await api.get('/tickets/breached');
      return response;
    } catch (error) {
      throw error;
    }
  }
};
