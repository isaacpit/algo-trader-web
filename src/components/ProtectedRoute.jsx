import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDebug } from "../context/DebugContext";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";

export const ProtectedRoute = ({ children }) => {
  const { addDebugLog } = useDebug();
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const hasLoggedAccess = useRef(false);

  // Log unauthorized access only once when component mounts
  useEffect(() => {
    if (!loading && !isAuthenticated() && !hasLoggedAccess.current) {
      hasLoggedAccess.current = true;
      addDebugLog({
        emoji: "🔒",
        title: "Protected route accessed without authentication",
        data: {
          path: location.pathname,
          timestamp: new Date().toISOString(),
          user: user,
          hasUserInStorage: !!localStorage.getItem("user"),
        },
      });
    }
  }, [loading, isAuthenticated, user, location.pathname, addDebugLog]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Store the intended destination for redirect after authentication
    localStorage.setItem("redirect_after_auth", location.pathname);

    // Redirect to signup page with the intended destination
    return <Navigate to={ROUTES.SIGNUP} state={{ from: location }} replace />;
  }

  return children;
};
