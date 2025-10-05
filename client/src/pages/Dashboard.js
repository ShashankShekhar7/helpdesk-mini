import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/tickets/TicketCard';
import SLAStatus from '../components/tickets/SLAStatus';
import Loading from '../components/common/Loading';
import { 
  formatDate, 
  getTicketDisplayId,
  calculateSLAStatus 
} from '../utils/helpers';
import { TICKET_STATUS, STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';
import '../styles/pages.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    breached: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [breachedTickets, setBreachedTickets] = useState([]);

  const { user, isAgent, isAdmin } = useAuth();
  const { 
    tickets, 
    loading, 
    error, 
    fetchTickets, 
    getBreachedTickets 
  } = useTickets();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      calculateStats();
      setRecentTickets(tickets.slice(0, 5));
    }
  }, [tickets]);

  const loadDashboardData = async () => {
    try {
      // Load recent tickets
      await fetchTickets({ 
        limit: 10, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });

      // Load breached tickets for agents
      if (isAgent()) {
        const breachedResponse = await getBreachedTickets();
        if (breachedResponse.success) {
          setBreachedTickets(breachedResponse.tickets.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const calculateStats = () => {
    const newStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === TICKET_STATUS.OPEN).length,
      inProgress: tickets.filter(t => t.status === TICKET_STATUS.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TICKET_STATUS.RESOLVED).length,
      breached: tickets.filter(t => t.slaBreached).length
    };
    setStats(newStats);
  };

  const StatCard = ({ title, value, color, icon, link }) => (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-content">
        <div className="stat-header">
          <span className="stat-icon">{icon}</span>
          <h3 className="stat-title">{title}</h3>
        </div>
        <div className="stat-value" style={{ color }}>
          {value}
        </div>
      </div>
      {link && (
        <Link to={link} className="stat-link">
          View All →
        </Link>
      )}
    </div>
  );

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.name}! Here's your support overview.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/tickets/new" className="btn btn-primary">
            <span>➕</span> New Ticket
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message dashboard-error">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Tickets"
          value={stats.total}
          color="#17a2b8"
          icon="🎫"
          link="/tickets"
        />
        <StatCard
          title="Open"
          value={stats.open}
          color={STATUS_COLORS[TICKET_STATUS.OPEN]}
          icon="📭"
          link="/tickets?status=open"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          color={STATUS_COLORS[TICKET_STATUS.IN_PROGRESS]}
          icon="⚡"
          link="/tickets?status=in-progress"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          color={STATUS_COLORS[TICKET_STATUS.RESOLVED]}
          icon="✅"
          link="/tickets?status=resolved"
        />
        {isAgent() && (
          <StatCard
            title="SLA Breached"
            value={stats.breached}
            color="#dc3545"
            icon="⚠️"
            link="/tickets?breached=true"
          />
        )}
      </div>

      <div className="dashboard-content">
        {/* Recent Tickets */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Tickets</h2>
            <Link to="/tickets" className="section-link">
              View All Tickets →
            </Link>
          </div>
          
          {recentTickets.length > 0 ? (
            <div className="tickets-preview">
              {recentTickets.map(ticket => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎫</div>
              <h3>No tickets yet</h3>
              <p>Create your first support ticket to get started.</p>
              <Link to="/tickets/new" className="btn btn-primary">
                Create Ticket
              </Link>
            </div>
          )}
        </div>

        {/* SLA Alerts for Agents */}
        {isAgent() && breachedTickets.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="urgent">🚨 SLA Breached Tickets</h2>
              <Link to="/tickets?breached=true" className="section-link">
                View All Breached →
              </Link>
            </div>
            
            <div className="breached-tickets">
              {breachedTickets.map(ticket => (
                <div key={ticket._id} className="breached-ticket-card">
                  <div className="ticket-info">
                    <Link to={`/tickets/${ticket._id}`} className="ticket-title">
                      {getTicketDisplayId(ticket._id)} - {ticket.title}
                    </Link>
                    <div className="ticket-meta">
                      <span className="priority" style={{ 
                        color: PRIORITY_COLORS[ticket.priority] 
                      }}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="created">
                        Created: {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <SLAStatus 
                    slaDeadline={ticket.slaDeadline}
                    status={ticket.status}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/tickets/new" className="action-card">
              <div className="action-icon">➕</div>
              <div className="action-content">
                <h3>Create Ticket</h3>
                <p>Submit a new support request</p>
              </div>
            </Link>
            
            <Link to="/tickets?filter=my" className="action-card">
              <div className="action-icon">👤</div>
              <div className="action-content">
                <h3>My Tickets</h3>
                <p>View tickets you created</p>
              </div>
            </Link>
            
            {isAgent() && (
              <Link to="/tickets?assigned=me" className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h3>Assigned to Me</h3>
                  <p>Tickets requiring your attention</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
