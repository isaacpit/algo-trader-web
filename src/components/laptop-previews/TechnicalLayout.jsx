import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom overlay plugin for trendlines, highlights, and channels
const overlayPlugin = {
  id: 'overlay',
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const overlays = chart.options.plugins.overlay.overlays;

    overlays.forEach(overlay => {
      if (overlay.type === 'trendline') {
        ctx.beginPath();
        ctx.strokeStyle = overlay.color;
        ctx.lineWidth = 2;
        ctx.moveTo(
          chart.scales.x.getPixelForValue(overlay.points[0]),
          chart.scales.y.getPixelForValue(overlay.points[1])
        );
        ctx.lineTo(
          chart.scales.x.getPixelForValue(overlay.points[2]),
          chart.scales.y.getPixelForValue(overlay.points[3])
        );
        ctx.stroke();
      } else if (overlay.type === 'highlight') {
        ctx.fillStyle = overlay.color;
        ctx.fillRect(
          chart.scales.x.getPixelForValue(overlay.start),
          0,
          chart.scales.x.getPixelForValue(overlay.end) - chart.scales.x.getPixelForValue(overlay.start),
          chart.height
        );
      } else if (overlay.type === 'channel') {
        ctx.beginPath();
        ctx.strokeStyle = overlay.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(
          chart.scales.x.getPixelForValue(overlay.top[0]),
          chart.scales.y.getPixelForValue(overlay.top[1])
        );
        ctx.lineTo(
          chart.scales.x.getPixelForValue(overlay.bottom[0]),
          chart.scales.y.getPixelForValue(overlay.bottom[1])
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }
};

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(99, 102, 241, 0.5)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9CA3AF'
      }
    },
    y: {
      grid: {
        color: 'rgba(75, 85, 99, 0.2)'
      },
      ticks: {
        color: '#9CA3AF'
      }
    }
  }
};

export const TechnicalLayout = ({ data, selectedChart }) => {
  const renderChart = (chartData, chartType) => {
    if (selectedChart !== 'all' && selectedChart !== chartType) {
      return null;
    }

    return (
      <div className="h-[150px]">
        <Line
          data={chartData}
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              overlay: {
                overlays: chartData.overlays
              }
            }
          }}
          plugins={[overlayPlugin]}
        />
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25"></div>
      <div className="relative bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="h-6 bg-gray-800 flex items-center px-3">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <div className="text-gray-400 text-xs ml-3">Technical Analysis</div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Left Panel */}
          <div className="space-y-2">
            {/* Performance Metrics */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Total Return</div>
                  <div className="text-white text-xs">+156.8%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Sharpe Ratio</div>
                  <div className="text-white text-xs">2.4</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Max Drawdown</div>
                  <div className="text-red-400 text-xs">-12.3%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Win Rate</div>
                  <div className="text-white text-xs">68.5%</div>
                </div>
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Technical Indicators</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">RSI (14)</div>
                  <div className="text-white text-xs">65.4</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">MACD</div>
                  <div className="text-green-400 text-xs">Bullish</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Bollinger Bands</div>
                  <div className="text-white text-xs">Upper</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Moving Averages</div>
                  <div className="text-green-400 text-xs">Golden Cross</div>
                </div>
              </div>
            </div>

            {/* Support/Resistance */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Support/Resistance</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Resistance 1</div>
                  <div className="text-white text-xs">$45,200</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Resistance 2</div>
                  <div className="text-white text-xs">$46,500</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Support 1</div>
                  <div className="text-white text-xs">$42,800</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Support 2</div>
                  <div className="text-white text-xs">$41,500</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel */}
          <div className="col-span-2 space-y-2">
            {/* Main Chart */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Price Action</div>
              {renderChart(data.chartData, 'strategy')}
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800/30 rounded p-2">
                <div className="text-white text-xs font-medium mb-2">RSI</div>
                {renderChart(data.rsiData, 'rsi')}
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <div className="text-white text-xs font-medium mb-2">MACD</div>
                {renderChart(data.macdData, 'macd')}
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <div className="text-white text-xs font-medium mb-2">Volume</div>
                {renderChart(data.volumeData, 'volume')}
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <div className="text-white text-xs font-medium mb-2">Risk</div>
                {renderChart(data.riskData, 'risk')}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-2">
            {/* Recent Trades */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Recent Trades</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-green-400 text-xs">BTC/USD</div>
                  <div className="text-white text-xs">+2.4%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-red-400 text-xs">ETH/USD</div>
                  <div className="text-white text-xs">-1.2%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-green-400 text-xs">SOL/USD</div>
                  <div className="text-white text-xs">+5.6%</div>
                </div>
              </div>
            </div>

            {/* Trading Signals */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Trading Signals</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="text-green-400 text-xs">RSI Oversold</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="text-green-400 text-xs">MACD Crossover</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="text-red-400 text-xs">Bollinger Upper</div>
                </div>
              </div>
            </div>

            {/* Strategy Status */}
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Strategy Status</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Active Trades</div>
                  <div className="text-white text-xs">3</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Open Positions</div>
                  <div className="text-white text-xs">$24,500</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Daily P&L</div>
                  <div className="text-green-400 text-xs">+$1,240</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 