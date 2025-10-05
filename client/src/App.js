import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import NewTicket from './pages/NewTicket';
import TicketDetails from './pages/TicketDetails';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Header />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/tickets" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Header />
                  <main className="main-content">
                    <TicketList />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/tickets/new" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Header />
                  <main className="main-content">
                    <NewTicket />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Header />
                  <main className="main-content">
                    <TicketDetails />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;
