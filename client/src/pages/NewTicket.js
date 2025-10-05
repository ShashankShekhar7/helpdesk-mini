import React from 'react';
import { useNavigate } from 'react-router-dom';
import TicketForm from '../components/tickets/TicketForm';
import '../styles/pages.css';

const NewTicket = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/tickets');
  };

  return (
    <div className="new-ticket-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Create New Ticket</h1>
          <p className="page-subtitle">
            Submit a support request and we'll get back to you as soon as possible
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="form-container">
          <TicketForm onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
