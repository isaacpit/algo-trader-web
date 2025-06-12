import React, { useMemo, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDebug } from '../context/DebugContext';

const ProtectedRoute = ({ children }) => {
  const { addDebugLog } = useDebug();
  const location = useLocation();
  const hasLogged = useRef(false);
  
  const isAuthenticated = useMemo(() => {
    const user = localStorage.getItem('user');
    if (!user && !hasLogged.current) {
      hasLogged.current = true;
      addDebugLog({
        emoji: '🔒',
        title: 'Protected route accessed without authentication',
        data: { 
          path: location.pathname,
          timestamp: new Date().toISOString()
        },
      });
    }
    return !!user;
  }, [location.pathname, addDebugLog]);

  if (!isAuthenticated) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 