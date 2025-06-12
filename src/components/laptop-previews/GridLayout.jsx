import React from 'react';
import { Line } from 'react-chartjs-2';

export const GridLayout = ({ data }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      {/* Laptop Top Bar */}
      <div className="h-8 bg-gray-800 flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-sm ml-4">Strategy Performance Dashboard</div>
      </div>
      
      {/* Laptop Screen Content */}
      <div className="relative aspect-[16/10] bg-gray-900 p-3">
        <div className="grid grid-cols-12 gap-2 h-full">
          {/* Strategy Controls */}
          <div className="col-span-12 bg-gray-800/30 rounded-lg p-2">
            <div className="grid grid-cols-6 gap-2">
              <div>
                <div className="text-gray-400 text-xs mb-1">Asset</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    BTC/USD
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Time Frame</div>
                <div className="flex space-x-1">
                  {['1D', '4H', '1H', '15m'].map((tf, index) => (
                    <div
                      key={tf}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${
                        index === 0
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                          : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      {tf}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Strategy</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    Trend Following
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Position Size</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    0.1 BTC
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    BTC
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Entry Type</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    Market
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Risk/Reward</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    1:2
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    Ratio
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Strategy Chart */}
          <div className="col-span-8 bg-gray-800/30 rounded-lg p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-400 text-sm">Strategy Performance</div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {['1D', '1W', '1M', '1Y'].map((tf, index) => (
                    <div
                      key={tf}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        index === 0
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                          : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      {tf}
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <div className="w-9 h-5 bg-green-500/20 rounded-full border border-green-500/50 relative">
                    <div className="absolute right-[2px] top-[2px] w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-400">Auto Trade</span>
                </div>
              </div>
            </div>
            <div className="h-[calc(100%-2rem)]">
              <Line
                data={{
                  ...data.chartData,
                  datasets: [
                    ...data.chartData.datasets,
                    {
                      label: 'Market Average',
                      data: data.benchmarkData,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: 'Previous Period',
                      data: data.chartData.datasets[0].data.map(d => d * 0.9),
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderDash: [5, 5],
                      fill: false,
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  elements: {
                    point: { radius: 0 },
                    line: { tension: 0.4 },
                  },
                }}
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="col-span-4 space-y-2">
            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">ALPHA</div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-green-400 text-lg">+2.4%</div>
                <div className="text-gray-500 text-xs">vs Market +1.2%</div>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-green-500/50 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">BETA</div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-lg">0.85</div>
                <div className="text-gray-500 text-xs">Lower than Market 1.0</div>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/50 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">SHARPE</div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-lg">1.8</div>
                <div className="text-gray-500 text-xs">vs Market 1.2</div>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/50 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="col-span-4 space-y-2">
            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">MAX DRAWDOWN</div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-red-400 text-lg">-12.4%</div>
                <div className="text-gray-500 text-xs">vs Market -15.8%</div>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-red-500/50 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">VOLATILITY</div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-lg">15.2%</div>
                <div className="text-gray-500 text-xs">vs Market 18.5%</div>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500/50 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">VAR (95%)</div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-lg">2.1%</div>
                <div className="text-gray-500 text-xs">vs Market 2.8%</div>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500/50 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="col-span-4 bg-gray-800/30 rounded-lg p-2">
            <div className="text-gray-400 text-xs mb-1">RSI (14)</div>
            <div className="h-[calc(100%-2rem)]">
              <Line
                data={{
                  ...data.rsiData,
                  datasets: [
                    ...data.rsiData.datasets,
                    {
                      label: 'Overbought',
                      data: Array(50).fill(70),
                      borderColor: 'rgba(255, 0, 0, 0.2)',
                      borderDash: [5, 5],
                      fill: false,
                      tension: 0
                    },
                    {
                      label: 'Oversold',
                      data: Array(50).fill(30),
                      borderColor: 'rgba(0, 255, 0, 0.2)',
                      borderDash: [5, 5],
                      fill: false,
                      tension: 0
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  elements: {
                    point: { radius: 0 },
                    line: { tension: 0.4 },
                  },
                }}
              />
            </div>
          </div>

          {/* Volume Analysis */}
          <div className="col-span-4 bg-gray-800/30 rounded-lg p-2">
            <div className="text-gray-400 text-xs mb-1">Volume Analysis</div>
            <div className="h-[calc(100%-2rem)]">
              <Line
                data={{
                  ...data.volumeData,
                  datasets: [
                    ...data.volumeData.datasets,
                    {
                      label: 'Average Volume',
                      data: data.volumeData.datasets[0].data.map(d => d * 0.7),
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderDash: [5, 5],
                      fill: false,
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  elements: {
                    point: { radius: 0 },
                    line: { tension: 0.4 },
                  },
                }}
              />
            </div>
          </div>

          {/* Active Signals */}
          <div className="col-span-4 bg-gray-800/30 rounded-lg p-2">
            <div className="text-gray-400 text-xs mb-1">Active Signals</div>
            <div className="space-y-2">
              <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                <div className="flex justify-between items-center">
                  <div className="text-green-300 text-xs font-medium">BUY SIGNAL</div>
                  <div className="text-green-400 text-xs">0.85</div>
                </div>
                <div className="text-white text-sm mt-1">RSI Oversold</div>
                <div className="flex items-center mt-1">
                  <div className="w-full h-1 bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/50 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                <div className="flex justify-between items-center">
                  <div className="text-blue-300 text-xs font-medium">MACD CROSS</div>
                  <div className="text-blue-400 text-xs">0.75</div>
                </div>
                <div className="text-white text-sm mt-1">Bullish Crossover</div>
                <div className="flex items-center mt-1">
                  <div className="w-full h-1 bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/50 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Parameters */}
          <div className="col-span-12 bg-gray-800/30 rounded-lg p-2">
            <div className="text-gray-400 text-sm mb-2">Strategy Parameters</div>
            <div className="grid grid-cols-6 gap-2">
              <div>
                <div className="text-gray-400 text-xs mb-1">RSI Period</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    14
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    Days
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">MACD Fast</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    12
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    Days
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">MACD Slow</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    26
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    Days
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">MACD Signal</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    9
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    Days
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Stop Loss %</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    2
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    %
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Take Profit %</div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2">
                    4
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 