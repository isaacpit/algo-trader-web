import React, { useState } from "react";
import { PerformanceChart } from "./charts/PerformanceChart";

export const MySignals = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Hardcoded user's signals and backtests - will be replaced with backend data
  const myItems = [
    {
      id: 1,
      type: "signal",
      name: "BTC Momentum Strategy",
      description:
        "My custom momentum strategy using RSI and volume confirmation",
      status: "active",
      timeframe: "4h",
      assets: ["BTC/USD"],
      createdAt: "2024-03-10T14:30:00Z",
      lastUpdated: "2024-03-15T10:30:00Z",
      followers: 45,
      performance: {
        winRate: 0.72,
        profitFactor: 1.95,
        totalTrades: 89,
        avgReturn: 8.7,
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: "Strategy Performance",
            data: Array.from(
              { length: 100 },
              (_, i) => 1000 + Math.sin(i * 0.1) * 120 + i * 12
            ),
            borderColor: "rgba(99, 102, 241, 0.8)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            fill: true,
          },
          {
            label: "BTC/USD",
            data: Array.from(
              { length: 100 },
              (_, i) => 1000 + Math.sin(i * 0.08) * 80 + i * 8
            ),
            borderColor: "rgba(156, 163, 175, 0.8)",
            backgroundColor: "rgba(156, 163, 175, 0.1)",
            fill: true,
          },
        ],
      },
    },
    {
      id: 2,
      type: "backtest",
      name: "ETH Scalping Strategy",
      description:
        "High-frequency scalping strategy for ETH with tight spreads",
      status: "draft",
      timeframe: "1m",
      assets: ["ETH/USD"],
      createdAt: "2024-03-12T09:15:00Z",
      lastUpdated: "2024-03-14T16:45:00Z",
      followers: 0,
      performance: {
        winRate: 0.72,
        profitFactor: 1.8,
        totalTrades: 324,
        avgReturn: 2.1,
        maxDrawdown: -8.5,
        sharpeRatio: 1.6,
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: "Strategy Performance",
            data: Array.from(
              { length: 100 },
              (_, i) => 1000 + Math.sin(i * 0.15) * 120 + i * 12
            ),
            borderColor: "rgba(139, 92, 246, 0.8)",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            fill: true,
          },
        ],
      },
    },
    {
      id: 3,
      type: "signal",
      name: "SOL Breakout Detector",
      description:
        "Breakout detection strategy for SOL with volume confirmation",
      status: "paused",
      timeframe: "1d",
      assets: ["SOL/USD"],
      createdAt: "2024-03-08T11:20:00Z",
      lastUpdated: "2024-03-13T14:20:00Z",
      followers: 23,
      performance: {
        winRate: 0.68,
        profitFactor: 2.1,
        totalTrades: 67,
        avgReturn: 12.5,
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: "Strategy Performance",
            data: Array.from(
              { length: 100 },
              (_, i) => 1000 + Math.sin(i * 0.12) * 180 + i * 18
            ),
            borderColor: "rgba(245, 158, 11, 0.8)",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            fill: true,
          },
          {
            label: "SOL/USD",
            data: Array.from(
              { length: 100 },
              (_, i) => 1000 + Math.sin(i * 0.08) * 80 + i * 8
            ),
            borderColor: "rgba(156, 163, 175, 0.8)",
            backgroundColor: "rgba(156, 163, 175, 0.1)",
            fill: true,
          },
        ],
      },
    },
    {
      id: 4,
      type: "backtest",
      name: "ADA Trend Following",
      description: "Trend following strategy for ADA with multiple timeframes",
      status: "active",
      timeframe: "1h",
      assets: ["ADA/USD"],
      createdAt: "2024-03-05T16:20:00Z",
      lastUpdated: "2024-03-12T09:30:00Z",
      followers: 12,
      performance: {
        winRate: 0.58,
        profitFactor: 1.4,
        totalTrades: 156,
        avgReturn: 3.2,
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: "Strategy Performance",
            data: Array.from(
              { length: 100 },
              (_, i) => 1000 + Math.sin(i * 0.09) * 90 + i * 9
            ),
            borderColor: "rgba(16, 185, 129, 0.8)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
          },
        ],
      },
    },
  ];

  // Filter items based on active filter
  const filteredItems = myItems.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "signals") return item.type === "signal";
    if (activeFilter === "backtests") return item.type === "backtest";
    if (activeFilter === "active") return item.status === "active";
    if (activeFilter === "draft") return item.status === "draft";
    if (activeFilter === "paused") return item.status === "paused";
    return true;
  });

  // Sort items based on sortBy
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    }
    if (sortBy === "oldest") {
      return new Date(a.lastUpdated) - new Date(b.lastUpdated);
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "followers") {
      return b.followers - a.followers;
    }
    return 0;
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Signals & Backtests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track your trading strategies and performance
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All", count: myItems.length },
            {
              key: "signals",
              label: "Signals",
              count: myItems.filter((item) => item.type === "signal").length,
            },
            {
              key: "backtests",
              label: "Backtests",
              count: myItems.filter((item) => item.type === "backtest").length,
            },
            {
              key: "active",
              label: "Active",
              count: myItems.filter((item) => item.status === "active").length,
            },
            {
              key: "draft",
              label: "Draft",
              count: myItems.filter((item) => item.status === "draft").length,
            },
            {
              key: "paused",
              label: "Paused",
              count: myItems.filter((item) => item.status === "paused").length,
            },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === filter.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {filter.label}
              <span className="ml-2 px-2 py-0.5 text-xs bg-white dark:bg-gray-800 rounded-full">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name</option>
            <option value="followers">Most Followers</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedItems.map((item) => {
          // Performance data is now guaranteed to exist
          const performance = item.performance;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.type === "signal"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {item.type === "signal" ? "Signal" : "Backtest"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : item.status === "paused"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(item.lastUpdated)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Timeframe:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {item.timeframe}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Assets:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {item.assets.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Followers:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {item.followers}
                    </span>
                  </div>
                  {item.type === "backtest" && item.performance && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Initial Capital:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        ${item.initialCapital?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Win Rate
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {performance.winRate
                        ? (performance.winRate * 100).toFixed(1)
                        : "N/A"}
                      %
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Profit Factor
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {performance.profitFactor
                        ? performance.profitFactor.toFixed(2)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Trades
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {performance.totalTrades || "N/A"}
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
                  <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Edit
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Duplicate
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      Delete
                    </button>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    {item.type === "signal" ? "View Signal" : "View Backtest"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No items found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {activeFilter === "all"
              ? "You haven't created any signals or backtests yet."
              : `No ${activeFilter} items found. Try adjusting your filters.`}
          </p>
          <button className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            Create Your First{" "}
            {activeFilter === "signals"
              ? "Signal"
              : activeFilter === "backtests"
              ? "Backtest"
              : "Strategy"}
          </button>
        </div>
      )}
    </div>
  );
};
