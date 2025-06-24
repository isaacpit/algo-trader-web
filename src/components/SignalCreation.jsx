import React, { useState } from 'react';
import { PerformanceChart } from './charts/PerformanceChart';

export const SignalCreation = () => {
  const [activeTab, setActiveTab] = useState('strategy');
  const [strategyConfig, setStrategyConfig] = useState({
    name: '',
    description: '',
    timeframe: '1h',
    assets: ['BTC/USD'],
    entryConditions: [],
    exitConditions: [],
    riskManagement: {
      stopLoss: 2,
      takeProfit: 6,
      positionSize: 100
    }
  });

  const [backtestResults, setBacktestResults] = useState(null);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  const availableAssets = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 'DOT/USD', 'LINK/USD'];

  const handleStrategyChange = (field, value) => {
    setStrategyConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRiskManagementChange = (field, value) => {
    setStrategyConfig(prev => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [field]: value
      }
    }));
  };

  const runBacktest = () => {
    // Simulate backtest results
    const mockResults = {
      performance: {
        winRate: 0.68,
        profitFactor: 1.85,
        totalTrades: 156,
        avgReturn: 8.5,
        maxDrawdown: -12.3,
        sharpeRatio: 1.2
      },
      chartData: {
        labels: Array.from({ length: 100 }, (_, i) => i),
        datasets: [
          {
            label: 'Strategy Performance',
            data: Array.from({ length: 100 }, (_, i) => 10000 + Math.sin(i * 0.1) * 1200 + i * 120),
            borderColor: 'rgba(99, 102, 241, 0.8)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
          },
          {
            label: 'Benchmark',
            data: Array.from({ length: 100 }, (_, i) => 10000 + Math.sin(i * 0.08) * 600 + i * 60),
            borderColor: 'rgba(156, 163, 175, 0.8)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
          }
        ]
      },
      trades: [
        { date: '2024-03-01', type: 'BUY', price: 43250, pnl: 1250 },
        { date: '2024-03-03', type: 'SELL', price: 44500, pnl: -800 },
        { date: '2024-03-05', type: 'BUY', price: 43800, pnl: 2100 },
        { date: '2024-03-07', type: 'SELL', price: 45900, pnl: 1800 }
      ]
    };
    setBacktestResults(mockResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Signal</h1>
          <p className="text-gray-600 dark:text-gray-400">Build and backtest your trading strategies</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Save Draft
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Publish Signal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'strategy'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Strategy Builder
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backtest'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Backtest Results
          </button>
        </nav>
      </div>

      {activeTab === 'strategy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strategy Configuration */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Strategy Name
                  </label>
                  <input
                    type="text"
                    value={strategyConfig.name}
                    onChange={(e) => handleStrategyChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter strategy name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={strategyConfig.description}
                    onChange={(e) => handleStrategyChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your strategy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={strategyConfig.timeframe}
                    onChange={(e) => handleStrategyChange('timeframe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {timeframes.map(tf => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAssets.map(asset => (
                      <label key={asset} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={strategyConfig.assets.includes(asset)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleStrategyChange('assets', [...strategyConfig.assets, asset]);
                            } else {
                              handleStrategyChange('assets', strategyConfig.assets.filter(a => a !== asset));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{asset}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Management</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stop Loss (%)
                  </label>
                  <input
                    type="number"
                    value={strategyConfig.riskManagement.stopLoss}
                    onChange={(e) => handleRiskManagementChange('stopLoss', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Take Profit (%)
                  </label>
                  <input
                    type="number"
                    value={strategyConfig.riskManagement.takeProfit}
                    onChange={(e) => handleRiskManagementChange('takeProfit', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position Size (%)
                  </label>
                  <input
                    type="number"
                    value={strategyConfig.riskManagement.positionSize}
                    onChange={(e) => handleRiskManagementChange('positionSize', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strategy Preview</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{strategyConfig.name || 'Untitled Strategy'}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {strategyConfig.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeframe</div>
                    <div className="text-sm text-gray-900 dark:text-white">{strategyConfig.timeframe}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assets</div>
                    <div className="text-sm text-gray-900 dark:text-white">{strategyConfig.assets.length} selected</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={runBacktest}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Run Backtest
                  </button>
                </div>
              </div>
            </div>

            {backtestResults && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(backtestResults.performance.winRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Factor</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {backtestResults.performance.profitFactor.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="h-48">
                  <PerformanceChart
                    data={backtestResults.chartData}
                    height="100%"
                    showLegend={true}
                    showTooltip={true}
                    showGrid={true}
                    showAxes={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'backtest' && backtestResults && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Backtest Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(backtestResults.performance.winRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Factor</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {backtestResults.performance.profitFactor.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {backtestResults.performance.totalTrades}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {backtestResults.performance.sharpeRatio.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="h-64 mb-6">
              <PerformanceChart
                data={backtestResults.chartData}
                height="100%"
                showLegend={true}
                showTooltip={true}
                showGrid={true}
                showAxes={true}
              />
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Recent Trades</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {backtestResults.trades.map((trade, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{trade.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            trade.type === 'BUY' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${trade.price.toLocaleString()}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 