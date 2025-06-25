import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS, ROUTES } from "../constants";
import { useDebug } from "../context/DebugContext";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addDebugLog } = useDebug();

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser && storedUser !== "null" && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        addDebugLog({
          emoji: "👤",
          title: "User loaded from storage",
          data: { user: parsedUser },
        });
      } catch (error) {
        addDebugLog({
          emoji: "❌",
          title: "Error parsing stored user",
          data: { error: error.message },
        });
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } else {
      addDebugLog({
        emoji: "ℹ️",
        title: "No user found in storage",
        data: { storedUser },
      });
    }
    setLoading(false);
  }, [addDebugLog]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    addDebugLog({
      emoji: "✅",
      title: "User logged in",
      data: { user: userData },
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    addDebugLog({
      emoji: "🚪",
      title: "User logged out",
    });
    navigate(ROUTES.HOME);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };
};
