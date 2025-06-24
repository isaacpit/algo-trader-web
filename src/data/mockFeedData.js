// Mock backend data generator for performance testing
const generateChartData = (baseValue = 1000, volatility = 0.1, trend = 0.02, length = 100) => {
  console.log(`[MOCK SERVER] Generating chart data: baseValue=${baseValue}, volatility=${volatility}, trend=${trend}, length=${length}`);
  const data = Array.from({ length }, (_, i) => {
    const trendComponent = baseValue + (i * trend * baseValue);
    const volatilityComponent = Math.sin(i * 0.1) * volatility * baseValue;
    const noise = (Math.random() - 0.5) * volatility * 0.5 * baseValue;
    return Math.max(0, trendComponent + volatilityComponent + noise);
  });
  console.log(`[MOCK SERVER] Generated ${data.length} data points, first: ${data[0]}, last: ${data[data.length - 1]}`);
  return data;
};

const generateBenchmarkData = (baseValue = 1000, volatility = 0.05, trend = 0.01, length = 100) => {
  console.log(`[MOCK SERVER] Generating benchmark data: baseValue=${baseValue}, volatility=${volatility}, trend=${trend}, length=${length}`);
  const data = Array.from({ length }, (_, i) => {
    const trendComponent = baseValue + (i * trend * baseValue);
    const volatilityComponent = Math.sin(i * 0.08) * volatility * baseValue;
    const noise = (Math.random() - 0.5) * volatility * 0.3 * baseValue;
    return Math.max(0, trendComponent + volatilityComponent + noise);
  });
  console.log(`[MOCK SERVER] Generated ${data.length} benchmark points, first: ${data[0]}, last: ${data[data.length - 1]}`);
  return data;
};

const userNames = [
  'CryptoTrader_Pro', 'QuantMaster', 'AltcoinHunter', 'BitcoinWhale', 'ETH_Maximalist',
  'SolanaTrader', 'DeFi_Expert', 'TechnicalAnalyst', 'MomentumTrader', 'ScalpingPro',
  'TrendFollower', 'ArbitrageKing', 'GridTrader', 'DCA_Master', 'SwingTrader',
  'DayTrader_Elite', 'CryptoGuru', 'BlockchainBull', 'DigitalAssetPro', 'TokenTrader'
];

const strategyNames = [
  'BTC Momentum Strategy', 'ETH Scalping System', 'SOL Breakout Detector', 'Multi-Asset Portfolio',
  'RSI Divergence Trader', 'MACD Crossover Pro', 'Bollinger Band Master', 'Volume Price Analysis',
  'Fibonacci Retracement', 'Support Resistance Trader', 'Moving Average Crossover', 'Stochastic Oscillator',
  'Williams %R Strategy', 'Commodity Channel Index', 'Average Directional Index', 'Parabolic SAR Trader',
  'Ichimoku Cloud Master', 'Pivot Point Trader', 'Gann Fan Analysis', 'Elliott Wave Trader'
];

const strategyDescriptions = [
  'Advanced momentum detection using RSI and volume confirmation',
  'High-frequency scalping strategy with tight spreads',
  'Breakout detection with volume and price action confirmation',
  'Diversified portfolio strategy across multiple cryptocurrencies',
  'RSI divergence detection for trend reversals',
  'MACD signal crossover with momentum confirmation',
  'Bollinger Band breakout and mean reversion strategy',
  'Volume-based price action analysis',
  'Fibonacci retracement levels for entry and exit points',
  'Support and resistance level trading strategy',
  'Moving average crossover with trend confirmation',
  'Stochastic oscillator overbought/oversold signals',
  'Williams %R momentum indicator strategy',
  'CCI-based trend and momentum analysis',
  'ADX trend strength measurement strategy',
  'Parabolic SAR trend following system',
  'Ichimoku cloud-based trend analysis',
  'Pivot point support and resistance trading',
  'Gann fan angle analysis for trend prediction',
  'Elliott wave pattern recognition and trading'
];

const assets = [
  ['BTC/USD'], ['ETH/USD'], ['SOL/USD'], ['ADA/USD'], ['DOT/USD'], ['LINK/USD'],
  ['BTC/USD', 'ETH/USD'], ['ETH/USD', 'SOL/USD'], ['BTC/USD', 'SOL/USD'],
  ['BTC/USD', 'ETH/USD', 'SOL/USD'], ['ETH/USD', 'ADA/USD', 'DOT/USD'],
  ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD']
];

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

const generateMockFeedItem = (id) => {
  console.log(`[MOCK SERVER] Generating feed item ${id}`);
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const strategyName = strategyNames[Math.floor(Math.random() * strategyNames.length)];
  const strategyDesc = strategyDescriptions[Math.floor(Math.random() * strategyDescriptions.length)];
  const asset = assets[Math.floor(Math.random() * assets.length)];
  const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
  const type = Math.random() > 0.5 ? 'signal' : 'backtest';
  const isVerified = Math.random() > 0.3;
  const followers = Math.floor(Math.random() * 5000) + 10;
  
  // Generate realistic performance metrics
  const winRate = 0.5 + (Math.random() * 0.4); // 50-90%
  const profitFactor = 1.2 + (Math.random() * 1.8); // 1.2-3.0
  const totalTrades = Math.floor(Math.random() * 300) + 20; // 20-320 trades
  const avgReturn = 2 + (Math.random() * 18); // 2-20%
  
  // Generate chart data with realistic patterns
  const baseValue = 1000 + (Math.random() * 2000);
  const volatility = 0.05 + (Math.random() * 0.15);
  const trend = (Math.random() - 0.5) * 0.04; // Slight up or down trend
  
  console.log(`[MOCK SERVER] Creating chart data for item ${id}: type=${type}, baseValue=${baseValue}, volatility=${volatility}, trend=${trend}`);
  
  const chartData = {
    labels: Array.from({ length: 100 }, (_, i) => i),
    datasets: [
      {
        label: type === 'signal' ? 'Strategy Performance' : 'Portfolio Value',
        data: generateChartData(baseValue, volatility, trend, 100),
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`,
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.1)`,
        fill: true,
      },
      {
        label: asset[0] || 'Market Average',
        data: generateBenchmarkData(baseValue, volatility * 0.6, trend * 0.5, 100),
        borderColor: 'rgba(156, 163, 175, 0.8)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        fill: true,
      }
    ]
  };

  console.log(`[MOCK SERVER] Chart data created for item ${id}:`, {
    labelsCount: chartData.labels.length,
    datasetsCount: chartData.datasets.length,
    firstDatasetDataCount: chartData.datasets[0].data.length,
    secondDatasetDataCount: chartData.datasets[1].data.length
  });

  // Generate timestamps within the last 30 days
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  const lastUpdated = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);

  const likes = Math.floor(Math.random() * 500) + 5;
  const comments = Math.floor(Math.random() * 100) + 1;
  const shares = Math.floor(Math.random() * 50) + 1;

  if (type === 'signal') {
    const item = {
      id,
      type: 'signal',
      user: {
        name: userName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        verified: isVerified,
        followers
      },
      signal: {
        name: strategyName,
        description: strategyDesc,
        timeframe,
        assets: asset,
        entry: `Buy at $${(baseValue * (0.95 + Math.random() * 0.1)).toFixed(2)}`,
        target: `$${(baseValue * (1.05 + Math.random() * 0.15)).toFixed(2)}`,
        stopLoss: `$${(baseValue * (0.85 + Math.random() * 0.1)).toFixed(2)}`,
        confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
      },
      performance: {
        winRate,
        profitFactor,
        totalTrades,
        avgReturn
      },
      chartData,
      timestamp: createdAt.toISOString(),
      likes,
      comments,
      shares
    };
    console.log(`[MOCK SERVER] Created signal item ${id}:`, { name: item.signal.name, timeframe: item.signal.timeframe });
    return item;
  } else {
    const item = {
      id,
      type: 'backtest',
      user: {
        name: userName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        verified: isVerified,
        followers
      },
      backtest: {
        name: strategyName,
        description: strategyDesc,
        timeframe,
        assets: asset,
        period: `${Math.floor(Math.random() * 12) + 1} months`,
        initialCapital: Math.floor(Math.random() * 50000) + 10000
      },
      performance: {
        winRate,
        profitFactor,
        totalTrades,
        avgReturn,
        maxDrawdown: -(Math.random() * 20 + 5), // -5% to -25%
        sharpeRatio: 0.5 + Math.random() * 2.5 // 0.5 to 3.0
      },
      chartData,
      timestamp: createdAt.toISOString(),
      likes,
      comments,
      shares
    };
    console.log(`[MOCK SERVER] Created backtest item ${id}:`, { name: item.backtest.name, timeframe: item.backtest.timeframe });
    return item;
  }
};

// Generate 500 mock feed items
console.log('[MOCK SERVER] Starting to generate 500 mock feed items...');
export const mockFeedData = Array.from({ length: 500 }, (_, i) => generateMockFeedItem(i + 1));
console.log(`[MOCK SERVER] Generated ${mockFeedData.length} mock feed items`);

// Mock API functions
export const fetchFeedItems = async (page = 1, limit = 10, filters = {}) => {
  const startTime = performance.now();
  console.log(`[MOCK SERVER] fetchFeedItems called: page=${page}, limit=${limit}, filters=`, filters);
  
  try {
    // Validate page size
    const validPageSizes = [10, 20, 50];
    if (!validPageSizes.includes(limit)) {
      console.warn(`[MOCK SERVER] Invalid page size requested: ${limit}, defaulting to 10`);
      limit = 10;
    }
    
    // Simulate API delay based on page size (larger pages take longer)
    const baseDelay = 200;
    const sizeMultiplier = limit / 10; // 10=1x, 20=2x, 50=5x
    const delay = baseDelay + (Math.random() * 300 * sizeMultiplier);
    console.log(`[MOCK SERVER] Simulating API delay: ${delay.toFixed(0)}ms (size multiplier: ${sizeMultiplier.toFixed(1)}x)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    let filteredData = [...mockFeedData];
    console.log(`[MOCK SERVER] Starting with ${filteredData.length} items`);
    
    // Apply filters
    if (filters.type) {
      filteredData = filteredData.filter(item => item.type === filters.type);
      console.log(`[MOCK SERVER] After type filter (${filters.type}): ${filteredData.length} items`);
    }
    if (filters.timeframe) {
      filteredData = filteredData.filter(item => 
        item.type === 'signal' 
          ? item.signal.timeframe === filters.timeframe
          : item.backtest.timeframe === filters.timeframe
      );
      console.log(`[MOCK SERVER] After timeframe filter (${filters.timeframe}): ${filteredData.length} items`);
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    console.log(`[MOCK SERVER] Pagination: startIndex=${startIndex}, endIndex=${endIndex}, returning ${paginatedData.length} items`);
    console.log(`[MOCK SERVER] Page size: ${limit}, Total filtered items: ${filteredData.length}, Total pages: ${Math.ceil(filteredData.length / limit)}`);
    
    const result = {
      items: paginatedData,
      totalItems: filteredData.length,
      currentPage: page,
      totalPages: Math.ceil(filteredData.length / limit),
      hasNextPage: endIndex < filteredData.length,
      pageSize: limit
    };
    
    console.log(`[MOCK SERVER] Returning result:`, {
      itemsCount: result.items.length,
      totalItems: result.totalItems,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      pageSize: result.pageSize
    });
    
    // Track successful API call
    if (window.trackApiCall) {
      const loadTime = performance.now() - startTime;
      window.trackApiCall(loadTime, true);
    }
    
    return result;
  } catch (error) {
    // Track failed API call
    if (window.trackApiCall) {
      const loadTime = performance.now() - startTime;
      window.trackApiCall(loadTime, false);
    }
    throw error;
  }
};

export const fetchFeedItemById = async (id) => {
  const startTime = performance.now();
  console.log(`[MOCK SERVER] fetchFeedItemById called: id=${id}`);
  
  try {
    // Simulate API delay
    const delay = Math.random() * 300 + 100;
    console.log(`[MOCK SERVER] Simulating API delay: ${delay.toFixed(0)}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const item = mockFeedData.find(item => item.id === parseInt(id));
    if (!item) {
      console.log(`[MOCK SERVER] Item not found: id=${id}`);
      throw new Error('Item not found');
    }
    
    console.log(`[MOCK SERVER] Found item:`, { id: item.id, type: item.type, name: item.type === 'signal' ? item.signal.name : item.backtest.name });
    
    // Track successful API call
    if (window.trackApiCall) {
      const loadTime = performance.now() - startTime;
      window.trackApiCall(loadTime, true);
    }
    
    return item;
  } catch (error) {
    // Track failed API call
    if (window.trackApiCall) {
      const loadTime = performance.now() - startTime;
      window.trackApiCall(loadTime, false);
    }
    throw error;
  }
}; 