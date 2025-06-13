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

// Register Chart.js components
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

export const CommandCenterLayout = ({ data }) => {
  return (
    <div className="w-[80%] mx-auto">
      {/* Apple-style window border */}
      <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
        {/* Window controls */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-3 space-y-4">
            {/* System Controls */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-gray-400 text-xs mb-2">System Status</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">CPU Load</div>
                  <div className="text-green-400 text-xs">32%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Memory</div>
                  <div className="text-green-400 text-xs">1.2GB</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Network</div>
                  <div className="text-green-400 text-xs">45ms</div>
                </div>
              </div>
            </div>

            {/* Active Strategies */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-gray-400 text-xs mb-2">Active Strategies</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Momentum</div>
                  <div className="text-green-400 text-xs">Running</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Mean Reversion</div>
                  <div className="text-yellow-400 text-xs">Paused</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Breakout</div>
                  <div className="text-red-400 text-xs">Stopped</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-gray-400 text-xs mb-2">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-indigo-500/20 text-indigo-400 text-xs py-1.5 rounded hover:bg-indigo-500/30 transition-colors">
                  Start All
                </button>
                <button className="bg-red-500/20 text-red-400 text-xs py-1.5 rounded hover:bg-red-500/30 transition-colors">
                  Stop All
                </button>
              </div>
            </div>
          </div>

          {/* Center Panel */}
          <div className="col-span-6 space-y-4">
            {/* Main Chart */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/60 text-xs">Strategy Performance</div>
                <div className="flex items-center gap-1">
                  <div className="grid grid-cols-3 gap-1 bg-gray-800/50 rounded p-0.5">
                    <button className="bg-gray-700/30 text-white/60 text-[10px] py-0.5 px-1.5 rounded hover:bg-gray-700/50 transition-colors">
                      15min
                    </button>
                    <button className="bg-indigo-500/20 text-indigo-400 text-[10px] py-0.5 px-1.5 rounded hover:bg-indigo-500/30 transition-colors">
                      1h
                    </button>
                    <button className="bg-gray-700/30 text-white/60 text-[10px] py-0.5 px-1.5 rounded hover:bg-gray-700/50 transition-colors">
                      1d
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                <Line
                  data={data}
                  options={{
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
                        titleColor: 'rgba(255, 255, 255, 0.8)',
                        bodyColor: 'rgba(255, 255, 255, 0.6)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 8,
                        displayColors: true,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)',
                          drawBorder: false
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.4)',
                          font: {
                            size: 10
                          }
                        }
                      },
                      y: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)',
                          drawBorder: false
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.4)',
                          font: {
                            size: 10
                          },
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    }
                  }}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Primary Metrics */}
              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 bg-indigo-500/10 rounded-full -mr-5 -mt-5"></div>
                <div className="text-white/20 text-[10px] font-mono mb-0.5">PERF</div>
                <div className="text-white/40 text-xs font-mono">+24.8%</div>
                <div className="text-white/20 text-[10px] font-mono mt-1">YTD</div>
                <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-1</div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 bg-blue-500/10 rounded-full -mr-5 -mt-5"></div>
                <div className="text-white/20 text-[10px] font-mono mb-0.5">VOL</div>
                <div className="text-white/40 text-xs font-mono">1.2M</div>
                <div className="text-white/20 text-[10px] font-mono mt-1">24H</div>
                <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-2</div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 bg-purple-500/10 rounded-full -mr-5 -mt-5"></div>
                <div className="text-white/20 text-[10px] font-mono mb-0.5">SIG</div>
                <div className="text-white/40 text-xs font-mono">0.78</div>
                <div className="text-white/20 text-[10px] font-mono mt-1">STR</div>
                <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-3</div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 bg-pink-500/10 rounded-full -mr-5 -mt-5"></div>
                <div className="text-white/20 text-[10px] font-mono mb-0.5">RISK</div>
                <div className="text-white/40 text-xs font-mono">0.32</div>
                <div className="text-white/20 text-[10px] font-mono mt-1">BETA</div>
                <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-4</div>
              </div>

              {/* Secondary Metrics */}
              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Win Rate</div>
                  <div className="text-green-400 text-xs">68.5%</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500/30 rounded-full" style={{ width: '68.5%' }}></div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Sharpe</div>
                  <div className="text-indigo-400 text-xs">2.4</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/30 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Drawdown</div>
                  <div className="text-red-400 text-xs">-12.3%</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500/30 rounded-full" style={{ width: '12.3%' }}></div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">Alpha</div>
                  <div className="text-blue-400 text-xs">+0.15</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500/30 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 space-y-4">
            {/* Recent Alerts */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-gray-400 text-xs mb-2">Recent Alerts</div>
              <div className="space-y-2">
                <div className="text-white/60 text-xs">Strategy started: Momentum</div>
                <div className="text-white/60 text-xs">New signal detected</div>
                <div className="text-white/60 text-xs">Position opened: AAPL</div>
              </div>
            </div>

            {/* System Logs */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-gray-400 text-xs mb-2">System Logs</div>
              <div className="space-y-1">
                <div className="text-white/40 text-[10px] font-mono">[10:15:23] Initializing...</div>
                <div className="text-white/40 text-[10px] font-mono">[10:15:24] Loading data...</div>
                <div className="text-white/40 text-[10px] font-mono">[10:15:25] Ready</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-gray-400 text-xs mb-2">Quick Stats</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Win Rate</div>
                  <div className="text-green-400 text-xs">68.5%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Sharpe</div>
                  <div className="text-indigo-400 text-xs">2.4</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-xs">Drawdown</div>
                  <div className="text-red-400 text-xs">-12.3%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 