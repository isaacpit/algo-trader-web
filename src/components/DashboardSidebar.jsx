import React from "react";
import { useTheme } from "../context/ThemeContext";

export const DashboardSidebar = ({ activeMode, onModeChange }) => {
  const { isDarkMode } = useTheme();

  const modes = [
    {
      id: "feed",
      name: "Feed",
      description: "Top signals and backtests",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "my-signals",
      name: "My Signals",
      description: "Your strategies and backtests",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "create",
      name: "Create Signal",
      description: "Build and backtest strategies",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      id: "backtest-jobs",
      name: "Backtest Jobs",
      description: "Monitor job status and results",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`w-64 h-screen fixed left-0 top-0 pt-16 border-r ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="p-4">
        <div className="mb-6">
          <h2
            className={`text-lg font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dashboard
          </h2>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your trading strategies
          </p>
        </div>

        <nav className="space-y-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                activeMode === mode.id
                  ? isDarkMode
                    ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700 shadow-sm"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div
                className={`${
                  activeMode === mode.id
                    ? isDarkMode
                      ? "text-indigo-400"
                      : "text-indigo-600"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                {mode.icon}
              </div>
              <div>
                <div
                  className={`font-medium ${
                    activeMode === mode.id
                      ? isDarkMode
                        ? "text-indigo-300"
                        : "text-indigo-700"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {mode.name}
                </div>
                <div
                  className={`text-xs ${
                    activeMode === mode.id
                      ? isDarkMode
                        ? "text-indigo-400/70"
                        : "text-indigo-600/70"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {mode.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
