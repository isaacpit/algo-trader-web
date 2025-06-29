import React, { useEffect } from "react";
import { LazyChart } from "./charts/LazyChart";

const FeedItem = ({ item, formatTimeAgo }) => {
  console.log("[FEED_ITEM] Full item data received:", item);
  console.log("[FEED_ITEM] Item field analysis:", {
    id: item.id,
    type: item.type,
    // Check all possible field name variations
    hasChartData_camel: !!item.chartData,
    hasChartData_snake: !!item.chart_data,
    hasPerformance: !!item.performance,
    hasSignal: !!item.signal,
    hasBacktest: !!item.backtest,
    // Performance field variations
    performanceFields: item.performance ? Object.keys(item.performance) : null,
    // Chart data field variations
    chartDataFields_camel: item.chartData ? Object.keys(item.chartData) : null,
    chartDataFields_snake: item.chart_data
      ? Object.keys(item.chart_data)
      : null,
    // Signal/Backtest field analysis
    signalFields: item.signal ? Object.keys(item.signal) : null,
    backtestFields: item.backtest ? Object.keys(item.backtest) : null,
  });

  useEffect(() => {
    console.log("[FEED_ITEM] FeedItem mounted:", {
      id: item.id,
      type: item.type,
    });
    return () => {
      console.log("[FEED_ITEM] FeedItem unmounted:", {
        id: item.id,
        type: item.type,
      });
    };
  }, [item.id, item.type]);

  // Use the correct field name based on what the API returns
  const chartData = item.chart_data || item.chartData;

  console.log("[FEED_ITEM] Chart data for item", item.id, ":", {
    labels: chartData?.labels?.length || 0,
    datasets:
      chartData?.datasets?.map((ds) => ({
        label: ds.label,
        dataLength: ds.data?.length || 0,
        hasBorderColor: !!ds.borderColor,
        hasBackgroundColor: !!ds.backgroundColor,
      })) || [],
  });

  // Extract performance data (now guaranteed to exist)
  // Handle both camelCase and snake_case field names from API
  const performance = {
    winRate: item.performance.win_rate || item.performance.winRate,
    profitFactor:
      item.performance.profit_factor || item.performance.profitFactor,
    totalTrades: item.performance.total_trades || item.performance.totalTrades,
    avgReturn: item.performance.avg_return || item.performance.avgReturn,
    maxDrawdown: item.performance.max_drawdown || item.performance.maxDrawdown,
    sharpeRatio: item.performance.sharpe_ratio || item.performance.sharpeRatio,
    sortino_ratio: item.performance.sortino_ratio,
    calmar_ratio: item.performance.calmar_ratio,
  };

  // Chart data is now guaranteed to exist

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                item.user.picture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  item.user.name
                )}&background=6366f1&color=fff`
              }
              alt={item.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.user.name}
                </span>
                {item.user.verified && (
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.user.followers.toLocaleString()} followers •{" "}
                {formatTimeAgo(item.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.type === "signal"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              }`}
            >
              {item.type === "signal" ? "Signal" : "Backtest"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {item.type === "signal" && item.signal ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {item.signal.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {item.signal.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Entry
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {item.signal.entry}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Target
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {item.signal.target}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stop Loss
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  {item.signal.stop_loss || item.signal.stopLoss}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Confidence
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {item.signal.confidence}%
                </div>
              </div>
            </div>
          </div>
        ) : item.type === "backtest" && item.backtest ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {item.backtest.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {item.backtest.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Period
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {item.backtest.period}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Initial Capital
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  $
                  {(
                    item.backtest.initial_capital ||
                    item.backtest.initialCapital
                  )?.toLocaleString() || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sharpe Ratio
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {performance.sharpeRatio?.toFixed(2) || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Max Drawdown
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  {performance.maxDrawdown?.toFixed(1) || "N/A"}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unknown Item Type
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Unable to display item details
            </p>
          </div>
        )}
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
        <div className="h-64 mb-6">
          <LazyChart
            chartData={chartData}
            title={
              item.type === "signal" && item.signal
                ? item.signal.name
                : item.type === "backtest" && item.backtest
                ? item.backtest.name
                : "Performance Chart"
            }
            height={256}
          />
        </div>
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{item.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{item.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              <span>{item.shares}</span>
            </button>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            {item.type === "signal" ? "Follow Signal" : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedItem;
