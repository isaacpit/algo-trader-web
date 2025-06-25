import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDebug } from "../context/DebugContext";
import { config } from "../config/environment";

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addDebugLog } = useDebug();
  const isProcessing = useRef(false);

  useEffect(() => {
    // Only process if we have a hash and aren't already processing
    if (!location.hash || isProcessing.current) {
      return;
    }

    const handleCallback = async () => {
      isProcessing.current = true;

      addDebugLog({
        emoji: "🔐",
        title: "Starting OAuth callback handling",
      });

      try {
        // Get the hash fragment from the URL
        const hash = location.hash.substring(1);
        addDebugLog({
          emoji: "📝",
          title: "URL hash fragment",
          data: hash,
        });

        const params = new URLSearchParams(hash);
        const paramsObj = Object.fromEntries(params.entries());
        addDebugLog({
          emoji: "🔍",
          title: "Parsed URL parameters",
          data: paramsObj,
        });

        // Get the access token and state
        const accessToken = params.get("access_token");
        const state = params.get("state");
        const savedState = localStorage.getItem("oauth_state");

        addDebugLog({
          emoji: "🔑",
          title: "State Comparison",
          data: {
            receivedState: state,
            savedState: savedState,
            types: {
              receivedStateType: typeof state,
              savedStateType: typeof savedState,
            },
            lengths: {
              receivedStateLength: state?.length,
              savedStateLength: savedState?.length,
            },
            match: state === savedState,
          },
        });

        // Verify state to prevent CSRF attacks
        if (!state || !savedState) {
          addDebugLog({
            emoji: "❌",
            title: "Missing state values",
            data: {
              receivedState: state,
              savedState: savedState,
            },
          });
          throw new Error("Missing state values");
        }

        if (state !== savedState) {
          addDebugLog({
            emoji: "❌",
            title: "State mismatch - possible CSRF attack",
            data: {
              receivedState: state,
              savedState: savedState,
              comparison: {
                exactMatch: state === savedState,
                trimmedMatch: state.trim() === savedState.trim(),
                caseInsensitiveMatch:
                  state.toLowerCase() === savedState.toLowerCase(),
              },
            },
          });
          throw new Error("Invalid state parameter");
        }

        addDebugLog({
          emoji: "✅",
          title: "State verification successful",
        });

        // Clear the state from localStorage
        localStorage.removeItem("oauth_state");
        addDebugLog({
          emoji: "🧹",
          title: "Cleared OAuth state from localStorage",
        });

        if (accessToken) {
          addDebugLog({
            emoji: "🚀",
            title: "Sending token to callback server",
          });

          // Create an AbortController for timeout handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          try {
            // Send the token to your callback server
            const response = await fetch(config.CALLBACK_SERVER_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ access_token: accessToken }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            addDebugLog({
              emoji: "📡",
              title: "Server response status",
              data: response.status,
            });

            if (!response.ok) {
              const errorText = await response.text();
              addDebugLog({
                emoji: "❌",
                title: "Server error response",
                data: {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                },
              });

              let errorMessage = `Server error: ${response.status} ${response.statusText}`;
              if (errorText) {
                try {
                  const errorData = JSON.parse(errorText);
                  errorMessage =
                    errorData.message || errorData.error || errorMessage;
                } catch (e) {
                  // If response is not JSON, use the text as is
                  errorMessage = errorText || errorMessage;
                }
              }

              throw new Error(errorMessage);
            }

            // Handle successful authentication
            const data = await response.json();
            addDebugLog({
              emoji: "✅",
              title: "Server response data",
              data,
            });

            // Store user data in localStorage - the server returns user data directly
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("access_token", accessToken);

            // Dispatch custom event for auth state change
            window.dispatchEvent(new Event("authStateChanged"));

            // Check if there's a redirect destination from the signup page
            const urlParams = new URLSearchParams(window.location.search);
            const from =
              urlParams.get("from") ||
              localStorage.getItem("redirect_after_auth");

            // Clear the redirect destination
            localStorage.removeItem("redirect_after_auth");

            // Redirect to intended destination or dashboard
            const redirectPath = from || "/dashboard";
            addDebugLog({
              emoji: "🔄",
              title: "Redirecting after successful authentication",
              data: { redirectPath, from },
            });
            navigate(redirectPath);
          } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError.name === "AbortError") {
              throw new Error(
                "Request timeout: The server took too long to respond. Please try again."
              );
            }

            throw fetchError;
          }
        } else {
          addDebugLog({
            emoji: "❌",
            title: "No access token received",
          });
          throw new Error("No access token received");
        }
      } catch (error) {
        addDebugLog({
          emoji: "❌",
          title: "OAuth Callback Error",
          data: {
            message: error.message,
            stack: error.stack,
          },
        });

        // Determine error type based on the error
        let errorType = "unknown";
        let errorMessage = error.message;
        let errorDetails = null;

        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          errorType = "network";
          errorMessage =
            "Unable to connect to the authentication server. Please check your internet connection.";
        } else if (
          error.message.includes("Request timeout") ||
          error.message.includes("timeout")
        ) {
          errorType = "timeout";
          errorMessage =
            "The server took too long to respond. Please try again.";
        } else if (
          error.message.includes("Server error:") ||
          error.message.includes("Failed to send token to server")
        ) {
          errorType = "server";
          errorMessage =
            "The authentication server is experiencing issues. Please try again later.";
        } else if (
          error.message.includes("Invalid state parameter") ||
          error.message.includes("State mismatch")
        ) {
          errorType = "state_mismatch";
          errorMessage =
            "Security verification failed. This could be due to a browser refresh or security issue.";
        } else if (
          error.message.includes("No access token received") ||
          error.message.includes("Missing state values")
        ) {
          errorType = "token_missing";
          errorMessage =
            "Authentication token was not received. Please try the sign-in process again.";
        } else if (
          error.message.includes("auth") ||
          error.message.includes("authentication")
        ) {
          errorType = "auth";
          errorMessage =
            "There was an issue with the authentication process. Please try signing in again.";
        }

        // Create detailed error object
        const errorInfo = {
          type: errorType,
          message: errorMessage,
          details: {
            originalError: error.message,
            stack: error.stack,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            localStorage: {
              hasOAuthState: !!localStorage.getItem("oauth_state"),
              hasUser: !!localStorage.getItem("user"),
              hasAccessToken: !!localStorage.getItem("access_token"),
            },
          },
        };

        // Log detailed error information to console
        console.group("🔐 OAuth Callback Error Details");
        console.error("Error Type:", errorType);
        console.error("Error Message:", errorMessage);
        console.error("Original Error:", error.message);
        console.error("Error Stack:", error.stack);
        console.error("URL:", window.location.href);
        console.error("Timestamp:", new Date().toISOString());
        console.error("User Agent:", navigator.userAgent);
        console.error("LocalStorage State:", {
          hasOAuthState: !!localStorage.getItem("oauth_state"),
          hasUser: !!localStorage.getItem("user"),
          hasAccessToken: !!localStorage.getItem("access_token"),
        });
        console.groupEnd();

        // Clear any stored OAuth state on error
        localStorage.removeItem("oauth_state");
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");

        // Navigate to error page with detailed error information
        navigate("/error", {
          state: { error: errorInfo },
          replace: true,
        });
      } finally {
        isProcessing.current = false;
      }
    };

    handleCallback();
  }, [location.hash]); // Only depend on the hash part of the location

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Completing sign in...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Check the debug panel for detailed information
        </p>
      </div>
    </div>
  );
};
