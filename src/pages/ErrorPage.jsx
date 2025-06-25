import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDebug } from "../context/DebugContext";
import { FaExclamationTriangle, FaHome, FaRedo, FaBug } from "react-icons/fa";

export const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { addDebugLog } = useDebug();
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    // Get error details from location state or URL params
    const errorFromState = location.state?.error;
    const errorFromParams = new URLSearchParams(location.search).get("error");
    const errorMessage = new URLSearchParams(location.search).get("message");

    const error = {
      type: errorFromState?.type || errorFromParams || "unknown",
      message:
        errorFromState?.message ||
        errorMessage ||
        "Something went wrong during the authentication process.",
      details: errorFromState?.details || null,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    setErrorDetails(error);

    // Log the error for debugging
    addDebugLog({
      emoji: "🚨",
      title: "OAuth Error Page Loaded",
      data: {
        error,
        location: {
          pathname: location.pathname,
          search: location.search,
          state: location.state,
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    });

    // Log to console for developers
    console.group("🔐 OAuth Authentication Error");
    console.error("Error Type:", error.type);
    console.error("Error Message:", error.message);
    console.error("Error Details:", error.details);
    console.error("Timestamp:", error.timestamp);
    console.error("URL:", error.url);
    console.error("User Agent:", navigator.userAgent);
    console.error("Location State:", location.state);
    console.error("URL Search Params:", location.search);
    console.groupEnd();
  }, [location, addDebugLog]);

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case "network":
        return <FaExclamationTriangle className="w-16 h-16 text-red-500" />;
      case "timeout":
        return <FaExclamationTriangle className="w-16 h-16 text-orange-500" />;
      case "server":
        return <FaExclamationTriangle className="w-16 h-16 text-orange-500" />;
      case "auth":
        return <FaExclamationTriangle className="w-16 h-16 text-yellow-500" />;
      case "not_found":
        return <FaExclamationTriangle className="w-16 h-16 text-blue-500" />;
      default:
        return <FaExclamationTriangle className="w-16 h-16 text-gray-500" />;
    }
  };

  const getErrorTitle = (errorType) => {
    switch (errorType) {
      case "network":
        return "Connection Error";
      case "timeout":
        return "Timeout Error";
      case "server":
        return "Server Error";
      case "auth":
        return "Authentication Error";
      case "state_mismatch":
        return "Security Error";
      case "token_missing":
        return "Token Error";
      case "not_found":
        return "Page Not Found";
      default:
        return "Authentication Failed";
    }
  };

  const getErrorDescription = (errorType) => {
    switch (errorType) {
      case "network":
        return "Unable to connect to our authentication server. Please check your internet connection and try again.";
      case "timeout":
        return "The authentication server took too long to respond. This might be due to high server load. Please try again.";
      case "server":
        return "Our authentication server is experiencing issues. Please try again in a few minutes.";
      case "auth":
        return "There was an issue with the authentication process. Please try signing in again.";
      case "state_mismatch":
        return "Security verification failed. This could be due to a browser refresh or security issue.";
      case "token_missing":
        return "Authentication token was not received. Please try the sign-in process again.";
      case "not_found":
        return "The page you are looking for does not exist. It may have been moved, deleted, or you entered the wrong URL.";
      default:
        return "An unexpected error occurred during the authentication process. Please try again.";
    }
  };

  const handleRetry = () => {
    addDebugLog({
      emoji: "🔄",
      title: "User clicked retry button",
      data: { errorType: errorDetails?.type },
    });

    // Clear any stored OAuth state
    localStorage.removeItem("oauth_state");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");

    // Redirect to home page to restart the process
    navigate("/");
  };

  const handleGoHome = () => {
    addDebugLog({
      emoji: "🏠",
      title: "User clicked go home button",
      data: { errorType: errorDetails?.type },
    });

    // Clear any stored OAuth state
    localStorage.removeItem("oauth_state");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");

    navigate("/");
  };

  const handleReportIssue = () => {
    addDebugLog({
      emoji: "🐛",
      title: "User clicked report issue button",
      data: { errorType: errorDetails?.type },
    });

    // Create a detailed error report
    const errorReport = {
      error: errorDetails,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      localStorage: {
        hasOAuthState: !!localStorage.getItem("oauth_state"),
        hasUser: !!localStorage.getItem("user"),
        hasAccessToken: !!localStorage.getItem("access_token"),
      },
    };

    console.group("🐛 Error Report for Support");
    console.log("Error Report:", errorReport);
    console.log("Copy this information and send it to support:");
    console.log(JSON.stringify(errorReport, null, 2));
    console.groupEnd();

    // You could also send this to your error reporting service
    // or open a support ticket
    alert(
      "Error report copied to console. Please contact support with this information."
    );
  };

  if (!errorDetails) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-lg p-8`}
      >
        <div className="text-center">
          {getErrorIcon(errorDetails.type)}

          <h1
            className={`mt-6 text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {getErrorTitle(errorDetails.type)}
          </h1>

          <p
            className={`mt-4 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {getErrorDescription(errorDetails.type)}
          </p>

          {errorDetails.message && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <strong>Details:</strong> {errorDetails.message}
            </div>
          )}

          {/* Show available routes for 404 errors */}
          {errorDetails.type === "not_found" &&
            errorDetails.details?.availableRoutes && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <strong>Available Pages:</strong>
                <div className="mt-2 space-y-1">
                  {errorDetails.details.availableRoutes.map((route, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="font-mono text-xs">{route}</span>
                      <button
                        onClick={() => navigate(route)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isDarkMode
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        Go
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Show route suggestions for 404 errors */}
          {errorDetails.type === "not_found" &&
            errorDetails.details?.suggestions &&
            errorDetails.details.suggestions.length > 0 && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  isDarkMode
                    ? "bg-blue-900 text-blue-100"
                    : "bg-blue-50 text-blue-800"
                }`}
              >
                <strong>Did you mean?</strong>
                <div className="mt-2 space-y-1">
                  {errorDetails.details.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="font-mono text-xs">
                        {suggestion.route}
                      </span>
                      <button
                        onClick={() => navigate(suggestion.route)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isDarkMode
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {suggestion.type === "exact" ? "Exact" : "Similar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="mt-8 space-y-3">
            <button
              onClick={handleRetry}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <FaRedo className="w-4 h-4 mr-2" />
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaHome className="w-4 h-4 mr-2" />
              Go Home
            </button>

            <button
              onClick={handleReportIssue}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaBug className="w-4 h-4 mr-2" />
              Report Issue
            </button>
          </div>

          <div
            className={`mt-6 text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Error ID: {errorDetails.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};
