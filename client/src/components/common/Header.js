import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import '../../styles/components.css';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAgent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>HelpDesk Mini</h1>
          </Link>
          
          <nav className="main-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/tickets" 
              className={`nav-link ${isActiveRoute('/tickets') ? 'active' : ''}`}
            >
              Tickets
            </Link>
            <Link 
              to="/tickets/new" 
              className={`nav-link ${isActiveRoute('/tickets/new') ? 'active' : ''}`}
            >
              New Ticket
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-menu" onClick={toggleUserMenu}>
            <div className="user-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <div className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>
              ▼
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <p className="user-email">{user?.email}</p>
                  <span className="role-badge role-{user?.role}">
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
