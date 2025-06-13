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
        const points = overlay.points.map(index => {
          const meta = chart.getDatasetMeta(0);
          return {
            x: meta.data[index].x,
            y: meta.data[index].y
          };
        });

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = overlay.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label if provided
        if (overlay.label) {
          const lastPoint = points[points.length - 1];
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '10px sans-serif';
          ctx.fillText(overlay.label, lastPoint.x + 5, lastPoint.y - 5);
        }
      } else if (overlay.type === 'highlight') {
        const meta = chart.getDatasetMeta(0);
        const startX = meta.data[overlay.start].x;
        const endX = meta.data[overlay.end].x;
        const yAxis = chart.scales.y;
        
        ctx.fillStyle = overlay.color;
        ctx.fillRect(startX, yAxis.top, endX - startX, yAxis.bottom - yAxis.top);

        // Draw label and outcome if provided
        if (overlay.label || overlay.outcome) {
          const midX = (startX + endX) / 2;
          const y = yAxis.top + 15;
          
          if (overlay.label) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(overlay.label, midX, y);
          }
          
          if (overlay.outcome) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '9px sans-serif';
            ctx.fillText(overlay.outcome, midX, y + 15);
          }
        }
      } else if (overlay.type === 'channel') {
        const meta = chart.getDatasetMeta(0);
        const startX = meta.data[overlay.top[0]].x;
        const endX = meta.data[overlay.top[1]].x;
        const yAxis = chart.scales.y;
        
        // Draw channel
        ctx.fillStyle = overlay.color;
        ctx.fillRect(startX, yAxis.top, endX - startX, yAxis.bottom - yAxis.top);

        // Draw label if provided
        if (overlay.label) {
          const midX = (startX + endX) / 2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(overlay.label, midX, yAxis.top + 15);
        }
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

export const GridLayout = ({ data, selectedChart }) => {
  const renderChart = (chartData, chartType) => {
    if (selectedChart !== chartType) {
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
          <div className="text-gray-400 text-xs ml-3">Grid Analysis</div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Main Chart */}
          <div className="col-span-2 bg-gray-800/30 rounded p-2">
            <div className="text-white text-xs font-medium mb-2">Price Action</div>
            {renderChart(data.chartData, 'strategy')}
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
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

          {/* Additional Charts */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">RSI</div>
              {renderChart(data.rsiData, 'rsi')}
            </div>
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Volume</div>
              {renderChart(data.volumeData, 'volume')}
            </div>
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">MACD</div>
              {renderChart(data.macdData, 'macd')}
            </div>
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-white text-xs font-medium mb-2">Risk</div>
              {renderChart(data.riskData, 'risk')}
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}; 