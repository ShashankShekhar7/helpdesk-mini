import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import TicketForm from '../components/tickets/TicketForm';
import CommentSection from '../components/tickets/CommentSection';
import Timeline from '../components/tickets/Timeline';
import SLAStatus from '../components/tickets/SLAStatus';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import {
  formatDate,
  getTicketDisplayId,
  capitalize,
  getInitials
} from '../utils/helpers';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';
import '../styles/pages.css';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    currentTicket: ticket,
    loading,
    error,
    fetchTicket,
    updateTicket,
    clearError
  } = useTickets();
  const { user, isAgent, isAdmin } = useAuth();

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id, fetchTicket]);

  useEffect(() => {
    // Show success message if redirected from ticket creation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from history state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Auto-hide success message
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleEditSubmit = async (result) => {
    if (result.success) {
      setIsEditMode(false);
      setSuccessMessage('Ticket updated successfully!');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const result = await updateTicket(id, {
        status: newStatus,
        version: ticket.version
      });

      if (result.success) {
        setSuccessMessage(`Ticket status updated to ${capitalize(newStatus.replace('-', ' '))}`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const canEdit = () => {
    if (isAdmin()) return true;
    if (isAgent()) return true;
    return ticket?.createdBy?._id === user?.id && ticket?.status === 'open';
  };

  const canChangeStatus = () => {
    return isAgent() || isAdmin();
  };

  if (loading) {
    return <Loading text="Loading ticket details..." />;
  }

  if (error) {
    return (
      <div className="ticket-details-page">
        <div className="error-state">
          <h2>Error Loading Ticket</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/tickets')} className="btn btn-primary">
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-details-page">
        <div className="error-state">
          <h2>Ticket Not Found</h2>
          <p>The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate('/tickets')} className="btn btn-primary">
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[ticket.status];
  const priorityColor = PRIORITY_COLORS[ticket.priority];

  return (
    <div className="ticket-details-page">
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="success-close">×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="ticket-header">
            <h1 className="ticket-title">
              {getTicketDisplayId(ticket._id)} - {ticket.title}
            </h1>
            <div className="ticket-badges">
              <span
                className={`badge badge-status status-${ticket.status}`}
                style={{ backgroundColor: statusColor }}
              >
                {capitalize(ticket.status.replace('-', ' '))}
              </span>
              <span
                className={`badge badge-priority priority-${ticket.priority}`}
                style={{ backgroundColor: priorityColor }}
              >
                {ticket.priority.toUpperCase()}
              </span>
              <span className="badge badge-category">
                {capitalize(ticket.category.replace('-', ' '))}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {canEdit() && !isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="btn btn-outline"
            >
              ✏️ Edit
            </button>
          )}

          {canChangeStatus() && (
            <div className="status-actions">
              {ticket.status === 'open' && (
                <button
                  onClick={() => handleStatusUpdate('in-progress')}
                  className="btn btn-warning btn-sm"
                >
                  Start Progress
                </button>
              )}
              {ticket.status === 'in-progress' && (
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  className="btn btn-success btn-sm"
                >
                  Mark Resolved
                </button>
              )}
              {ticket.status === 'resolved' && (
                <button
                  onClick={() => handleStatusUpdate('closed')}
                  className="btn btn-secondary btn-sm"
                >
                  Close Ticket
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => navigate('/tickets')}
            className="btn btn-outline"
          >
            ← Back to Tickets
          </button>
        </div>
      </div>

      <div className="ticket-details-content">
        {/* Main Content */}
        <div className="ticket-main">
          {isEditMode ? (
            <div className="edit-section">
              <TicketForm
                ticket={ticket}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditMode(false)}
              />
            </div>
          ) : (
            <div className="ticket-info">
              <div className="ticket-description-section">
                <h3>Description</h3>
                <div className="ticket-description">
                  {ticket.description}
                </div>
              </div>

              <div className="ticket-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Created By</span>
                  <div className="meta-value user-info">
                    <div className="user-avatar">
                      {getInitials(ticket.createdBy?.name)}
                    </div>
                    <span className="user-name">
                      {ticket.createdBy?.name}
                      {ticket.createdBy?._id === user?.id && ' (You)'}
                    </span>
                  </div>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Created Date</span>
                  <span className="meta-value">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Last Updated</span>
                  <span className="meta-value">
                    {formatDate(ticket.updatedAt)}
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Assigned To</span>
                  <div className="meta-value">
                    {ticket.assignedTo ? (
                      <div className="user-info">
                        <div className="user-avatar">
                          {getInitials(ticket.assignedTo.name)}
                        </div>
                        <span className="user-name">
                          {ticket.assignedTo.name}
                          {ticket.assignedTo._id === user?.id && ' (You)'}
                        </span>
                      </div>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="meta-item">
                  <span className="meta-label">SLA Status</span>
                  <div className="meta-value">
                    <SLAStatus
                      slaDeadline={ticket.slaDeadline}
                      status={ticket.status}
                      size="medium"
                    />
                  </div>
                </div>

                <div className="meta-item">
                  <span className="meta-label">SLA Deadline</span>
                  <span className="meta-value">
                    {formatDate(ticket.slaDeadline)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection 
            ticket={ticket} 
            comments={ticket.comments || []} 
          />
        </div>

        {/* Sidebar */}
        <div className="ticket-sidebar">
          <Timeline 
            timeline={ticket.timeline || []} 
            ticket={ticket} 
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Ticket"
        size="small"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
          <div className="modal-actions">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle delete logic here
                setShowDeleteModal(false);
              }}
              className="btn btn-danger"
            >
              Delete Ticket
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketDetails;
