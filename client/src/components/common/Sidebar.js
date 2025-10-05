import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import '../../styles/components.css';

const Sidebar = ({ isOpen, onClose }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const { user, isAgent, isAdmin } = useAuth();
  const { getBreachedTickets } = useTickets();
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleSubmenu = (menuName) => {
    setActiveSubmenu(activeSubmenu === menuName ? null : menuName);
  };

  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: '/',
      roles: ['user', 'agent', 'admin']
    },
    {
      icon: '🎫',
      label: 'Tickets',
      path: '/tickets',
      roles: ['user', 'agent', 'admin'],
      submenu: [
        { label: 'All Tickets', path: '/tickets', roles: ['user', 'agent', 'admin'] },
        { label: 'My Tickets', path: '/tickets?filter=my', roles: ['user', 'agent', 'admin'] },
        { label: 'Open Tickets', path: '/tickets?status=open', roles: ['agent', 'admin'] },
        { label: 'In Progress', path: '/tickets?status=in-progress', roles: ['agent', 'admin'] },
        { label: 'Breached SLA', path: '/tickets?breached=true', roles: ['agent', 'admin'] }
      ]
    },
    {
      icon: '➕',
      label: 'New Ticket',
      path: '/tickets/new',
      roles: ['user', 'agent', 'admin']
    },
    {
      icon: '📋',
      label: 'Reports',
      path: '/reports',
      roles: ['agent', 'admin'],
      submenu: [
        { label: 'SLA Report', path: '/reports/sla', roles: ['agent', 'admin'] },
        { label: 'Performance', path: '/reports/performance', roles: ['admin'] },
        { label: 'User Activity', path: '/reports/users', roles: ['admin'] }
      ]
    },
    {
      icon: '👥',
      label: 'Users',
      path: '/users',
      roles: ['admin']
    },
    {
      icon: '⚙️',
      label: 'Settings',
      path: '/settings',
      roles: ['admin']
    }
  ];

  const hasAccess = (roles) => {
    return roles.includes(user?.role);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎫</span>
            <span className="logo-text">HelpDesk</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-user">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
          </div>

          <ul className="sidebar-menu">
            {menuItems.map((item, index) => {
              if (!hasAccess(item.roles)) return null;

              return (
                <li key={index} className="menu-item">
                  {item.submenu ? (
                    <>
                      <button
                        className={`menu-link menu-toggle ${
                          activeSubmenu === item.label ? 'active' : ''
                        }`}
                        onClick={() => toggleSubmenu(item.label)}
                      >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-text">{item.label}</span>
                        <span className={`submenu-arrow ${
                          activeSubmenu === item.label ? 'open' : ''
                        }`}>
                          ▼
                        </span>
                      </button>
                      
                      <ul className={`submenu ${
                        activeSubmenu === item.label ? 'submenu-open' : ''
                      }`}>
                        {item.submenu.map((subItem, subIndex) => {
                          if (!hasAccess(subItem.roles)) return null;
                          
                          return (
                            <li key={subIndex} className="submenu-item">
                              <Link
                                to={subItem.path}
                                className={`submenu-link ${
                                  isActiveRoute(subItem.path) ? 'active' : ''
                                }`}
                                onClick={onClose}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`menu-link ${
                        isActiveRoute(item.path) ? 'active' : ''
                      }`}
                      onClick={onClose}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="sidebar-footer">
            <div className="quick-stats">
              <h4>Quick Stats</h4>
              <div className="stat-item">
                <span className="stat-label">My Open Tickets</span>
                <span className="stat-value">-</span>
              </div>
              {isAgent() && (
                <div className="stat-item">
                  <span className="stat-label">Assigned to Me</span>
                  <span className="stat-value">-</span>
                </div>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
