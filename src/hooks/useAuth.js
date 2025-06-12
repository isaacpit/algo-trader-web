import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS, ROUTES } from '../constants';
import { useDebug } from '../context/DebugContext';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { log } = useDebug();

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        log('User loaded from storage', { user: parsedUser });
      } catch (error) {
        log('Error parsing stored user', { error });
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setLoading(false);
  }, [log]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    log('User logged in', { user: userData });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    log('User logged out');
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