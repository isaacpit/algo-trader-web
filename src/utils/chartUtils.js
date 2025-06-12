// Chart data generation utilities
export const generateChartData = (length, volatility, baseValue, trend, noise) => {
  const data = [];
  let value = baseValue;
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * volatility + trend;
    value += Math.sin(i * 0.1) * noise;
    data.push(value);
  }
  return data;
};

export const generateChartTitle = () => {
  const prefixes = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'THETA', 'OMEGA'];
  const suffixes = ['STRAT', 'SIG', 'IND', 'MOM', 'VOL', 'TREND', 'RSI', 'MACD'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}-${suffix}`;
};

export const generateDerivedMetrics = (data) => {
  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const change = ((lastValue - firstValue) / firstValue * 100).toFixed(2);
  const volatility = (Math.max(...data) - Math.min(...data)).toFixed(2);
  const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
  
  return {
    change: `${change}%`,
    volatility: `${volatility}`,
    average: `${avg}`,
  };
};

// Chart formatting utilities
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

// Chart color utilities
export const chartColors = {
  primary: {
    border: 'rgba(99, 102, 241, 0.8)',
    background: 'rgba(99, 102, 241, 0.1)',
  },
  success: {
    border: 'rgba(16, 185, 129, 0.8)',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.8)',
    background: 'rgba(245, 158, 11, 0.1)',
  },
  danger: {
    border: 'rgba(239, 68, 68, 0.8)',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  neutral: {
    border: 'rgba(156, 163, 175, 0.8)',
    background: 'rgba(156, 163, 175, 0.1)',
  },
}; 