// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    CALLBACK: '/api/auth/callback',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  },
  SIGNALS: {
    LIST: '/api/signals',
    DETAIL: (id) => `/api/signals/${id}`,
    BACKTEST: (id) => `/api/signals/${id}/backtest`,
  },
};

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SIGNUP: '/signup',
  OAUTH_CALLBACK: '/oauth/callback',
  V1: '/v1',
  V2: '/v2',
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  OAUTH_STATE: 'oauth_state',
};

// Chart defaults
export const CHART_DEFAULTS = {
  HEIGHT: '300px',
  POINT_RADIUS: 0,
  BORDER_WIDTH: 2,
  TENSION: 0.4,
};

// Signal timeframes
export const TIMEFRAMES = {
  M1: '1m',
  M5: '5m',
  M15: '15m',
  M30: '30m',
  H1: '1h',
  H4: '4h',
  D1: '1d',
  W1: '1w',
};

// Asset types
export const ASSET_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'stock',
  FOREX: 'forex',
  COMMODITY: 'commodity',
};

// Performance metrics
export const PERFORMANCE_METRICS = {
  WIN_RATE: 'winRate',
  PROFIT_FACTOR: 'profitFactor',
  TOTAL_TRADES: 'totalTrades',
  SHARPE_RATIO: 'sharpeRatio',
  MAX_DRAWDOWN: 'maxDrawdown',
  EXPECTANCY: 'expectancy',
}; 