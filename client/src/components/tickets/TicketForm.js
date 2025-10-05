import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { validators, validateForm } from '../../utils/validators';
import { TICKET_PRIORITY, TICKET_CATEGORY } from '../../utils/constants';
import Loading from '../common/Loading';
import '../../styles/components.css';

const TicketForm = ({ ticket = null, onSubmit = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TICKET_PRIORITY.MEDIUM,
    category: TICKET_CATEGORY.GENERAL,
    assignedTo: '',
    status: 'open',
    version: 0
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTicket, updateTicket, loading } = useTickets();
  const { isAgent } = useAuth();
  const navigate = useNavigate();

  const isEditMode = !!ticket;

  // Initialize form with ticket data if editing
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || TICKET_PRIORITY.MEDIUM,
        category: ticket.category || TICKET_CATEGORY.GENERAL,
        assignedTo: ticket.assignedTo?._id || '',
        status: ticket.status || 'open',
        version: ticket.version || 0
      });
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationRules = {
      title: [validators.required, validators.minLength(5), validators.maxLength(200)],
      description: [validators.required, validators.minLength(10), validators.maxLength(2000)],
      priority: [validators.required],
      category: [validators.required]
    };

    const validation = validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let result;
      
      if (isEditMode) {
        // Update existing ticket
        result = await updateTicket(ticket._id, formData);
        if (onSubmit) {
          onSubmit(result);
          return;
        }
      } else {
        // Create new ticket
        result = await createTicket(formData);
      }
      
      if (result.success) {
        if (!isEditMode) {
          navigate(`/tickets/${result.ticket._id}`, { 
            state: { message: 'Ticket created successfully!' }
          });
        }
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      // Handle optimistic locking error
      if (error.isOptimisticLockError) {
        setErrors({ 
          submit: 'This ticket was modified by another user. Please refresh the page and try again.',
          version: error.currentVersion 
        });
      } else {
        setErrors({ submit: error.message || 'An error occurred while saving the ticket' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isEditMode) {
    return <Loading text="Loading form..." />;
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Ticket' : 'Create New Ticket'}</h2>
        <p className="form-description">
          {isEditMode 
            ? 'Update the ticket details below' 
            : 'Fill out the form below to create a new support ticket'
          }
        </p>
      </div>

      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title" className="required">
            Ticket Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            placeholder="Brief description of the issue"
            disabled={isSubmitting}
            maxLength={200}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
          <span className="field-hint">
            {formData.title.length}/200 characters
          </span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="description" className="required">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            placeholder="Provide detailed information about the issue, including steps to reproduce if applicable"
            rows={6}
            disabled={isSubmitting}
            maxLength={2000}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
          <span className="field-hint">
            {formData.description.length}/2000 characters
          </span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority" className="required">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={errors.priority ? 'error' : ''}
            disabled={isSubmitting}
          >
            <option value={TICKET_PRIORITY.LOW}>Low</option>
            <option value={TICKET_PRIORITY.MEDIUM}>Medium</option>
            <option value={TICKET_PRIORITY.HIGH}>High</option>
            <option value={TICKET_PRIORITY.CRITICAL}>Critical</option>
          </select>
          {errors.priority && <span className="field-error">{errors.priority}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category" className="required">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
            disabled={isSubmitting}
          >
            <option value={TICKET_CATEGORY.TECHNICAL}>Technical Issue</option>
            <option value={TICKET_CATEGORY.BILLING}>Billing</option>
            <option value={TICKET_CATEGORY.GENERAL}>General Inquiry</option>
            <option value={TICKET_CATEGORY.FEATURE_REQUEST}>Feature Request</option>
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
      </div>

      {/* Agent-only fields */}
      {isAgent() && isEditMode && (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Ticket' : 'Create Ticket')
          }
        </button>
      </div>
    </form>
  );
};

export default TicketForm;
