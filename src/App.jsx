import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { DebugProvider } from './context/DebugContext';
import LandingPageV1 from "./pages/v1/LandingPage";
import LandingPageV2 from "./pages/v2/LandingPage";
import Navbar from './components/Navbar';
import OAuthCallback from './components/OAuthCallback';
import SignUp from './pages/SignUp';
import GoogleSignUp from './pages/GoogleSignUp';
import DebugPanel from './components/DebugPanel';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ThemeProvider>
      <DebugProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
            <Navbar />
            {/* Version Switcher */}
            <div className="fixed bottom-4 right-4 z-50 bg-gray-900/80 backdrop-blur-md rounded-lg shadow-lg p-4">
              <div className="flex space-x-4">
                <NavLink
                  to="/v1"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`
                  }
                >
                  Version 1
                </NavLink>
                <NavLink
                  to="/v2"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`
                  }
                >
                  Version 2
                </NavLink>
              </div>
            </div>

            {/* Routes */}
            <Routes>
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/google-signup" element={<GoogleSignUp />} />
              <Route path="/" element={<LandingPageV2 />} />
              <Route path="/v1" element={<LandingPageV1 />} />
              <Route path="/v2" element={<LandingPageV2 />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <DebugPanel />
          </div>
        </Router>
      </DebugProvider>
    </ThemeProvider>
  );
}

export default App;
