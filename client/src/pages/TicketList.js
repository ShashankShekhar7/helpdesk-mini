import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/tickets/TicketCard';
import Loading from '../components/common/Loading';
import { debounce } from '../utils/helpers';
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_CATEGORY } from '../utils/constants';
import '../styles/pages.css';

const TicketList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    assignedTo: searchParams.get('assignedTo') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    tickets, 
    loading, 
    error, 
    pagination, 
    fetchTickets, 
    clearError 
  } = useTickets();
  const { isAgent } = useAuth();

  // Debounced search function
  const debouncedSearch = debounce((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  }, 500);

  useEffect(() => {
    loadTickets();
  }, [filters, currentPage]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  const loadTickets = async () => {
    const params = {
      ...filters,
      page: currentPage,
      limit: pagination.itemsPerPage || 10
    };
    
    await fetchTickets(params);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newSortOrder
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      category: '',
      assignedTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-btn"
        >
          ← Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < pagination.totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-btn"
        >
          Next →
        </button>
      );
    }

    return <div className="pagination">{pages}</div>;
  };

  if (loading && tickets.length === 0) {
    return <Loading text="Loading tickets..." />;
  }

  return (
    <div className="ticket-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Support Tickets</h1>
          <p className="page-subtitle">
            Manage and track all support requests
          </p>
        </div>
        <div className="header-actions">
          <Link to="/tickets/new" className="btn btn-primary">
            <span>➕</span> New Ticket
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search tickets..."
              defaultValue={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value={TICKET_STATUS.OPEN}>Open</option>
              <option value={TICKET_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TICKET_STATUS.RESOLVED}>Resolved</option>
              <option value={TICKET_STATUS.CLOSED}>Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="">All Priority</option>
              <option value={TICKET_PRIORITY.LOW}>Low</option>
              <option value={TICKET_PRIORITY.MEDIUM}>Medium</option>
              <option value={TICKET_PRIORITY.HIGH}>High</option>
              <option value={TICKET_PRIORITY.CRITICAL}>Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value={TICKET_CATEGORY.TECHNICAL}>Technical</option>
              <option value={TICKET_CATEGORY.BILLING}>Billing</option>
              <option value={TICKET_CATEGORY.GENERAL}>General</option>
              <option value={TICKET_CATEGORY.FEATURE_REQUEST}>Feature Request</option>
            </select>
          </div>

          <button onClick={clearFilters} className="btn btn-outline">
            Clear Filters
          </button>
        </div>

        <div className="sort-options">
          <span className="sort-label">Sort by:</span>
          <button
            onClick={() => handleSort('createdAt')}
            className={`sort-btn ${filters.sortBy === 'createdAt' ? 'active' : ''}`}
          >
            Date Created {filters.sortBy === 'createdAt' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('updatedAt')}
            className={`sort-btn ${filters.sortBy === 'updatedAt' ? 'active' : ''}`}
          >
            Last Updated {filters.sortBy === 'updatedAt' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('priority')}
            className={`sort-btn ${filters.sortBy === 'priority' ? 'active' : ''}`}
          >
            Priority {filters.sortBy === 'priority' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {pagination.totalItems} ticket{pagination.totalItems !== 1 ? 's' : ''} found
        </span>
        {Object.values(filters).some(v => v) && (
          <span className="filter-indicator">
            (filtered results)
          </span>
        )}
      </div>

      {/* Tickets Grid */}
      <div className="tickets-container">
        {loading && (
          <div className="loading-overlay">
            <Loading text="Loading tickets..." inline />
          </div>
        )}

        {tickets.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No tickets found</h3>
            <p>
              {Object.values(filters).some(v => v)
                ? "Try adjusting your filters or search terms."
                : "Create your first support ticket to get started."
              }
            </p>
            <div className="empty-actions">
              {Object.values(filters).some(v => v) ? (
                <button onClick={clearFilters} className="btn btn-outline">
                  Clear Filters
                </button>
              ) : (
                <Link to="/tickets/new" className="btn btn-primary">
                  Create Ticket
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default TicketList;
