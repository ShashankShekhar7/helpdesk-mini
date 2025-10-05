import React from 'react';
import { formatRelativeTime, getInitials, capitalize } from '../../utils/helpers';
import '../../styles/components.css';

const Timeline = ({ timeline = [], ticket }) => {
  const getTimelineIcon = (action) => {
    const icons = {
      'created': '🎫',
      'updated': '✏️',
      'comment_added': '💬',
      'status_changed': '🔄',
      'assigned': '👤',
      'sla_breached': '⚠️',
      'resolved': '✅',
      'closed': '🔒'
    };
    return icons[action] || '📝';
  };

  const getTimelineColor = (action) => {
    const colors = {
      'created': '#28a745',
      'updated': '#17a2b8',
      'comment_added': '#6f42c1',
      'status_changed': '#ffc107',
      'assigned': '#fd7e14',
      'sla_breached': '#dc3545',
      'resolved': '#28a745',
      'closed': '#6c757d'
    };
    return colors[action] || '#6c757d';
  };

  const formatTimelineAction = (action, details) => {
    const actionMap = {
      'created': 'Ticket created',
      'updated': 'Ticket updated',
      'comment_added': 'Comment added',
      'status_changed': 'Status changed',
      'assigned': 'Ticket assigned',
      'sla_breached': 'SLA deadline exceeded',
      'resolved': 'Ticket resolved',
      'closed': 'Ticket closed'
    };
    
    const baseAction = actionMap[action] || capitalize(action.replace('_', ' '));
    return details ? `${baseAction}: ${details}` : baseAction;
  };

  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (timeline.length === 0) {
    return (
      <div className="timeline-section">
        <h3>Activity Timeline</h3>
        <div className="timeline-empty">
          <p>No activity recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-section">
      <div className="timeline-header">
        <h3>Activity Timeline</h3>
        <span className="timeline-count">
          {timeline.length} {timeline.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="timeline">
        {sortedTimeline.map((event, index) => (
          <div key={index} className="timeline-item">
            <div 
              className="timeline-icon"
              style={{ backgroundColor: getTimelineColor(event.action) }}
            >
              {getTimelineIcon(event.action)}
            </div>
            
            <div className="timeline-content">
              <div className="timeline-header-row">
                <span className="timeline-action">
                  {formatTimelineAction(event.action, event.details)}
                </span>
                <span className="timeline-time">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
              
              {event.performedBy && (
                <div className="timeline-user">
                  <div className="user-avatar tiny">
                    {getInitials(event.performedBy.name)}
                  </div>
                  <span className="user-name">
                    {event.performedBy.name}
                  </span>
                  <span className="user-role">
                    ({event.performedBy.role})
                  </span>
                </div>
              )}
              
              {event.details && event.action !== 'comment_added' && (
                <div className="timeline-details">
                  {event.details}
                </div>
              )}
            </div>
            
            {index < sortedTimeline.length - 1 && (
              <div className="timeline-connector"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
