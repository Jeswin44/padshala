import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import Alert from './Alert';

/**
 * Route guard component that enforces authentication and role-based access
 * Guidelines Section 6.6: "Authorization answers 'what may you do?'"
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <main className="container page-content">
        <Alert
          type="error"
          message={`Access Denied: You must be logged in as an '${requiredRole}' to view this page.`}
        />
      </main>
    );
  }

  return children;
};

export default ProtectedRoute;
