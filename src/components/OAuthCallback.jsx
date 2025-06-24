import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebug } from '../context/DebugContext';
import { config } from '../config/environment';

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
        emoji: '🔐',
        title: 'Starting OAuth callback handling',
      });
      
      try {
        // Get the hash fragment from the URL
        const hash = location.hash.substring(1);
        addDebugLog({
          emoji: '📝',
          title: 'URL hash fragment',
          data: hash,
        });
        
        const params = new URLSearchParams(hash);
        const paramsObj = Object.fromEntries(params.entries());
        addDebugLog({
          emoji: '🔍',
          title: 'Parsed URL parameters',
          data: paramsObj,
        });
        
        // Get the access token and state
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const savedState = localStorage.getItem('oauth_state');
        
        addDebugLog({
          emoji: '🔑',
          title: 'State Comparison',
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
            emoji: '❌',
            title: 'Missing state values',
            data: {
              receivedState: state,
              savedState: savedState,
            },
          });
          throw new Error('Missing state values');
        }

        if (state !== savedState) {
          addDebugLog({
            emoji: '❌',
            title: 'State mismatch - possible CSRF attack',
            data: {
              receivedState: state,
              savedState: savedState,
              comparison: {
                exactMatch: state === savedState,
                trimmedMatch: state.trim() === savedState.trim(),
                caseInsensitiveMatch: state.toLowerCase() === savedState.toLowerCase(),
              },
            },
          });
          throw new Error('Invalid state parameter');
        }

        addDebugLog({
          emoji: '✅',
          title: 'State verification successful',
        });

        // Clear the state from localStorage
        localStorage.removeItem('oauth_state');
        addDebugLog({
          emoji: '🧹',
          title: 'Cleared OAuth state from localStorage',
        });

        if (accessToken) {
          addDebugLog({
            emoji: '🚀',
            title: 'Sending token to callback server',
          });
          
          // Send the token to your callback server
          const response = await fetch(config.CALLBACK_SERVER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: accessToken }),
          });

          addDebugLog({
            emoji: '📡',
            title: 'Server response status',
            data: response.status,
          });

          if (!response.ok) {
            addDebugLog({
              emoji: '❌',
              title: 'Server error',
              data: response.statusText,
            });
            throw new Error('Failed to send token to server');
          }

          // Handle successful authentication
          const data = await response.json();
          addDebugLog({
            emoji: '✅',
            title: 'Server response data',
            data,
          });
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('access_token', accessToken);
          
          // Dispatch custom event for auth state change
          window.dispatchEvent(new Event('authStateChanged'));
          
          // Redirect to dashboard
          addDebugLog({
            emoji: '🔄',
            title: 'Redirecting to dashboard',
          });
          navigate('/dashboard');
        } else {
          addDebugLog({
            emoji: '❌',
            title: 'No access token received',
          });
          throw new Error('No access token received');
        }
      } catch (error) {
        addDebugLog({
          emoji: '❌',
          title: 'OAuth Callback Error',
          data: {
            message: error.message,
            stack: error.stack,
          },
        });
        // Handle error (e.g., show error message, redirect to error page)
        navigate('/error');
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
        <p className="mt-4 text-gray-600 dark:text-gray-300">Completing sign in...</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Check the debug panel for detailed information
        </p>
      </div>
    </div>
  );
}; 