import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "../../context/ThemeContext";

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

// Static chart data with highly volatile, irregular movements
const defaultChartData = {
  labels: Array(50).fill(""),
  datasets: [
    {
      label: "Strategy",
      data: [
        100, 97, 103, 99, 107, 102, 110, 105, 113, 108, 116, 111, 119, 114, 122,
        117, 125, 120, 128, 123, 131, 126, 134, 129, 137, 132, 140, 135, 143,
        138, 146, 141, 149, 144, 152, 147, 155, 150, 158, 153, 161, 156, 164,
        159, 167, 162, 170, 165, 173, 168,
      ],
      borderColor: "rgba(99,102,241,0.8)",
      backgroundColor: "rgba(99,102,241,0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Market",
      data: [
        100, 98, 101, 99, 102, 100, 103, 101, 104, 102, 105, 103, 106, 104, 107,
        105, 108, 106, 109, 107, 110, 108, 111, 109, 112, 110, 113, 111, 114,
        112, 115, 113, 116, 114, 117, 115, 118, 116, 119, 117, 120, 118, 121,
        119, 122, 120, 123, 121, 124, 122,
      ],
      borderColor: "rgba(156,163,175,0.5)",
      backgroundColor: "rgba(156,163,175,0.05)",
      fill: true,
      tension: 0.1,
      borderDash: [5, 5],
    },
  ],
};

// Define trades with exact price points and profits
const trades = [
  {
    entry: { x: 5, price: 102, time: "09:32" },
    exit: { x: 12, price: 113, time: "10:15" },
    profit: 120,
    type: "win",
  },
  {
    entry: { x: 18, price: 119, time: "10:45" },
    exit: { x: 25, price: 129, time: "11:20" },
    profit: 200,
    type: "win",
  },
  {
    entry: { x: 32, price: 134, time: "12:05" },
    exit: { x: 38, price: 143, time: "13:00" },
    profit: 180,
    type: "win",
  },
];

const tradeLog = [
  { symbol: "AAPL 150C", entry: "09:32", exit: "10:15", profit: 120 },
  { symbol: "TSLA 700P", entry: "10:45", exit: "11:20", profit: -60 },
  { symbol: "NVDA 400C", entry: "12:05", exit: "13:00", profit: 200 },
];

// Custom overlay plugin for trendlines, highlights, and channels
const overlayPlugin = {
  id: "overlay",
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const overlays = chart.options.plugins.overlay.overlays;

    overlays.forEach((overlay) => {
      if (overlay.type === "trendline") {
        const points = overlay.points.map((index) => {
          const meta = chart.getDatasetMeta(0);
          return {
            x: meta.data[index].x,
            y: meta.data[index].y,
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
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.font = "10px sans-serif";
          ctx.fillText(overlay.label, lastPoint.x + 5, lastPoint.y - 5);
        }
      } else if (overlay.type === "highlight") {
        const meta = chart.getDatasetMeta(0);
        const startX = meta.data[overlay.start].x;
        const endX = meta.data[overlay.end].x;
        const yAxis = chart.scales.y;

        ctx.fillStyle = overlay.color;
        ctx.fillRect(
          startX,
          yAxis.top,
          endX - startX,
          yAxis.bottom - yAxis.top
        );

        // Draw label and outcome if provided
        if (overlay.label || overlay.outcome) {
          const midX = (startX + endX) / 2;
          const y = yAxis.top + 15;

          if (overlay.label) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(overlay.label, midX, y);
          }

          if (overlay.outcome) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.font = "9px sans-serif";
            ctx.fillText(overlay.outcome, midX, y + 15);
          }
        }
      } else if (overlay.type === "channel") {
        const meta = chart.getDatasetMeta(0);
        const startX = meta.data[overlay.top[0]].x;
        const endX = meta.data[overlay.top[1]].x;
        const yAxis = chart.scales.y;

        // Draw channel
        ctx.fillStyle = overlay.color;
        ctx.fillRect(
          startX,
          yAxis.top,
          endX - startX,
          yAxis.bottom - yAxis.top
        );

        // Draw label if provided
        if (overlay.label) {
          const midX = (startX + endX) / 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(overlay.label, midX, yAxis.top + 15);
        }
      }
    });
  },
};

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(17, 24, 39, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(99, 102, 241, 0.5)",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#9CA3AF",
      },
    },
    y: {
      grid: {
        color: "rgba(75, 85, 99, 0.2)",
      },
      ticks: {
        color: "#9CA3AF",
      },
    },
  },
};

// Generate chart data with ultra minor variations
const generateChartData = (chartType) => {
  const patterns = chartPatterns[chartType];
  const patternIndex = Math.floor(Math.random() * patterns.length);
  const pattern = patterns[patternIndex];
  const baseData = pattern.data;

  // Generate market data that follows a similar but less volatile pattern
  const marketData = baseData.map((value, i) => {
    // Market data follows the same general trend but with less volatility
    const marketValue = value * 0.8 + (Math.random() - 0.5) * 0.2;
    return Math.max(0, marketValue);
  });

  return {
    data: baseData.map((value) => {
      const variation = (Math.random() - 0.5) * 0.3;
      return Math.max(0, value + variation);
    }),
    marketData: marketData,
    overlays: pattern.overlays,
  };
};

export const ModernLayout = ({ data }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {/* Apple-style window border */}
      <div
        className={`${
          isDarkMode ? "bg-gray-900/50" : "bg-white/90"
        } rounded-xl p-4 border ${
          isDarkMode ? "border-white/5" : "border-gray-200"
        } shadow-xl w-full max-w-6xl h-full max-h-full overflow-hidden`}
      >
        {/* Window controls */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100%-2rem)]">
          {/* Main Chart Area */}
          <div
            className={`col-span-8 space-y-4 overflow-y-auto ${
              isDarkMode
                ? "scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/30"
                : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            }`}
          >
            {/* Chart */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
              } rounded-lg p-3 border ${
                isDarkMode ? "border-white/5" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`text-xs ${
                    isDarkMode ? "text-white/60" : "text-gray-600"
                  }`}
                >
                  Strategy Performance
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`grid grid-cols-3 gap-1 ${
                      isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
                    } rounded p-0.5`}
                  >
                    <button
                      className={`${
                        isDarkMode
                          ? "bg-gray-700/30 text-white/60"
                          : "bg-gray-200 text-gray-600"
                      } text-[10px] py-0.5 px-1.5 rounded hover:${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-300"
                      } transition-colors`}
                    >
                      15min
                    </button>
                    <button
                      className={`${
                        isDarkMode
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-indigo-100 text-indigo-600"
                      } text-[10px] py-0.5 px-1.5 rounded hover:${
                        isDarkMode ? "bg-indigo-500/30" : "bg-indigo-200"
                      } transition-colors`}
                    >
                      1h
                    </button>
                    <button
                      className={`${
                        isDarkMode
                          ? "bg-gray-700/30 text-white/60"
                          : "bg-gray-200 text-gray-600"
                      } text-[10px] py-0.5 px-1.5 rounded hover:${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-300"
                      } transition-colors`}
                    >
                      1d
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-[250px]">
                <Line
                  data={data}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        mode: "index",
                        intersect: false,
                        backgroundColor: isDarkMode
                          ? "rgba(17, 24, 39, 0.8)"
                          : "rgba(255, 255, 255, 0.95)",
                        titleColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.8)"
                          : "rgba(0, 0, 0, 0.8)",
                        bodyColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.6)",
                        borderColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                        borderWidth: 1,
                        padding: 8,
                        displayColors: true,
                        callbacks: {
                          label: function (context) {
                            let label = context.dataset.label || "";
                            if (label) {
                              label += ": ";
                            }
                            if (context.parsed.y !== null) {
                              label += context.parsed.y.toFixed(2) + "%";
                            }
                            return label;
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                          drawBorder: false,
                        },
                        ticks: {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.4)"
                            : "rgba(0, 0, 0, 0.4)",
                          font: {
                            size: 10,
                          },
                        },
                      },
                      y: {
                        grid: {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                          drawBorder: false,
                        },
                        ticks: {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.4)"
                            : "rgba(0, 0, 0, 0.4)",
                          font: {
                            size: 10,
                          },
                          callback: function (value) {
                            return value + "%";
                          },
                        },
                      },
                    },
                    interaction: {
                      mode: "nearest",
                      axis: "x",
                      intersect: false,
                    },
                  }}
                />
              </div>
            </div>

            {/* New Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Market Metrics */}
              <div
                className={`${
                  isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
                } rounded-lg p-2 border ${
                  isDarkMode ? "border-white/5" : "border-gray-200"
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Market Sentiment
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    Bullish
                  </div>
                  <div className="text-green-400 text-xs">72%</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500/30 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
                } rounded-lg p-2 border ${
                  isDarkMode ? "border-white/5" : "border-gray-200"
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Volatility
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    VIX
                  </div>
                  <div className="text-yellow-400 text-xs">18.5</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500/30 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
                } rounded-lg p-2 border ${
                  isDarkMode ? "border-white/5" : "border-gray-200"
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Volume Profile
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    24h
                  </div>
                  <div className="text-blue-400 text-xs">2.4M</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500/30 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
                } rounded-lg p-2 border ${
                  isDarkMode ? "border-white/5" : "border-gray-200"
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Market Depth
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    Bid/Ask
                  </div>
                  <div className="text-purple-400 text-xs">0.12%</div>
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500/30 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div
            className={`col-span-4 space-y-4 overflow-y-auto ${
              isDarkMode
                ? "scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/30"
                : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            }`}
          >
            {/* Parameters Widget */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
              } rounded-lg p-3 border ${
                isDarkMode ? "border-white/5" : "border-gray-200"
              }`}
            >
              <div
                className={`text-xs mb-3 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Parameters
              </div>
              <div className="space-y-3">
                {/* Strategy Selection */}
                <div>
                  <div
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-white/40" : "text-gray-600"
                    }`}
                  >
                    Strategy
                  </div>
                  <select
                    className={`w-full text-xs rounded p-1.5 border ${
                      isDarkMode
                        ? "bg-gray-700/50 text-white/60 border-white/5"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  >
                    <option>Trend Following</option>
                    <option>Mean Reversion</option>
                    <option>Breakout</option>
                  </select>
                </div>

                {/* Timeframe Selection */}
                <div>
                  <div
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-white/40" : "text-gray-600"
                    }`}
                  >
                    Timeframe
                  </div>
                  <select
                    className={`w-full text-xs rounded p-1.5 border ${
                      isDarkMode
                        ? "bg-gray-700/50 text-white/60 border-white/5"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  >
                    <option>1 Hour</option>
                    <option>4 Hours</option>
                    <option>1 Day</option>
                    <option>1 Week</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <div
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-white/40" : "text-gray-600"
                    }`}
                  >
                    Risk Level
                  </div>
                  <div className="flex gap-1">
                    <button
                      className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                        isDarkMode
                          ? "bg-gray-700/30 text-white/60 hover:bg-gray-700/50"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      Low
                    </button>
                    <button
                      className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                        isDarkMode
                          ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                          : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      }`}
                    >
                      Med
                    </button>
                    <button
                      className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                        isDarkMode
                          ? "bg-gray-700/30 text-white/60 hover:bg-gray-700/50"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      High
                    </button>
                  </div>
                </div>

                {/* Position Size */}
                <div>
                  <div
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-white/40" : "text-gray-600"
                    }`}
                  >
                    Position Size
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="25"
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span
                      className={isDarkMode ? "text-white/40" : "text-gray-500"}
                    >
                      0%
                    </span>
                    <span
                      className={isDarkMode ? "text-white/60" : "text-gray-700"}
                    >
                      25%
                    </span>
                    <span
                      className={isDarkMode ? "text-white/40" : "text-gray-500"}
                    >
                      100%
                    </span>
                  </div>
                </div>

                {/* Signals Section */}
                <div>
                  <div
                    className={`text-xs mb-2 ${
                      isDarkMode ? "text-white/40" : "text-gray-600"
                    }`}
                  >
                    Signals
                  </div>
                  <div className="space-y-2">
                    {/* MA Crossover */}
                    <div
                      className={`${
                        isDarkMode ? "bg-gray-700/30" : "bg-gray-200"
                      } rounded p-2 border ${
                        isDarkMode ? "border-white/5" : "border-gray-300"
                      }`}
                    >
                      <div
                        className={`text-xs mb-1 ${
                          isDarkMode ? "text-white/60" : "text-gray-600"
                        }`}
                      >
                        MA Crossover
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Fast"
                          className={`${
                            isDarkMode
                              ? "bg-gray-700/50 text-white/60"
                              : "bg-gray-200 text-gray-600"
                          } text-xs rounded p-1 border ${
                            isDarkMode ? "border-white/5" : "border-gray-300"
                          }`}
                        />
                        <input
                          type="number"
                          placeholder="Slow"
                          className={`${
                            isDarkMode
                              ? "bg-gray-700/50 text-white/60"
                              : "bg-gray-200 text-gray-600"
                          } text-xs rounded p-1 border ${
                            isDarkMode ? "border-white/5" : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>

                    {/* RSI Threshold */}
                    <div
                      className={`${
                        isDarkMode ? "bg-gray-700/30" : "bg-gray-200"
                      } rounded p-2 border ${
                        isDarkMode ? "border-white/5" : "border-gray-300"
                      }`}
                    >
                      <div
                        className={`text-xs mb-1 ${
                          isDarkMode ? "text-white/60" : "text-gray-600"
                        }`}
                      >
                        RSI Threshold
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Oversold"
                          className={`${
                            isDarkMode
                              ? "bg-gray-700/50 text-white/60"
                              : "bg-gray-200 text-gray-600"
                          } text-xs rounded p-1 border ${
                            isDarkMode ? "border-white/5" : "border-gray-300"
                          }`}
                        />
                        <input
                          type="number"
                          placeholder="Overbought"
                          className={`${
                            isDarkMode
                              ? "bg-gray-700/50 text-white/60"
                              : "bg-gray-200 text-gray-600"
                          } text-xs rounded p-1 border ${
                            isDarkMode ? "border-white/5" : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>

                    {/* MACD */}
                    <div
                      className={`${
                        isDarkMode ? "bg-gray-700/30" : "bg-gray-200"
                      } rounded p-2 border ${
                        isDarkMode ? "border-white/5" : "border-gray-300"
                      } opacity-50`}
                    >
                      <div
                        className={`text-xs mb-1 ${
                          isDarkMode ? "text-white/60" : "text-gray-600"
                        }`}
                      >
                        MACD
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Fast"
                          className={`${
                            isDarkMode
                              ? "bg-gray-700/50 text-white/60"
                              : "bg-gray-200 text-gray-600"
                          } text-xs rounded p-1 border ${
                            isDarkMode ? "border-white/5" : "border-gray-300"
                          }`}
                          disabled
                        />
                        <input
                          type="number"
                          placeholder="Slow"
                          className={`${
                            isDarkMode
                              ? "bg-gray-700/50 text-white/60"
                              : "bg-gray-200 text-gray-600"
                          } text-xs rounded p-1 border ${
                            isDarkMode ? "border-white/5" : "border-gray-300"
                          }`}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full ${
                    isDarkMode
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-indigo-100 text-indigo-600"
                  } text-xs py-1.5 rounded hover:${
                    isDarkMode ? "bg-indigo-500/30" : "bg-indigo-200"
                  } transition-colors`}
                >
                  Run Backtest
                </button>
              </div>
            </div>

            {/* New Technical Indicators */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
              } rounded-lg p-3 border ${
                isDarkMode ? "border-white/5" : "border-gray-200"
              }`}
            >
              <div
                className={`text-xs mb-3 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Technical Indicators
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    Bollinger Bands
                  </div>
                  <div className="text-green-400 text-xs">Active</div>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    Ichimoku Cloud
                  </div>
                  <div className="text-yellow-400 text-xs">Pending</div>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    Fibonacci Retracement
                  </div>
                  <div className="text-red-400 text-xs">Inactive</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
