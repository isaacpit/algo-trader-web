import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDebug } from "../context/DebugContext";
import { ROUTES } from "../constants";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addDebugLog } = useDebug();

  useEffect(() => {
    // Log the 404 error for debugging
    addDebugLog({
      emoji: "🔍",
      title: "404 Page Not Found",
      data: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        fullUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    });

    // Log to console for developers
    console.group("🔍 404 Page Not Found");
    console.error("Requested Path:", location.pathname);
    console.error("Full URL:", window.location.href);
    console.error("Referrer:", document.referrer);
    console.error("User Agent:", navigator.userAgent);
    console.error("Timestamp:", new Date().toISOString());
    console.groupEnd();

    // Get all available routes from constants
    const availableRoutes = Object.values(ROUTES);

    // Create error information for the error page
    const errorInfo = {
      type: "not_found",
      message: `The page "${location.pathname}" does not exist.`,
      details: {
        requestedPath: location.pathname,
        fullUrl: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        availableRoutes: availableRoutes,
        suggestions: getSuggestions(location.pathname, availableRoutes),
      },
    };

    // Redirect to error page with 404 information
    navigate(ROUTES.ERROR, {
      state: { error: errorInfo },
      replace: true,
    });
  }, [location, navigate, addDebugLog]);

  // Helper function to suggest similar routes
  const getSuggestions = (requestedPath, availableRoutes) => {
    const suggestions = [];
    const pathLower = requestedPath.toLowerCase();

    // Check for exact matches (case insensitive)
    const exactMatch = availableRoutes.find(
      (route) => route.toLowerCase() === pathLower
    );
    if (exactMatch) {
      suggestions.push({ type: "exact", route: exactMatch });
    }

    // Check for partial matches
    const partialMatches = availableRoutes
      .filter(
        (route) =>
          route.toLowerCase().includes(pathLower) ||
          pathLower.includes(route.toLowerCase())
      )
      .slice(0, 3);

    partialMatches.forEach((route) => {
      if (route !== exactMatch) {
        suggestions.push({ type: "partial", route });
      }
    });

    return suggestions;
  };

  // Show a brief loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Page not found, redirecting...
        </p>
      </div>
    </div>
  );
};
