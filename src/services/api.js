import { API_ENDPOINTS } from '../constants';
import { config } from '../config/environment';

const API_BASE_URL = config.API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

// Helper function to track API calls
const trackApiCall = (startTime, success = true) => {
  const loadTime = performance.now() - startTime;
  if (window.trackApiCall) {
    window.trackApiCall(loadTime, success);
  }
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const api = {
  async get(endpoint) {
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });
      const result = await handleResponse(response);
      trackApiCall(startTime, true);
      return result;
    } catch (error) {
      trackApiCall(startTime, false);
      throw error;
    }
  },

  async post(endpoint, data) {
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      trackApiCall(startTime, true);
      return result;
    } catch (error) {
      trackApiCall(startTime, false);
      throw error;
    }
  },

  async put(endpoint, data) {
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      trackApiCall(startTime, true);
      return result;
    } catch (error) {
      trackApiCall(startTime, false);
      throw error;
    }
  },

  async delete(endpoint) {
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const result = await handleResponse(response);
      trackApiCall(startTime, true);
      return result;
    } catch (error) {
      trackApiCall(startTime, false);
      throw error;
    }
  },
};

// Auth API calls
export const authApi = {
  async login(credentials) {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  async logout() {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async handleCallback(token) {
    return api.post(API_ENDPOINTS.AUTH.CALLBACK, { token });
  },
};

// Signals API calls
export const signalsApi = {
  async getSignals() {
    return api.get(API_ENDPOINTS.SIGNALS.LIST);
  },

  async getSignal(id) {
    return api.get(API_ENDPOINTS.SIGNALS.DETAIL(id));
  },

  async backtestSignal(id, params) {
    return api.post(API_ENDPOINTS.SIGNALS.BACKTEST(id), params);
  },
}; 