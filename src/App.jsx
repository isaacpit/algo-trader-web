import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { DebugProvider } from "./context/DebugContext";
import { PageLayout } from "./components/layout/PageLayout";
import { LandingPageV2 } from "./pages/v2/LandingPageV2";
import { LandingPageV1 } from "./pages/v1/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { GoogleSignUp } from "./pages/GoogleSignUp";
import { OAuthCallback } from "./components/OAuthCallback";
import { ErrorPage } from "./pages/ErrorPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ROUTES } from "./constants";
import { Profile } from "./pages/Profile";
import { BacktestJobsPage } from "./pages/BacktestJobs";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path={ROUTES.SIGNUP} element={<GoogleSignUp />} />
              <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
              <Route path={ROUTES.ERROR} element={<ErrorPage />} />
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKTEST_JOBS}
                element={
                  <ProtectedRoute>
                    <BacktestJobsPage />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all route for 404 errors */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageLayout>
        </DebugProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
