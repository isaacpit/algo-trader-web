import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useDebug } from "../context/DebugContext";
import apiService from "../services/api";

const BacktestGenerator = () => {
  const { user } = useAuth();
  const { addDebugLog } = useDebug();
  const [loading, setLoading] = useState(false);
  const [generatedBacktest, setGeneratedBacktest] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    strategy_name: "",
    strategy_description: "",
    timeframe: "1h",
    assets: ["BTC/USD"],
    period: "6 months",
    initial_capital: 10000,
    strategy_type: "momentum",
    strategy_config: {},
  });

  const strategyTypes = [
    {
      value: "momentum",
      label: "Momentum Strategy",
      description: "RSI and volume-based momentum detection",
    },
    {
      value: "mean_reversion",
      label: "Mean Reversion",
      description: "Bollinger Bands mean reversion strategy",
    },
    {
      value: "breakout",
      label: "Breakout Detection",
      description: "ATR-based breakout detection",
    },
    {
      value: "scalping",
      label: "Scalping Strategy",
      description: "High-frequency scalping with tight spreads",
    },
    {
      value: "trend_following",
      label: "Trend Following",
      description: "Moving average crossover strategy",
    },
  ];

  const timeframes = [
    { value: "1m", label: "1 Minute" },
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1d", label: "1 Day" },
  ];

  const periods = [
    { value: "1 month", label: "1 Month" },
    { value: "3 months", label: "3 Months" },
    { value: "6 months", label: "6 Months" },
    { value: "1 year", label: "1 Year" },
    { value: "2 years", label: "2 Years" },
  ];

  const assets = [
    { value: "BTC/USD", label: "Bitcoin (BTC)" },
    { value: "ETH/USD", label: "Ethereum (ETH)" },
    { value: "SOL/USD", label: "Solana (SOL)" },
    { value: "ADA/USD", label: "Cardano (ADA)" },
    { value: "DOT/USD", label: "Polkadot (DOT)" },
    { value: "LINK/USD", label: "Chainlink (LINK)" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAssetChange = (asset, checked) => {
    setFormData((prev) => ({
      ...prev,
      assets: checked
        ? [...prev.assets, asset]
        : prev.assets.filter((a) => a !== asset),
    }));
  };

  const handleStrategyTypeChange = (strategyType) => {
    setFormData((prev) => ({
      ...prev,
      strategy_type: strategyType,
      strategy_config: getDefaultStrategyConfig(strategyType),
    }));
  };

  const getDefaultStrategyConfig = (strategyType) => {
    const configs = {
      momentum: {
        rsi_period: 14,
        volume_threshold: 1.5,
        stop_loss: 0.05,
      },
      mean_reversion: {
        bb_period: 20,
        bb_std: 2,
        rsi_period: 14,
      },
      breakout: {
        atr_period: 14,
        volume_multiplier: 2.0,
        breakout_threshold: 0.02,
      },
      scalping: {
        ema_fast: 9,
        ema_slow: 21,
        stop_loss: 0.01,
      },
      trend_following: {
        sma_fast: 10,
        sma_slow: 30,
        atr_period: 14,
      },
    };
    return configs[strategyType] || {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to generate backtests");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedBacktest(null);

    try {
      addDebugLog({
        emoji: "🔄",
        title: "Generating backtest",
        data: { strategy_name: formData.strategy_name, user_id: user.id },
      });

      const backtestConfig = {
        ...formData,
        user_id: user.id,
      };

      const result = await apiService.generateBacktest(backtestConfig);

      addDebugLog({
        emoji: "✅",
        title: "Backtest generated successfully",
        data: { backtest_id: result.backtest_id },
      });

      setGeneratedBacktest(result);

      // Optionally fetch the full backtest data
      const backtestData = await apiService.getBacktest(result.backtest_id);
      setGeneratedBacktest(backtestData);
    } catch (err) {
      console.error("Error generating backtest:", err);
      setError(err.message || "Failed to generate backtest");

      addDebugLog({
        emoji: "❌",
        title: "Backtest generation failed",
        data: { error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBacktest = async () => {
    if (!generatedBacktest) return;

    try {
      setLoading(true);

      const backtestData = {
        name: formData.strategy_name,
        description: formData.strategy_description,
        timeframe: formData.timeframe,
        assets: formData.assets,
        period: formData.period,
        initial_capital: formData.initial_capital,
        strategy_config: formData.strategy_config,
      };

      await apiService.createBacktest(backtestData);

      addDebugLog({
        emoji: "💾",
        title: "Backtest saved",
        data: { backtest_id: generatedBacktest.id },
      });

      alert("Backtest saved successfully!");
    } catch (err) {
      console.error("Error saving backtest:", err);
      setError(err.message || "Failed to save backtest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Backtest Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate realistic backtests for your trading strategies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Strategy Configuration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Strategy Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strategy Name
              </label>
              <input
                type="text"
                value={formData.strategy_name}
                onChange={(e) =>
                  handleInputChange("strategy_name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter strategy name"
                required
              />
            </div>

            {/* Strategy Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.strategy_description}
                onChange={(e) =>
                  handleInputChange("strategy_description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your strategy"
                required
              />
            </div>

            {/* Strategy Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strategy Type
              </label>
              <select
                value={formData.strategy_type}
                onChange={(e) => handleStrategyTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {strategyTypes.map((strategy) => (
                  <option key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {
                  strategyTypes.find((s) => s.value === formData.strategy_type)
                    ?.description
                }
              </p>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeframe
              </label>
              <select
                value={formData.timeframe}
                onChange={(e) => handleInputChange("timeframe", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assets
              </label>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <label key={asset.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.assets.includes(asset.value)}
                      onChange={(e) =>
                        handleAssetChange(asset.value, e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {asset.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backtest Period
              </label>
              <select
                value={formData.period}
                onChange={(e) => handleInputChange("period", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Capital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Capital ($)
              </label>
              <input
                type="number"
                value={formData.initial_capital}
                onChange={(e) =>
                  handleInputChange(
                    "initial_capital",
                    parseFloat(e.target.value)
                  )
                }
                min="100"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Backtest"}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Results
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Generating backtest...
              </span>
            </div>
          )}

          {generatedBacktest && !loading && (
            <div className="space-y-6">
              {/* Backtest Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {generatedBacktest.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {generatedBacktest.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Timeframe:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {generatedBacktest.timeframe}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Period:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {generatedBacktest.period}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Initial Capital:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      ${generatedBacktest.initial_capital?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Final Capital:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      ${generatedBacktest.final_capital?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {generatedBacktest.performance && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Win Rate
                      </span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(generatedBacktest.performance.win_rate * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Profit Factor
                      </span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {generatedBacktest.performance.profit_factor.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Total Trades
                      </span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {generatedBacktest.performance.total_trades}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Avg Return
                      </span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {generatedBacktest.performance.avg_return.toFixed(2)}%
                      </p>
                    </div>
                    {generatedBacktest.performance.max_drawdown && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Max Drawdown
                        </span>
                        <p className="text-lg font-semibold text-red-600">
                          {generatedBacktest.performance.max_drawdown.toFixed(
                            2
                          )}
                          %
                        </p>
                      </div>
                    )}
                    {generatedBacktest.performance.sharpe_ratio && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Sharpe Ratio
                        </span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {generatedBacktest.performance.sharpe_ratio.toFixed(
                            2
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveBacktest}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Backtest
                </button>
                <button
                  onClick={() => setGeneratedBacktest(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Generate New
                </button>
              </div>
            </div>
          )}

          {!generatedBacktest && !loading && !error && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
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
              <p>
                Configure your strategy and generate a backtest to see results
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacktestGenerator;
