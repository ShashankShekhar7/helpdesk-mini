import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SLAStatus from './SLAStatus';
import { 
  formatRelativeTime, 
  getTicketDisplayId, 
  capitalize,
  getInitials 
} from '../../utils/helpers';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import '../../styles/components.css';

const TicketCard = ({ ticket }) => {
  const { user, isAgent } = useAuth();

  const statusColor = STATUS_COLORS[ticket.status];
  const priorityColor = PRIORITY_COLORS[ticket.priority];

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <div className="ticket-id">
          <Link to={`/tickets/${ticket._id}`} className="ticket-link">
            {getTicketDisplayId(ticket._id)}
          </Link>
        </div>
        
        <div className="ticket-badges">
          <span 
            className={`badge badge-priority priority-${ticket.priority}`}
            style={{ backgroundColor: priorityColor }}
          >
            {ticket.priority.toUpperCase()}
          </span>
          <span 
            className={`badge badge-status status-${ticket.status}`}
            style={{ backgroundColor: statusColor }}
          >
            {capitalize(ticket.status.replace('-', ' '))}
          </span>
        </div>
      </div>

      <div className="ticket-card-body">
        <h3 className="ticket-title">
          <Link to={`/tickets/${ticket._id}`} className="ticket-link">
            {ticket.title}
          </Link>
        </h3>
        
        <p className="ticket-description">
          {ticket.description.length > 150 
            ? `${ticket.description.substring(0, 150)}...` 
            : ticket.description
          }
        </p>

        <div className="ticket-meta">
          <div className="ticket-users">
            <div className="ticket-creator">
              <div className="user-avatar small">
                {getInitials(ticket.createdBy?.name)}
              </div>
              <span className="user-name">
                {ticket.createdBy?.name}
                {ticket.createdBy?._id === user?.id && ' (You)'}
              </span>
            </div>

            {ticket.assignedTo && (
              <div className="ticket-assignee">
                <span className="assignee-label">Assigned to:</span>
                <div className="user-avatar small">
                  {getInitials(ticket.assignedTo?.name)}
                </div>
                <span className="user-name">
                  {ticket.assignedTo?.name}
                  {ticket.assignedTo?._id === user?.id && ' (You)'}
                </span>
              </div>
            )}
          </div>

          <div className="ticket-timestamps">
            <span className="created-time">
              Created {formatRelativeTime(ticket.createdAt)}
            </span>
            {ticket.updatedAt !== ticket.createdAt && (
              <span className="updated-time">
                Updated {formatRelativeTime(ticket.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ticket-card-footer">
        <SLAStatus 
          slaDeadline={ticket.slaDeadline}
          status={ticket.status}
          size="small"
        />
        
        <div className="ticket-actions">
          <Link 
            to={`/tickets/${ticket._id}`} 
            className="btn btn-sm btn-outline"
          >
            View Details
          </Link>
          
          {isAgent() && (
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => {
                // Quick action handler can be added here
              }}
            >
              Quick Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
