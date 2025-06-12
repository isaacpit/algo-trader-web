import React from 'react';
import { Line } from 'react-chartjs-2';

export const TechnicalLayout = ({ data }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      {/* Laptop Top Bar */}
      <div className="h-8 bg-gray-800 flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-sm ml-4">Technical Analysis Dashboard</div>
      </div>
      
      {/* Laptop Screen Content */}
      <div className="relative aspect-[16/10] bg-gray-900 p-3">
        <div className="grid grid-cols-12 gap-2 h-full">
          {/* Main Price Chart */}
          <div className="col-span-8 bg-gray-800/30 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-400 text-sm">BTC/USD</div>
              <div className="flex space-x-1">
                <button className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded">1D</button>
                <button className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded">1W</button>
                <button className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded">1M</button>
                <button className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded">1Y</button>
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

          {/* Technical Indicators */}
          <div className="col-span-4 space-y-2">
            <div className="bg-gray-800/30 rounded-lg p-2">
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

            <div className="bg-gray-800/30 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">MACD (12,26,9)</div>
              <div className="h-[calc(100%-2rem)]">
                <Line
                  data={{
                    ...data.macdData,
                    datasets: [
                      ...data.macdData.datasets,
                      {
                        label: 'Signal Line',
                        data: data.macdData.datasets[0].data.map(d => d * 0.8),
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
          </div>

          {/* Support/Resistance Levels */}
          <div className="col-span-4 bg-gray-800/30 rounded-lg p-2">
            <div className="text-gray-400 text-xs mb-1">Support/Resistance</div>
            <div className="space-y-1">
              <div className="bg-red-500/10 rounded p-1">
                <div className="text-red-300 text-xs">RESISTANCE 1</div>
                <div className="text-white text-sm">$45,200</div>
                <div className="text-gray-400 text-xs">Strong</div>
              </div>
              <div className="bg-green-500/10 rounded p-1">
                <div className="text-green-300 text-xs">SUPPORT 1</div>
                <div className="text-white text-sm">$42,800</div>
                <div className="text-gray-400 text-xs">Strong</div>
              </div>
              <div className="bg-blue-500/10 rounded p-1">
                <div className="text-blue-300 text-xs">PIVOT POINT</div>
                <div className="text-white text-sm">$44,000</div>
                <div className="text-gray-400 text-xs">Current</div>
              </div>
            </div>
          </div>

          {/* Trading Signals */}
          <div className="col-span-4 bg-gray-800/30 rounded-lg p-2">
            <div className="text-gray-400 text-xs mb-1">Trading Signals</div>
            <div className="space-y-1">
              <div className="bg-green-500/10 rounded p-1">
                <div className="text-green-300 text-xs">BUY SIGNAL</div>
                <div className="text-white text-sm">RSI Oversold</div>
                <div className="text-gray-400 text-xs">Strength: 0.85</div>
              </div>
              <div className="bg-blue-500/10 rounded p-1">
                <div className="text-blue-300 text-xs">MACD CROSS</div>
                <div className="text-white text-sm">Bullish Crossover</div>
                <div className="text-gray-400 text-xs">Strength: 0.75</div>
              </div>
              <div className="bg-purple-500/10 rounded p-1">
                <div className="text-purple-300 text-xs">VOLUME SPIKE</div>
                <div className="text-white text-sm">Above Average</div>
                <div className="text-gray-400 text-xs">Strength: 0.65</div>
              </div>
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
        </div>
      </div>
    </div>
  );
}; 