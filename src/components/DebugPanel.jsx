import React from "react";
import { useDebug } from "../context/DebugContext";
import { useTheme } from "../context/ThemeContext";

export const DebugPanel = () => {
  const { isDebugMode, debugLogs, clearDebugLogs, toggleDebugMode } =
    useDebug();
  const { isDarkMode } = useTheme();

  // Show toggle button when debug mode is off
  if (!isDebugMode) {
    return (
      <button
        onClick={toggleDebugMode}
        className={`fixed bottom-4 left-4 p-2 rounded-lg shadow-lg border z-[9999] transition-all duration-200 ${
          isDarkMode
            ? "bg-gray-800/90 hover:bg-gray-700/90 text-white border-gray-600"
            : "bg-white/90 hover:bg-gray-50/90 text-gray-700 border-gray-300"
        }`}
        title="Show Debug Panel"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 backdrop-blur-sm rounded-lg shadow-xl border max-h-[50vh] overflow-hidden z-[9999] ${
        isDarkMode
          ? "bg-gray-900/95 border-gray-700"
          : "bg-white/95 border-gray-200"
      }`}
    >
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h3
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Debug Panel
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={clearDebugLogs}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Clear Logs
          </button>
          <button
            onClick={toggleDebugMode}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Close
          </button>
        </div>
      </div>
      <div
        className={`overflow-y-auto max-h-[calc(50vh-4rem)] ${
          isDarkMode
            ? "scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/30"
            : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        }`}
      >
        {debugLogs.map((log, index) => (
          <div
            key={index}
            className={`p-3 border-b transition-colors ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800/50"
                : "border-gray-200 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-start space-x-3">
              <span
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{log.emoji}</span>
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {log.title}
                  </span>
                </div>
                {log.data && (
                  <pre
                    className={`mt-2 text-sm p-2 rounded overflow-x-auto ${
                      isDarkMode
                        ? "text-gray-300 bg-gray-800/50"
                        : "text-gray-700 bg-gray-100/50"
                    }`}
                  >
                    {typeof log.data === "object"
                      ? JSON.stringify(log.data, null, 2)
                      : log.data}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
