import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDebug } from '../context/DebugContext';

export const ProtectedRoute = ({ children }) => {
  const { addDebugLog } = useDebug();
  const location = useLocation();
  
  const isAuthenticated = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      addDebugLog({
        emoji: '🔒',
        title: 'Protected route accessed without authentication',
        data: { 
          path: location.pathname,
          timestamp: new Date().toISOString()
        },
      });
      return false;
    }
    return true;
  };

  if (!isAuthenticated()) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
}; 