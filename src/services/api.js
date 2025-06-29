import { API_ENDPOINTS } from "../constants";
import { config } from "../config/environment";
import {
  fetchFeedItems as mockFetchFeedItems,
  fetchFeedItemById as mockFetchFeedItemById,
} from "../data/mockFeedData";

const API_BASE_URL = config.API_BASE_URL || "http://localhost:3000";
const USE_MOCK_API = config.USE_MOCK_API || false;

console.log(`[API SERVICE] Configuration:`, {
  API_BASE_URL,
  USE_MOCK_API: USE_MOCK_API ? "🎭 MOCK MODE" : "🔗 REAL API",
});

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred");
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
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to normalize data between mock and real API
const normalizeApiResponse = (data, isMockData = false) => {
  if (!data || !data.items) return data;

  console.log(
    `[API SERVICE] Normalizing ${isMockData ? "MOCK" : "REAL"} API response`
  );

  const normalizedItems = data.items.map((item) => {
    if (isMockData) {
      // Convert mock data structure to match real API structure
      return {
        ...item,
        chart_data: item.chartData, // Convert camelCase to snake_case
        user: {
          ...item.user,
          user_id:
            item.user.id ||
            `mock_user_${Math.random().toString(36).substr(2, 9)}`,
          picture: item.user.avatar,
          verified: item.user.verified || false,
          followers: item.user.followers || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Ensure performance uses snake_case for consistency
        performance: {
          win_rate: item.performance.winRate || item.performance.win_rate,
          profit_factor:
            item.performance.profitFactor || item.performance.profit_factor,
          total_trades:
            item.performance.totalTrades || item.performance.total_trades,
          avg_return: item.performance.avgReturn || item.performance.avg_return,
          max_drawdown:
            item.performance.maxDrawdown || item.performance.max_drawdown,
          sharpe_ratio:
            item.performance.sharpeRatio || item.performance.sharpe_ratio,
          sortino_ratio: item.performance.sortino_ratio,
          calmar_ratio: item.performance.calmar_ratio,
        },
        // Convert signal/backtest fields to snake_case if needed
        signal: item.signal
          ? {
              ...item.signal,
              stop_loss: item.signal.stopLoss || item.signal.stop_loss,
              initial_capital:
                item.signal.initialCapital || item.signal.initial_capital,
            }
          : null,
        backtest: item.backtest
          ? {
              ...item.backtest,
              initial_capital:
                item.backtest.initialCapital || item.backtest.initial_capital,
              final_capital:
                item.backtest.finalCapital ||
                item.backtest.final_capital ||
                (item.backtest.initialCapital ||
                  item.backtest.initial_capital) *
                  (1 +
                    (item.performance.avgReturn ||
                      item.performance.avg_return) /
                      100),
            }
          : null,
      };
    } else {
      // Real API data is already in the correct format
      return item;
    }
  });

  return {
    ...data,
    items: normalizedItems,
    total_items: data.totalItems || data.total_items,
    current_page: data.currentPage || data.current_page,
    total_pages: data.totalPages || data.total_pages,
    has_next_page: data.hasNextPage || data.has_next_page,
    page_size: data.pageSize || data.page_size,
  };
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
        method: "POST",
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
        method: "PUT",
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
        method: "DELETE",
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

// Backtest Jobs API calls
export const backtestJobsApi = {
  async createBacktestJob(jobData) {
    return api.post(API_ENDPOINTS.BACKTEST_JOBS.CREATE, jobData);
  },

  async getBacktestJob(jobId) {
    return api.get(API_ENDPOINTS.BACKTEST_JOBS.GET(jobId));
  },

  async getUserBacktestJobs(userId, limit = 50) {
    return api.get(API_ENDPOINTS.BACKTEST_JOBS.GET_USER(userId), {
      params: { limit },
    });
  },

  async cancelBacktestJob(jobId) {
    return api.delete(API_ENDPOINTS.BACKTEST_JOBS.CANCEL(jobId));
  },
};

// API service for communicating with the backend
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      console.log(`[API] Making request to: ${url}`, config);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`[API] Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`[API] Error making request to ${url}:`, error);
      throw error;
    }
  }

  // Feed API
  async getFeedItems(page = 1, limit = 10, filters = {}) {
    console.log(
      `[FEED API] getFeedItems called with USE_MOCK_API: ${USE_MOCK_API}`
    );

    if (USE_MOCK_API) {
      console.log(`[FEED API] Using MOCK data provider`);
      const mockResponse = await mockFetchFeedItems(page, limit, filters);
      const normalizedResponse = normalizeApiResponse(mockResponse, true);

      console.log(`[FEED API] Mock response normalized:`, {
        total_items: normalizedResponse.total_items,
        items_count: normalizedResponse.items?.length,
        current_page: normalizedResponse.current_page,
        total_pages: normalizedResponse.total_pages,
      });

      return normalizedResponse;
    }

    // Real API call
    console.log(`[FEED API] Using REAL API provider`);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.type) {
      params.append("type", filters.type);
    }
    if (filters.timeframe) {
      params.append("timeframe", filters.timeframe);
    }
    if (filters.user_id) {
      params.append("user_id", filters.user_id);
    }

    const endpoint = `/api/feed?${params.toString()}`;
    console.log(`[FEED API] Making request to: ${this.baseURL}${endpoint}`);
    console.log(`[FEED API] Filters:`, filters);

    const response = await this.request(endpoint);
    const normalizedResponse = normalizeApiResponse(response, false);

    // Enhanced debug logging
    console.log(`[FEED API] Real API response normalized:`, normalizedResponse);
    console.log(`[FEED API] Total items:`, normalizedResponse.total_items);
    console.log(`[FEED API] Items count:`, normalizedResponse.items?.length);

    if (normalizedResponse.items && normalizedResponse.items.length > 0) {
      console.log(`[FEED API] First item structure:`, {
        id: normalizedResponse.items[0].id,
        type: normalizedResponse.items[0].type,
        hasSignal: !!normalizedResponse.items[0].signal,
        hasBacktest: !!normalizedResponse.items[0].backtest,
        hasPerformance: !!normalizedResponse.items[0].performance,
        hasChartData: !!normalizedResponse.items[0].chart_data,
        hasUser: !!normalizedResponse.items[0].user,
        signalName: normalizedResponse.items[0].signal?.name,
        backtestName: normalizedResponse.items[0].backtest?.name,
      });

      // Log any items with missing data
      normalizedResponse.items.forEach((item, index) => {
        if (!item.signal && !item.backtest) {
          console.warn(
            `[FEED API] Item ${index} (${item.id}) has no signal or backtest data`
          );
        }
        if (!item.performance) {
          console.warn(
            `[FEED API] Item ${index} (${item.id}) has no performance data`
          );
        }
        if (!item.chart_data) {
          console.warn(
            `[FEED API] Item ${index} (${item.id}) has no chart data`
          );
        }
      });
    }

    return normalizedResponse;
  }

  async getFeedItem(itemId) {
    console.log(
      `[FEED API] getFeedItem called with USE_MOCK_API: ${USE_MOCK_API}`
    );

    if (USE_MOCK_API) {
      console.log(`[FEED API] Using MOCK data provider for item: ${itemId}`);
      const mockItem = await mockFetchFeedItemById(itemId);
      return normalizeApiResponse({ items: [mockItem] }, true).items[0];
    }

    console.log(`[FEED API] Using REAL API provider for item: ${itemId}`);
    return this.request(`/api/feed/${itemId}`);
  }

  // Signal API
  async createSignal(signalData) {
    return this.request("/api/signals", {
      method: "POST",
      body: JSON.stringify(signalData),
    });
  }

  async getSignal(signalId) {
    return this.request(`/api/signals/${signalId}`);
  }

  async updateSignal(signalId, updates) {
    return this.request(`/api/signals/${signalId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteSignal(signalId) {
    return this.request(`/api/signals/${signalId}`, {
      method: "DELETE",
    });
  }

  // Backtest API
  async generateBacktest(backtestConfig) {
    return this.request("/api/backtests/generate", {
      method: "POST",
      body: JSON.stringify(backtestConfig),
    });
  }

  async createBacktest(backtestData) {
    return this.request("/api/backtests", {
      method: "POST",
      body: JSON.stringify(backtestData),
    });
  }

  async getBacktest(backtestId) {
    return this.request(`/api/backtests/${backtestId}`);
  }

  async updateBacktest(backtestId, updates) {
    return this.request(`/api/backtests/${backtestId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteBacktest(backtestId) {
    return this.request(`/api/backtests/${backtestId}`, {
      method: "DELETE",
    });
  }

  // User API
  async getUserSignals(userId, limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    return this.request(`/api/users/${userId}/signals?${params.toString()}`);
  }

  async getUserBacktests(userId, limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    return this.request(`/api/users/${userId}/backtests?${params.toString()}`);
  }

  // Interaction API
  async likeItem(itemId, itemType) {
    const params = new URLSearchParams({
      item_type: itemType,
    });
    return this.request(`/api/items/${itemId}/like?${params.toString()}`, {
      method: "POST",
    });
  }

  async commentItem(itemId, itemType) {
    const params = new URLSearchParams({
      item_type: itemType,
    });
    return this.request(`/api/items/${itemId}/comment?${params.toString()}`, {
      method: "POST",
    });
  }

  async shareItem(itemId, itemType) {
    const params = new URLSearchParams({
      item_type: itemType,
    });
    return this.request(`/api/items/${itemId}/share?${params.toString()}`, {
      method: "POST",
    });
  }

  // Auth API
  async verifySession() {
    return this.request("/api/auth/verify");
  }

  async getUserTokens(userId) {
    return this.request(`/api/auth/tokens/${userId}`);
  }

  async deleteUserTokens(userId) {
    return this.request(`/api/auth/tokens/${userId}`, {
      method: "DELETE",
    });
  }

  // OAuth callback
  async handleOAuthCallback(accessToken, state = null) {
    return this.request("/callback", {
      method: "POST",
      body: JSON.stringify({
        access_token: accessToken,
        state: state,
      }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }

  // Backtest Jobs API
  async createBacktestJob(jobData) {
    return this.request("/api/backtest-jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  async getBacktestJob(jobId) {
    return this.request(`/api/backtest-jobs/${jobId}`, {
      method: "GET",
    });
  }

  async getUserBacktestJobs(userId, limit = 50) {
    return this.request(`/api/backtest-jobs/user/${userId}?limit=${limit}`, {
      method: "GET",
    });
  }

  async cancelBacktestJob(jobId) {
    return this.request(`/api/backtest-jobs/${jobId}`, {
      method: "DELETE",
    });
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  getFeedItems,
  getFeedItem,
  createSignal,
  getSignal,
  updateSignal,
  deleteSignal,
  generateBacktest,
  createBacktest,
  getBacktest,
  updateBacktest,
  deleteBacktest,
  getUserSignals,
  getUserBacktests,
  likeItem,
  commentItem,
  shareItem,
  verifySession,
  getUserTokens,
  deleteUserTokens,
  handleOAuthCallback,
  healthCheck,
  createBacktestJob,
  getBacktestJob,
  getUserBacktestJobs,
  cancelBacktestJob,
} = apiService;
