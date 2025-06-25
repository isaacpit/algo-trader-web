import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export const DebugContext = createContext();

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error("useDebug must be used within a DebugProvider");
  }
  return context;
};

export const DebugProvider = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  const addDebugLog = useCallback((log) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      {
        timestamp: new Date().toISOString(),
        ...log,
      },
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const toggleDebugMode = useCallback(() => {
    setIsDebugMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isDebugMode,
      debugLogs,
      addDebugLog,
      clearDebugLogs,
      toggleDebugMode,
    }),
    [isDebugMode, debugLogs, addDebugLog, clearDebugLogs, toggleDebugMode]
  );

  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  );
};
