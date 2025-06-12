import React from 'react';
import { Line } from 'react-chartjs-2';

const CommandCenterLayout = ({ data }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      {/* Laptop Top Bar */}
      <div className="h-8 bg-gray-800 flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-sm ml-4">Trading Command Center</div>
      </div>
      
      {/* Laptop Screen Content */}
      <div className="relative aspect-[16/10] bg-gray-900 p-4">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Main Chart Panel */}
          <div className="col-span-8 bg-gray-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-400 text-sm">Strategy Performance</div>
              <div className="flex space-x-2">
                <button className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded">1D</button>
                <button className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">1W</button>
                <button className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">1M</button>
                <button className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">1Y</button>
              </div>
            </div>
            <div className="h-[calc(100%-2.5rem)]">
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

          {/* Control Panel */}
          <div className="col-span-4 space-y-4">
            {/* Strategy Controls */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-3">Strategy Controls</div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Position Size</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">100%</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Entry Threshold</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">0.75</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Exit Threshold</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">0.25</div>
                </div>
                <button className="w-full bg-indigo-500/20 text-indigo-300 text-xs py-2 rounded hover:bg-indigo-500/30 transition-colors">
                  Update Parameters
                </button>
              </div>
            </div>

            {/* Active Signals */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-3">Active Signals</div>
              <div className="space-y-2">
                <div className="bg-green-500/10 rounded p-2">
                  <div className="text-green-300 text-xs">BUY SIGNAL</div>
                  <div className="text-white text-sm">BTC/USD</div>
                  <div className="text-gray-400 text-xs">Strength: 0.85</div>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <div className="text-red-300 text-xs">SELL SIGNAL</div>
                  <div className="text-white text-sm">ETH/USD</div>
                  <div className="text-gray-400 text-xs">Strength: 0.92</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panels */}
          <div className="col-span-4 bg-gray-800/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Volume Analysis</div>
            <div className="h-[calc(100%-2rem)]">
              <Line
                data={data.volumeData}
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

          <div className="col-span-4 bg-gray-800/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Risk Metrics</div>
            <div className="h-[calc(100%-2rem)]">
              <Line
                data={data.riskData}
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

          <div className="col-span-4 bg-gray-800/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Performance Metrics</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-indigo-500/10 rounded p-2">
                <div className="text-indigo-300 text-xs">ALPHA</div>
                <div className="text-white text-lg">+0.24</div>
              </div>
              <div className="bg-blue-500/10 rounded p-2">
                <div className="text-blue-300 text-xs">BETA</div>
                <div className="text-white text-lg">0.82</div>
              </div>
              <div className="bg-purple-500/10 rounded p-2">
                <div className="text-purple-300 text-xs">SHARPE</div>
                <div className="text-white text-lg">2.1</div>
              </div>
              <div className="bg-green-500/10 rounded p-2">
                <div className="text-green-300 text-xs">WIN RATE</div>
                <div className="text-white text-lg">68.5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterLayout; 