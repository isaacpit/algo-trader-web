import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { LayoutSelector } from "../laptop-previews/LayoutSelector";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

// Register ChartJS components
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

// Predefined chart patterns
const chartPatterns = [
  // Bullish trend
  Array.from({ length: 100 }, (_, i) => {
    const base = 50 + i * 0.5; // Upward trend
    const noise = (Math.random() - 0.5) * 2; // Small random noise
    return base + noise;
  }),
  // Bearish trend
  Array.from({ length: 100 }, (_, i) => {
    const base = 50 - i * 0.3; // Downward trend
    const noise = (Math.random() - 0.5) * 2; // Small random noise
    return base + noise;
  }),
  // Sideways with volatility
  Array.from({ length: 100 }, (_, i) => {
    const base = 50 + Math.sin(i * 0.1) * 5; // Sine wave pattern
    const noise = (Math.random() - 0.5) * 1.5; // Small random noise
    return base + noise;
  }),
  // Breakout pattern
  Array.from({ length: 100 }, (_, i) => {
    const base = i < 50 ? 50 : 50 + (i - 50) * 0.8; // Flat then upward
    const noise = (Math.random() - 0.5) * 1.5; // Small random noise
    return base + noise;
  }),
];

// Generate chart data with minor variations
const generateChartData = (patternIndex) => {
  const basePattern = chartPatterns[patternIndex];
  return basePattern.map((value) => {
    const variation = (Math.random() - 0.5) * 1; // Very small random variation
    return Math.max(0, value + variation);
  });
};

// Generate chart title
const generateChartTitle = () => {
  const prefixes = [
    "ALPHA",
    "BETA",
    "GAMMA",
    "DELTA",
    "EPSILON",
    "ZETA",
    "THETA",
    "OMEGA",
  ];
  const suffixes = [
    "STRAT",
    "SIG",
    "IND",
    "MOM",
    "VOL",
    "TREND",
    "RSI",
    "MACD",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}-${suffix}`;
};

// Generate derived metrics
const generateDerivedMetrics = (data) => {
  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const change = (((lastValue - firstValue) / firstValue) * 100).toFixed(2);
  const volatility = (Math.max(...data) - Math.min(...data)).toFixed(2);
  const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);

  return {
    change: `${change}%`,
    volatility: `${volatility}`,
    average: `${avg}`,
  };
};

// Generate initial strategy data
const generateStrategyData = () => {
  const baseData = generateChartData(
    Math.floor(Math.random() * chartPatterns.length)
  );
  const benchmarkData = generateChartData(
    Math.floor(Math.random() * chartPatterns.length)
  );
  return { baseData, benchmarkData };
};

// Get chart options based on theme
const getChartOptions = (isDarkMode) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
    title: {
      display: true,
      text: "CHART_TITLE",
      color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.4)",
      font: {
        size: 12,
        family: "monospace",
      },
      padding: {
        top: 10,
        bottom: 10,
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.08)",
        drawBorder: true,
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.15)",
      },
      ticks: {
        display: false,
      },
      border: {
        display: true,
        color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.15)",
      },
      title: {
        display: true,
        text: "X_AXIS_TITLE",
        color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.5)",
        font: {
          size: 10,
          family: "monospace",
        },
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.08)",
        drawBorder: true,
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.15)",
      },
      ticks: {
        display: false,
      },
      border: {
        display: true,
        color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.15)",
      },
      title: {
        display: true,
        text: "Y_AXIS_TITLE",
        color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.5)",
        font: {
          size: 10,
          family: "monospace",
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
    },
    line: {
      tension: 0.4,
    },
  },
  animation: {
    duration: 3000,
    easing: "easeInOutQuart",
  },
});

// Generate background charts with proper light mode colors and dynamic sizing
const generateBackgroundCharts = (isDarkMode) => {
  const charts = [];
  const positions = [
    { top: "2%", left: "0%", rotate: -4 },
    { top: "25%", right: "0%", rotate: 3 },
    { top: "50%", left: "0%", rotate: -5 },
  ];

  const colors = isDarkMode
    ? [
        {
          border: "rgba(99, 102, 241, 0.6)",
          fill: "rgba(99, 102, 241, 0.1)",
        },
        {
          border: "rgba(16, 185, 129, 0.6)",
          fill: "rgba(16, 185, 129, 0.1)",
        },
        {
          border: "rgba(245, 158, 11, 0.6)",
          fill: "rgba(245, 158, 11, 0.1)",
        },
      ]
    : [
        {
          border: "rgba(99, 102, 241, 0.8)",
          fill: "rgba(99, 102, 241, 0.2)",
        },
        {
          border: "rgba(16, 185, 129, 0.8)",
          fill: "rgba(16, 185, 129, 0.2)",
        },
        {
          border: "rgba(245, 158, 11, 0.8)",
          fill: "rgba(245, 158, 11, 0.2)",
        },
      ];

  const axisLabels = [
    { x: "Time (UTC)", y: "Price (USD)" },
    { x: "Time (UTC)", y: "Volume" },
    { x: "Time (UTC)", y: "Signal" },
  ];

  positions.forEach((position, index) => {
    const width = window.innerWidth * 0.6;
    const height = window.innerHeight * 0.45;
    const data = generateChartData(
      Math.floor(Math.random() * chartPatterns.length)
    );
    const title = generateChartTitle();
    const metrics = generateDerivedMetrics(data);

    charts.push({
      position,
      width,
      height,
      data,
      color: colors[index % colors.length],
      title,
      metrics,
      axisLabels: axisLabels[index],
    });
  });

  return charts;
};

// Predefined window data
const generateSurroundingWindows = (isDarkMode) => [
  {
    id: "market-overview",
    title: "Market Overview",
    position: { top: "5%", right: "5%" },
    size: { width: "300px", height: "200px" },
    type: "laptop",
    data: {
      labels: Array.from({ length: 20 }, (_, i) => i),
      datasets: [
        {
          data: [
            65, 59, 80, 81, 56, 55, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
            85, 80, 75,
          ],
          borderColor: isDarkMode
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)",
          backgroundColor: isDarkMode
            ? "rgba(99, 102, 241, 0.1)"
            : "rgba(99, 102, 241, 0.15)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  },
  {
    id: "active-signals",
    title: "Active Signals",
    position: { bottom: "10%", left: "5%" },
    size: { width: "250px", height: "180px" },
    type: "laptop",
    items: [
      { name: "BTC/USD", signal: "BUY", confidence: "85%" },
      { name: "ETH/USD", signal: "SELL", confidence: "72%" },
      { name: "SOL/USD", signal: "HOLD", confidence: "65%" },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    position: { top: "30%", left: "5%" },
    size: { width: "280px", height: "220px" },
    type: "laptop",
    data: {
      labels: Array.from({ length: 15 }, (_, i) => i),
      datasets: [
        {
          data: [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70, 65],
          borderColor: isDarkMode
            ? "rgba(16, 185, 129, 0.5)"
            : "rgba(16, 185, 129, 0.7)",
          backgroundColor: isDarkMode
            ? "rgba(16, 185, 129, 0.1)"
            : "rgba(16, 185, 129, 0.15)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  },
  {
    id: "market-depth",
    title: "Market Depth",
    position: { bottom: "15%", right: "5%" },
    size: { width: "320px", height: "240px" },
    type: "laptop",
    data: {
      labels: Array.from({ length: 25 }, (_, i) => i),
      datasets: [
        {
          data: [
            30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70,
            65, 60, 55, 50, 45, 40, 35, 30,
          ],
          borderColor: isDarkMode
            ? "rgba(245, 158, 11, 0.5)"
            : "rgba(245, 158, 11, 0.7)",
          backgroundColor: isDarkMode
            ? "rgba(245, 158, 11, 0.1)"
            : "rgba(245, 158, 11, 0.15)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  },
];

export const Hero = () => {
  const { isDarkMode } = useTheme();
  const [backgroundCharts, setBackgroundCharts] = useState([]);
  const [strategyData, setStrategyData] = useState(null);
  const chartRefs = useRef([]);

  useEffect(() => {
    const charts = generateBackgroundCharts(isDarkMode);
    setBackgroundCharts(charts);
    console.log("Generated Background Charts:", charts);
    setStrategyData(generateStrategyData());
  }, [isDarkMode]);

  // Generate chart data with overlays
  const chartData = useMemo(() => {
    if (!strategyData) return null;

    return {
      chartData: {
        labels: Array(100).fill(""),
        datasets: [
          {
            label: "Strategy",
            data: strategyData.baseData,
            borderColor: isDarkMode
              ? "rgba(99,102,241,0.8)"
              : "rgba(99,102,241,0.9)",
            backgroundColor: isDarkMode
              ? "rgba(99,102,241,0.1)"
              : "rgba(99,102,241,0.15)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Market",
            data: strategyData.benchmarkData,
            borderColor: isDarkMode
              ? "rgba(156,163,175,0.5)"
              : "rgba(156,163,175,0.7)",
            backgroundColor: isDarkMode
              ? "rgba(156,163,175,0.05)"
              : "rgba(156,163,175,0.1)",
            fill: true,
            tension: 0.1,
            borderDash: [5, 5],
          },
        ],
        overlays: [
          {
            type: "trendline",
            points: [0, 25, 50, 75, 99],
            color: isDarkMode ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.4)",
          },
          {
            type: "highlight",
            start: 25,
            end: 50,
            color: isDarkMode ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.3)",
          },
        ],
      },
      rsiData: {
        labels: Array(100).fill(""),
        datasets: [
          {
            label: "RSI",
            data: Array.from({ length: 100 }, (_, i) => {
              const base = 50 + Math.sin(i * 0.2) * 30;
              const noise = (Math.random() - 0.5) * 2;
              return Math.min(100, Math.max(0, base + noise));
            }),
            borderColor: isDarkMode
              ? "rgba(16,185,129,0.8)"
              : "rgba(16,185,129,0.9)",
            backgroundColor: isDarkMode
              ? "rgba(16,185,129,0.1)"
              : "rgba(16,185,129,0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
        overlays: [
          {
            type: "highlight",
            start: 10,
            end: 20,
            color: isDarkMode ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.3)",
          },
          {
            type: "highlight",
            start: 30,
            end: 40,
            color: isDarkMode ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.3)",
          },
        ],
      },
      volumeData: {
        labels: Array(100).fill(""),
        datasets: [
          {
            label: "Volume",
            data: Array.from({ length: 100 }, (_, i) => {
              const base = 20 + Math.sin(i * 0.3) * 10;
              const spike = i > 25 && i < 35 ? 30 : 0;
              const noise = (Math.random() - 0.5) * 2;
              return base + spike + noise;
            }),
            borderColor: isDarkMode
              ? "rgba(245,158,11,0.8)"
              : "rgba(245,158,11,0.9)",
            backgroundColor: isDarkMode
              ? "rgba(245,158,11,0.1)"
              : "rgba(245,158,11,0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
        overlays: [
          {
            type: "highlight",
            start: 25,
            end: 35,
            color: isDarkMode ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.3)",
          },
        ],
      },
      macdData: {
        labels: Array(100).fill(""),
        datasets: [
          {
            label: "MACD",
            data: Array.from({ length: 100 }, (_, i) => {
              const base = Math.sin(i * 0.2) * 10;
              const crossover = i > 25 ? 15 : -15;
              const noise = (Math.random() - 0.5) * 1;
              return base + crossover + noise;
            }),
            borderColor: isDarkMode
              ? "rgba(99,102,241,0.8)"
              : "rgba(99,102,241,0.9)",
            backgroundColor: isDarkMode
              ? "rgba(99,102,241,0.1)"
              : "rgba(99,102,241,0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
        overlays: [
          {
            type: "highlight",
            start: 20,
            end: 30,
            color: isDarkMode ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.3)",
          },
        ],
      },
      riskData: {
        labels: Array(100).fill(""),
        datasets: [
          {
            label: "Risk",
            data: Array.from({ length: 100 }, (_, i) => {
              const base = 30 + Math.sin(i * 0.15) * 20;
              const spike = i > 40 && i < 50 ? 60 : 0;
              const noise = (Math.random() - 0.5) * 3;
              return Math.min(100, Math.max(0, base + spike + noise));
            }),
            borderColor: isDarkMode
              ? "rgba(239,68,68,0.8)"
              : "rgba(239,68,68,0.9)",
            backgroundColor: isDarkMode
              ? "rgba(239,68,68,0.1)"
              : "rgba(239,68,68,0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
        overlays: [
          {
            type: "highlight",
            start: 40,
            end: 50,
            color: isDarkMode ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.3)",
          },
        ],
      },
    };
  }, [strategyData, isDarkMode]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Charts */}
      {backgroundCharts.map((chart, index) => (
        <div
          key={index}
          className="absolute opacity-20"
          style={{
            ...chart.position,
            width: chart.width,
            height: chart.height,
            transform: `rotate(${chart.position.rotate}deg)`,
          }}
        >
          <Line
            ref={(el) => (chartRefs.current[index] = el)}
            data={{
              labels: Array(chart.data.length).fill(""),
              datasets: [
                {
                  data: chart.data,
                  borderColor: chart.color.border,
                  borderWidth: 1,
                  fill: true,
                  backgroundColor: chart.color.fill,
                },
              ],
            }}
            options={{
              ...getChartOptions(isDarkMode),
              plugins: {
                ...getChartOptions(isDarkMode).plugins,
                title: {
                  ...getChartOptions(isDarkMode).plugins.title,
                  text: chart.title,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(0, 0, 0, 0.4)",
                },
              },
              scales: {
                x: {
                  ...getChartOptions(isDarkMode).scales.x,
                  title: {
                    ...getChartOptions(isDarkMode).scales.x.title,
                    text: chart.axisLabels.x,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.3)",
                  },
                  grid: {
                    ...getChartOptions(isDarkMode).scales.x.grid,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.02)"
                      : "rgba(0, 0, 0, 0.06)",
                  },
                  border: {
                    ...getChartOptions(isDarkMode).scales.x.border,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.12)",
                  },
                },
                y: {
                  ...getChartOptions(isDarkMode).scales.y,
                  title: {
                    ...getChartOptions(isDarkMode).scales.y.title,
                    text: chart.axisLabels.y,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.3)",
                  },
                  grid: {
                    ...getChartOptions(isDarkMode).scales.y.grid,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.02)"
                      : "rgba(0, 0, 0, 0.06)",
                  },
                  border: {
                    ...getChartOptions(isDarkMode).scales.y.border,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.12)",
                  },
                },
              },
            }}
          />
          {/* Metrics Panel */}
          <div
            className={`absolute top-2 right-2 ${
              isDarkMode ? "bg-black/10" : "bg-white/80"
            } backdrop-blur-sm rounded p-2 text-xs font-mono border ${
              isDarkMode ? "border-white/10" : "border-gray-200"
            }`}
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className={isDarkMode ? "text-white/20" : "text-gray-600"}>
                  CHG
                </div>
                <div className={isDarkMode ? "text-white/40" : "text-gray-800"}>
                  {chart.metrics.change}
                </div>
              </div>
              <div>
                <div className={isDarkMode ? "text-white/20" : "text-gray-600"}>
                  VOL
                </div>
                <div className={isDarkMode ? "text-white/40" : "text-gray-800"}>
                  {chart.metrics.volatility}
                </div>
              </div>
              <div>
                <div className={isDarkMode ? "text-white/20" : "text-gray-600"}>
                  AVG
                </div>
                <div className={isDarkMode ? "text-white/40" : "text-gray-800"}>
                  {chart.metrics.average}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span
                className={`${
                  isDarkMode
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "bg-indigo-100 text-indigo-700"
                } px-4 py-2 rounded-full text-sm font-medium`}
              >
                Professional-Grade Trading Platform
              </span>
            </div>
            <h1
              className={`text-6xl font-bold mb-6 bg-clip-text text-transparent ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}
            >
              Build. Test. Trade.
            </h1>
            <p
              className={`text-2xl mb-8 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              } max-w-3xl mx-auto leading-relaxed`}
            >
              Design sophisticated trading algorithms, backtest them with
              precision, and optimize your strategy with institutional-grade
              tools.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
                Start Free Trial
              </button>
              <button
                className={`${
                  isDarkMode
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } px-8 py-4 rounded-lg text-lg font-semibold backdrop-blur-sm transition-all duration-200`}
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div
              className={`${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/80 border-gray-200"
              } backdrop-blur-sm rounded-xl p-6 border shadow-lg`}
            >
              <div
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                10+
              </div>
              <div className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                Years of Historical Data
              </div>
            </div>
            <div
              className={`${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/80 border-gray-200"
              } backdrop-blur-sm rounded-xl p-6 border shadow-lg`}
            >
              <div
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                99.9%
              </div>
              <div className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                Backtest Accuracy
              </div>
            </div>
            <div
              className={`${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/80 border-gray-200"
              } backdrop-blur-sm rounded-xl p-6 border shadow-lg`}
            >
              <div
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                50K+
              </div>
              <div className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                Active Traders
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Preview */}
        <div className="mt-16">
          <LayoutSelector data={chartData} />
        </div>
      </div>
    </div>
  );
};
