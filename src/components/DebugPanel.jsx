import React from 'react';
import { useDebug } from '../context/DebugContext';

const DebugPanel = () => {
  const { isDebugMode, debugLogs, clearDebugLogs, toggleDebugMode } = useDebug();

  if (!isDebugMode) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 max-h-[50vh] overflow-hidden z-[9999]">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Debug Panel</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={clearDebugLogs}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors"
          >
            Clear Logs
          </button>
          <button
            onClick={toggleDebugMode}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[calc(50vh-4rem)]">
        {debugLogs.map((log, index) => (
          <div
            key={index}
            className="p-3 border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <span className="text-xs text-gray-500 mt-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{log.emoji}</span>
                  <span className="font-medium text-white">{log.title}</span>
                </div>
                {log.data && (
                  <pre className="mt-2 text-sm text-gray-300 bg-gray-800/50 p-2 rounded overflow-x-auto">
                    {typeof log.data === 'object'
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

export default DebugPanel; 