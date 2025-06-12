import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DebugProvider } from './context/DebugContext';
import { PageLayout } from './components/layout/PageLayout';
import { LandingPageV2 } from './pages/v2/LandingPageV2';
import { LandingPageV1 } from './pages/v1/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { GoogleSignUp } from './pages/GoogleSignUp';
import { OAuthCallback } from './components/OAuthCallback';
import { ROUTES } from './constants';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <DebugProvider>
          <PageLayout>
            <Routes>
              <Route path={ROUTES.HOME} element={<LandingPageV2 />} />
              <Route path={ROUTES.V1} element={<LandingPageV1 />} />
              <Route path={ROUTES.V2} element={<LandingPageV2 />} />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.SIGNUP} element={<GoogleSignUp />} />
              <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </PageLayout>
        </DebugProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;