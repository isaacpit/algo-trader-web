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

export const MinimalLayout = ({ data, selectedChart }) => {
  const renderChart = (chartData, chartType) => {
    if (selectedChart !== 'all' && selectedChart !== chartType) {
      return null;
    }

    return (
      <div className="h-[250px]">
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
    <div className="bg-gray-900 rounded-lg p-3">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-white text-sm font-medium">Minimal View</div>
        <div className="flex space-x-1">
          <button className="px-2 py-0.5 bg-gray-800/30 text-gray-300 text-xs rounded hover:bg-gray-800/50">
            1D
          </button>
          <button className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded">
            1W
          </button>
          <button className="px-2 py-0.5 bg-gray-800/30 text-gray-300 text-xs rounded hover:bg-gray-800/50">
            1M
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-4 gap-2">
        {/* Performance Metrics */}
        <div className="col-span-1 space-y-2">
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400 text-xs">Total Return</div>
            <div className="text-white text-sm">+156.8%</div>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400 text-xs">Sharpe Ratio</div>
            <div className="text-white text-sm">2.4</div>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400 text-xs">Max Drawdown</div>
            <div className="text-red-400 text-sm">-12.3%</div>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400 text-xs">Win Rate</div>
            <div className="text-white text-sm">68.5%</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="col-span-2 bg-gray-800/30 rounded p-2">
          {renderChart(data.chartData, 'strategy')}
        </div>

        {/* Side Panel */}
        <div className="col-span-1 space-y-2">
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
  );
}; 