import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import LandingPageV1 from "./pages/v1/LandingPage";
import LandingPageV2 from "./pages/v2/LandingPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
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
          <Route path="/" element={<LandingPageV2 />} />
          <Route path="/v1" element={<LandingPageV1 />} />
          <Route path="/v2" element={<LandingPageV2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
