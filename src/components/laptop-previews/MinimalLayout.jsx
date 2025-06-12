import React from 'react';
import { Line } from 'react-chartjs-2';

const MinimalLayout = ({ data }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      {/* Laptop Top Bar */}
      <div className="h-8 bg-gray-800 flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-sm ml-4">Strategy Overview</div>
      </div>
      
      {/* Laptop Screen Content */}
      <div className="relative aspect-[16/10] bg-gray-900 p-4">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Top Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">PERFORMANCE</div>
                <div className="text-white text-xl">+24.8%</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">WIN RATE</div>
                <div className="text-white text-xl">68.5%</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">SHARPE</div>
                <div className="text-white text-xl">2.1</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">TRADES</div>
                <div className="text-white text-xl">142</div>
              </div>
            </div>

            {/* Main Chart */}
            <div className="flex-1 bg-gray-800/30 rounded-lg p-4">
              <Line
                data={data.chartData}
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

          {/* Side Panel */}
          <div className="w-64 ml-4 flex flex-col">
            {/* Recent Trades */}
            <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
              <div className="text-gray-400 text-sm mb-3">Recent Trades</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white text-sm">BTC/USD</div>
                    <div className="text-gray-400 text-xs">2 hours ago</div>
                  </div>
                  <div className="text-green-400 text-sm">+1.2%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white text-sm">ETH/USD</div>
                    <div className="text-gray-400 text-xs">4 hours ago</div>
                  </div>
                  <div className="text-red-400 text-sm">-0.8%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white text-sm">SOL/USD</div>
                    <div className="text-gray-400 text-xs">6 hours ago</div>
                  </div>
                  <div className="text-green-400 text-sm">+2.1%</div>
                </div>
              </div>
            </div>

            {/* Strategy Status */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-3">Strategy Status</div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Current Position</div>
                  <div className="text-white text-sm">Long BTC/USD</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Entry Price</div>
                  <div className="text-white text-sm">$42,350.00</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Stop Loss</div>
                  <div className="text-white text-sm">$41,500.00</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Take Profit</div>
                  <div className="text-white text-sm">$43,500.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalLayout; 