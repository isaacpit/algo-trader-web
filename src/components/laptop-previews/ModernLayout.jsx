import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

// Static chart data with highly volatile, irregular movements
const defaultChartData = {
  labels: Array(50).fill(''),
  datasets: [
    {
      label: 'Strategy',
      data: [
        100, 97, 103, 99, 107, 102, 110, 105, 113, 108,
        116, 111, 119, 114, 122, 117, 125, 120, 128, 123,
        131, 126, 134, 129, 137, 132, 140, 135, 143, 138,
        146, 141, 149, 144, 152, 147, 155, 150, 158, 153,
        161, 156, 164, 159, 167, 162, 170, 165, 173, 168
      ],
      borderColor: 'rgba(99,102,241,0.8)',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Market',
      data: [
        100, 98, 101, 99, 102, 100, 103, 101, 104, 102,
        105, 103, 106, 104, 107, 105, 108, 106, 109, 107,
        110, 108, 111, 109, 112, 110, 113, 111, 114, 112,
        115, 113, 116, 114, 117, 115, 118, 116, 119, 117,
        120, 118, 121, 119, 122, 120, 123, 121, 124, 122
      ],
      borderColor: 'rgba(156,163,175,0.5)',
      backgroundColor: 'rgba(156,163,175,0.05)',
      fill: true,
      tension: 0.1,
      borderDash: [5, 5]
    }
  ]
};

// Define trades with exact price points and profits
const trades = [
  {
    entry: { x: 5, price: 102, time: '09:32' },
    exit: { x: 12, price: 113, time: '10:15' },
    profit: 120,
    type: 'win'
  },
  {
    entry: { x: 18, price: 119, time: '10:45' },
    exit: { x: 25, price: 129, time: '11:20' },
    profit: 200,
    type: 'win'
  },
  {
    entry: { x: 32, price: 134, time: '12:05' },
    exit: { x: 38, price: 143, time: '13:00' },
    profit: 180,
    type: 'win'
  }
];

const tradeLog = [
  { symbol: 'AAPL 150C', entry: '09:32', exit: '10:15', profit: 120 },
  { symbol: 'TSLA 700P', entry: '10:45', exit: '11:20', profit: -60 },
  { symbol: 'NVDA 400C', entry: '12:05', exit: '13:00', profit: 200 },
];

export const ModernLayout = ({ data = {} }) => {
  const chartData = data?.chartData || defaultChartData;
  
  const rsiData = data?.rsiData || {
    labels: Array(20).fill(''),
    datasets: [{
      label: 'RSI',
      data: Array(20).fill(50),
      borderColor: 'rgba(16,185,129,0.8)',
      backgroundColor: 'rgba(16,185,129,0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const volumeData = data?.volumeData || {
    labels: Array(20).fill(''),
    datasets: [{
      label: 'Volume',
      data: Array(20).fill(0),
      borderColor: 'rgba(245,158,11,0.8)',
      backgroundColor: 'rgba(245,158,11,0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(156,163,175,0.8)',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4 },
    },
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      <div className="relative aspect-[16/10] bg-gray-900 p-3">
        <div className="grid grid-cols-12 gap-2 h-full">
          {/* Strategy Controls - Reduced height with new features */}
          <div className="col-span-2 flex flex-col">
            {/* Main Controls - Quarter height */}
            <div className="bg-gray-800/20 rounded-lg p-1.5 mb-2">
              <div className="space-y-1">
                <div className="bg-indigo-500/5 rounded p-1 border border-indigo-500/10 group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                  <div className="text-indigo-200/70 text-xs">Asset</div>
                  <div className="text-white text-sm">BTC/USD</div>
                </div>
                <div className="bg-blue-500/5 rounded p-1 border border-blue-500/10 group cursor-pointer hover:bg-blue-500/10 transition-colors">
                  <div className="text-blue-200/70 text-xs">Timeframe</div>
                  <div className="text-white text-sm">1H</div>
                </div>
                <div className="bg-purple-500/5 rounded p-1 border border-purple-500/10 group cursor-pointer hover:bg-purple-500/10 transition-colors">
                  <div className="text-purple-200/70 text-xs">Strategy</div>
                  <div className="text-white text-sm">Trend Following</div>
                </div>
              </div>
            </div>

            {/* New Selectable Features */}
            <div className="bg-gray-800/20 rounded-lg p-1.5 mb-2">
              <div className="text-gray-400 text-xs mb-1">Quick Actions</div>
              <div className="space-y-1">
                <div className="bg-green-500/5 rounded p-1 border border-green-500/10 group cursor-pointer hover:bg-green-500/10 transition-colors">
                  <div className="text-green-200/70 text-xs">New Trade</div>
                  <div className="text-white text-sm">+ Add Position</div>
                </div>
                <div className="bg-yellow-500/5 rounded p-1 border border-yellow-500/10 group cursor-pointer hover:bg-yellow-500/10 transition-colors">
                  <div className="text-yellow-200/70 text-xs">Risk Level</div>
                  <div className="text-white text-sm">Moderate</div>
                </div>
                <div className="bg-red-500/5 rounded p-1 border border-red-500/10 group cursor-pointer hover:bg-red-500/10 transition-colors">
                  <div className="text-red-200/70 text-xs">Stop Loss</div>
                  <div className="text-white text-sm">-2.5%</div>
                </div>
              </div>
            </div>

            {/* Strategy Settings */}
            <div className="bg-gray-800/20 rounded-lg p-1.5">
              <div className="text-gray-400 text-xs mb-1">Settings</div>
              <div className="space-y-1">
                <div className="bg-blue-500/5 rounded p-1 border border-blue-500/10 group cursor-pointer hover:bg-blue-500/10 transition-colors">
                  <div className="text-blue-200/70 text-xs">Notifications</div>
                  <div className="text-white text-sm">Enabled</div>
                </div>
                <div className="bg-purple-500/5 rounded p-1 border border-purple-500/10 group cursor-pointer hover:bg-purple-500/10 transition-colors">
                  <div className="text-purple-200/70 text-xs">Auto Close</div>
                  <div className="text-white text-sm">Take Profit</div>
                </div>
                <div className="bg-indigo-500/5 rounded p-1 border border-indigo-500/10 group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                  <div className="text-indigo-200/70 text-xs">Backtest</div>
                  <div className="text-white text-sm">Last 30 Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart and Signals */}
          <div className="col-span-10 bg-gray-800/20 rounded-lg p-2 flex flex-col">
            {/* Chart Header - Ultra compact */}
            <div className="flex justify-between items-center mb-0.5">
              <div className="text-gray-400 text-sm">Strategy Performance</div>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-0.5">
                  {['1D', '1W', '1M', '1Y'].map((tf, index) => (
                    <div
                      key={tf}
                      className={`px-1 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                        index === 0
                          ? 'bg-indigo-500/10 text-indigo-200/80 border border-indigo-500/10'
                          : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      {tf}
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-green-500/10 rounded-full border border-green-500/10 relative cursor-pointer">
                    <div className="absolute right-[1px] top-[1px] w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="ml-1 text-xs text-gray-400">Auto</span>
                </div>
              </div>
            </div>

            {/* Main Chart with Overlays - Increased height to 2/3 */}
            <div className="relative h-[calc(100%-4rem)] mb-0.5">
              <Line
                data={chartData}
                options={lineChartOptions}
              />
              {/* Trade Connection Lines */}
              {trades.map((trade, index) => (
                <div
                  key={index}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, 
                      transparent ${(trade.entry.x / 50) * 100}%, 
                      rgba(99, 102, 241, 0.2) ${(trade.entry.x / 50) * 100}%, 
                      rgba(99, 102, 241, 0.2) ${(trade.exit.x / 50) * 100}%, 
                      transparent ${(trade.exit.x / 50) * 100}%)`
                  }}
                />
              ))}
            </div>

            {/* Metric Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-1">
              <div className="bg-green-500/5 rounded-lg p-1 border border-green-500/10 group cursor-pointer hover:bg-green-500/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-green-200/70 text-xs">RSI</div>
                  <div className="text-green-200/70 text-xs">↑ 2.1</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-white text-sm">65.4</div>
                  <div className="h-0.5 w-12 bg-gray-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/30 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/5 rounded-lg p-1 border border-blue-500/10 group cursor-pointer hover:bg-blue-500/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-blue-200/70 text-xs">MACD</div>
                  <div className="text-green-200/70 text-xs">↑ 0.12</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-white text-sm">0.85</div>
                  <div className="h-0.5 w-12 bg-gray-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/30 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-500/5 rounded-lg p-1 border border-yellow-500/10 group cursor-pointer hover:bg-yellow-500/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-yellow-200/70 text-xs">Volume</div>
                  <div className="text-red-200/70 text-xs">↓ 0.3M</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-white text-sm">1.2M</div>
                  <div className="h-0.5 w-12 bg-gray-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500/30 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-purple-500/5 rounded-lg p-1 border border-purple-500/10 group cursor-pointer hover:bg-purple-500/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-purple-200/70 text-xs">Volatility</div>
                  <div className="text-green-200/70 text-xs">↓ 0.5%</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-white text-sm">2.4%</div>
                  <div className="h-0.5 w-12 bg-gray-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500/30 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Signals */}
            <div className="grid grid-cols-2 gap-2 mb-1">
              <div className="bg-green-500/5 rounded-lg p-1 border border-green-500/10 group cursor-pointer hover:bg-green-500/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-green-200/70 text-xs font-medium">BUY SIGNAL</div>
                  <div className="text-green-200/70 text-xs">0.85</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-white text-sm">RSI Oversold</div>
                  <div className="h-0.5 w-16 bg-gray-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/30 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/5 rounded-lg p-1 border border-blue-500/10 group cursor-pointer hover:bg-blue-500/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-blue-200/70 text-xs font-medium">MACD CROSS</div>
                  <div className="text-blue-200/70 text-xs">0.75</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-white text-sm">Bullish Crossover</div>
                  <div className="h-0.5 w-16 bg-gray-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/30 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Log */}
            <div className="bg-gray-800/30 rounded-lg p-1.5">
              <div className="text-gray-400 text-xs mb-1">Recent Trades</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-white">BTC/USD</div>
                  </div>
                  <div className="text-green-200/70">+2.4%</div>
                  <div className="text-gray-400">2h ago</div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="text-white">ETH/USD</div>
                  </div>
                  <div className="text-red-200/70">-1.2%</div>
                  <div className="text-gray-400">4h ago</div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-white">SOL/USD</div>
                  </div>
                  <div className="text-green-200/70">+3.8%</div>
                  <div className="text-gray-400">6h ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 