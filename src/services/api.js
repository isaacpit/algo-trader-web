import { API_ENDPOINTS } from '../constants';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
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