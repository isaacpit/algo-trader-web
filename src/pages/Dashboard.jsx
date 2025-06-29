import React, { useState } from "react";
import { useDebug } from "../context/DebugContext";
import { useAuth } from "../hooks/useAuth";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { Feed } from "../components/Feed";
import { MySignals } from "../components/MySignals";
import { SignalCreation } from "../components/SignalCreation";
import { BacktestJobsView } from "../components/BacktestJobsView";
import { FaSignOutAlt } from "react-icons/fa";

export const Dashboard = () => {
  const { addDebugLog } = useDebug();
  const { logout, user } = useAuth();
  const [activeMode, setActiveMode] = useState("feed");

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    addDebugLog({
      emoji: "🔄",
      title: "Dashboard mode changed",
      data: { from: activeMode, to: mode },
    });
  };

  const handleLogout = () => {
    addDebugLog({
      emoji: "🚪",
      title: "User logging out",
      data: { user: user?.email },
    });
    logout();
  };

  const renderContent = () => {
    switch (activeMode) {
      case "feed":
        return <Feed />;
      case "my-signals":
        return <MySignals />;
      case "create":
        return <SignalCreation />;
      case "backtest-jobs":
        return <BacktestJobsView userId={user?.id} />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar
        activeMode={activeMode}
        onModeChange={handleModeChange}
      />

      {/* Main Content */}
      <div className="ml-64 pt-16">
        <div className="p-6">
          {/* Header with user info and logout */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || user?.email || "User"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your trading signals and algorithms
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};
