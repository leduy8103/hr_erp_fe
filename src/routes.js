// src/routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AllEmployees from './pages/AllEmployee';
import LeaveRequestPage from './pages/LeaveRequestPage';
import LeaveApprovalPage from './pages/LeaveApprovalPage';

const AppRoutes = () => {
  const isAuthenticated = () => !!localStorage.getItem('user');

  const hasRole = (role) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === role;
  };

  const isAdminOrManager = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'Admin' || user.role === 'Manager';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/employees"
          element={isAuthenticated() ? <AllEmployees /> : <Navigate to="/login" />}
        />
        <Route
          path="/leave-request"
          element={isAuthenticated() ? <LeaveRequestPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/leave-approval"
          element={isAuthenticated() && isAdminOrManager() ? <LeaveApprovalPage /> : <Navigate to="/dashboard" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;