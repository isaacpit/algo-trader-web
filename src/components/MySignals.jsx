import React, { useState } from 'react';
import { PerformanceChart } from './charts/PerformanceChart';

export const MySignals = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Hardcoded user's signals and backtests - will be replaced with backend data
  const myItems = [
    {
      id: 1,
      type: 'signal',
      name: 'BTC Momentum Strategy',
      description: 'My custom momentum strategy using RSI and volume confirmation',
      status: 'active',
      timeframe: '4h',
      assets: ['BTC/USD'],
      createdAt: '2024-03-10T14:30:00Z',
      lastUpdated: '2024-03-15T10:30:00Z',
      followers: 45,
      performance: {
        winRate: 0.72,
        profitFactor: 1.95,
        totalTrades: 89,
        avgReturn: 8.7
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: 'Strategy Performance',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.1) * 120 + i * 12),
            borderColor: 'rgba(99, 102, 241, 0.8)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
          },
          {
            label: 'BTC/USD',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 80 + i * 8),
            borderColor: 'rgba(156, 163, 175, 0.8)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
          }
        ]
      }
    },
    {
      id: 2,
      type: 'backtest',
      name: 'ETH Scalping Strategy',
      description: 'High-frequency scalping strategy for ETH with tight spreads',
      status: 'draft',
      timeframe: '1m',
      assets: ['ETH/USD'],
      createdAt: '2024-03-12T09:15:00Z',
      lastUpdated: '2024-03-14T16:45:00Z',
      followers: 0,
      performance: {
        winRate: 0.65,
        profitFactor: 1.8,
        totalTrades: 234,
        avgReturn: 2.3
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: 'Strategy Performance',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.15) * 150 + i * 15),
            borderColor: 'rgba(16, 185, 129, 0.8)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
          },
          {
            label: 'ETH/USD',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 80 + i * 8),
            borderColor: 'rgba(156, 163, 175, 0.8)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
          }
        ]
      }
    },
    {
      id: 3,
      type: 'signal',
      name: 'SOL Breakout Detector',
      description: 'Breakout detection strategy for SOL with volume confirmation',
      status: 'paused',
      timeframe: '1d',
      assets: ['SOL/USD'],
      createdAt: '2024-03-08T11:20:00Z',
      lastUpdated: '2024-03-13T14:20:00Z',
      followers: 23,
      performance: {
        winRate: 0.68,
        profitFactor: 2.1,
        totalTrades: 67,
        avgReturn: 12.5
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: 'Strategy Performance',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.12) * 180 + i * 18),
            borderColor: 'rgba(245, 158, 11, 0.8)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
          },
          {
            label: 'SOL/USD',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 80 + i * 8),
            borderColor: 'rgba(156, 163, 175, 0.8)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
          }
        ]
      }
    },
    {
      id: 4,
      type: 'backtest',
      name: 'Multi-Asset Portfolio Strategy',
      description: 'Diversified portfolio strategy across multiple cryptocurrencies',
      status: 'active',
      timeframe: '4h',
      assets: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD'],
      createdAt: '2024-03-05T16:45:00Z',
      lastUpdated: '2024-03-15T08:30:00Z',
      followers: 67,
      performance: {
        winRate: 0.75,
        profitFactor: 2.3,
        totalTrades: 156,
        avgReturn: 15.2
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: 'Portfolio Performance',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.1) * 200 + i * 20),
            borderColor: 'rgba(239, 68, 68, 0.8)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
          },
          {
            label: 'Market Average',
            data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 80 + i * 8),
            borderColor: 'rgba(156, 163, 175, 0.8)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
          }
        ]
      }
    }
  ];

  const filters = [
    { id: 'all', name: 'All', count: myItems.length },
    { id: 'signal', name: 'Signals', count: myItems.filter(item => item.type === 'signal').length },
    { id: 'backtest', name: 'Backtests', count: myItems.filter(item => item.type === 'backtest').length },
    { id: 'active', name: 'Active', count: myItems.filter(item => item.status === 'active').length },
    { id: 'draft', name: 'Drafts', count: myItems.filter(item => item.status === 'draft').length },
    { id: 'paused', name: 'Paused', count: myItems.filter(item => item.status === 'paused').length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'paused':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type) => {
    return type === 'signal' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredItems = myItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'signal' || activeFilter === 'backtest') return item.type === activeFilter;
    return item.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Signals & Backtests</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your trading strategies and track their performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="recent">Most Recent</option>
            <option value="performance">Best Performance</option>
            <option value="followers">Most Followers</option>
            <option value="name">Name A-Z</option>
          </select>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Create New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              activeFilter === filter.id
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.name} ({filter.count})
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Strategies</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{myItems.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {myItems.filter(item => item.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Followers</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {myItems.reduce((sum, item) => sum + item.followers, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Win Rate</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(myItems.reduce((sum, item) => sum + item.performance.winRate, 0) / myItems.length * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {item.type === 'signal' ? 'Signal' : 'Backtest'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.timeframe}</span>
                    <span>{item.assets.length} assets</span>
                    <span>{item.followers} followers</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created {formatDate(item.createdAt)}
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(item.performance.winRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Factor</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.performance.profitFactor.toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.performance.totalTrades}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-48 mb-6">
                <PerformanceChart
                  data={item.chartData}
                  height="100%"
                  showLegend={true}
                  showTooltip={true}
                  showGrid={true}
                  showAxes={true}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {formatDate(item.lastUpdated)}
                </div>
                <div className="flex space-x-2">
                  {item.status === 'active' && (
                    <button className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800">
                      Pause
                    </button>
                  )}
                  {item.status === 'paused' && (
                    <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800">
                      Resume
                    </button>
                  )}
                  {item.status === 'draft' && (
                    <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800">
                      Publish
                    </button>
                  )}
                  <button className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No strategies found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first trading strategy.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Create Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 