import React, { useEffect, useRef, useMemo } from "react";
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

// Generate sophisticated chart data
const generateChartData = (length, volatility, baseValue, trend, noise) => {
  const data = [];
  let value = baseValue;
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * volatility + trend;
    value += Math.sin(i * 0.1) * noise;
    data.push(value);
  }
  return data;
};

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

// Generate multiple chart datasets for background
const generateBackgroundCharts = () => {
  const charts = [];
  const positions = [
    { top: "10%", left: "5%", rotate: -1 },
    { top: "35%", right: "5%", rotate: 1 },
    { top: "60%", left: "5%", rotate: -1 },
  ];

  const colors = [
    { border: "rgba(99, 102, 241, 0.25)", fill: "rgba(99, 102, 241, 0.03)" },
    { border: "rgba(79, 70, 229, 0.25)", fill: "rgba(79, 70, 229, 0.03)" },
    { border: "rgba(67, 56, 202, 0.25)", fill: "rgba(67, 56, 202, 0.03)" },
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
      100,
      2 + Math.random() * 2,
      50,
      (Math.random() - 0.5) * 10,
      0.5
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

const backgroundCharts = generateBackgroundCharts();
const labels = Array.from({ length: 50 }, (_, i) => i);

const chartOptions = {
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
      color: "rgba(255, 255, 255, 0.2)",
      font: {
        size: 12,
        family: "monospace",
      },
      padding: {
        top: 5,
        bottom: 5,
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: "rgba(255, 255, 255, 0.03)",
        drawBorder: true,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        display: false,
      },
      border: {
        display: true,
        color: "rgba(255, 255, 255, 0.1)",
      },
      title: {
        display: true,
        text: "X_AXIS_TITLE",
        color: "rgba(255, 255, 255, 0.15)",
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
        color: "rgba(255, 255, 255, 0.03)",
        drawBorder: true,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        display: false,
      },
      border: {
        display: true,
        color: "rgba(255, 255, 255, 0.1)",
      },
      title: {
        display: true,
        text: "Y_AXIS_TITLE",
        color: "rgba(255, 255, 255, 0.15)",
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
};

// Generate profitable strategy data
const generateStrategyData = () => {
  const length = 100;
  const baseData = [];
  const benchmarkData = [];
  let baseValue = 100;
  let benchmarkValue = 100;

  for (let i = 0; i < length; i++) {
    const baseChange = (Math.random() - 0.45) * 2;
    const baseTrend = Math.sin(i * 0.1) * 0.5;
    baseValue += baseChange + baseTrend;
    baseData.push(baseValue);

    const benchmarkChange = (Math.random() - 0.5) * 1.5;
    const benchmarkTrend = Math.sin(i * 0.08) * 0.3;
    benchmarkValue += benchmarkChange + benchmarkTrend;
    benchmarkData.push(benchmarkValue);
  }

  return { baseData, benchmarkData };
};

export const Hero = () => {
  const chartRefs = useRef(backgroundCharts.map(() => null));

  // Memoize the strategy data to prevent unnecessary re-renders
  const { baseData, benchmarkData } = useMemo(() => generateStrategyData(), []);

  useEffect(() => {
    const animateCharts = () => {
      chartRefs.current.forEach((chartRef, index) => {
        if (chartRef) {
          const trend = (Math.random() - 0.5) * 15;
          const volatility = 1.5 + Math.random() * 2;
          const noise = 0.2 + Math.random() * 0.3;
          const newData = generateChartData(100, volatility, 50, trend, noise);

          const currentData = chartRef.data.datasets[0].data;
          const interpolatedData = currentData.map((current, i) => {
            const target = newData[i];
            return current + (target - current) * 0.2;
          });

          chartRef.data.datasets[0].data = interpolatedData;
          chartRef.update("none");
        }
      });
    };

    const interval = setInterval(animateCharts, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative text-white py-32 px-6 overflow-hidden">
      {/* Background Charts */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundCharts.map((chart, index) => (
          <div
            key={index}
            className="absolute opacity-4"
            style={{
              top: chart.position.top,
              left: chart.position.left,
              right: chart.position.right,
              width: chart.width,
              height: chart.height,
              transform: `rotate(${chart.position.rotate}deg)`,
            }}
          >
            <div className="relative w-full h-full">
              <Line
                ref={(el) => (chartRefs.current[index] = el)}
                data={{
                  labels,
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
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: chart.title,
                      color: "rgba(255, 255, 255, 0.15)",
                    },
                  },
                  scales: {
                    x: {
                      ...chartOptions.scales.x,
                      title: {
                        ...chartOptions.scales.x.title,
                        text: chart.axisLabels.x,
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      grid: {
                        ...chartOptions.scales.x.grid,
                        color: "rgba(255, 255, 255, 0.02)",
                      },
                      border: {
                        ...chartOptions.scales.x.border,
                        color: "rgba(255, 255, 255, 0.08)",
                      },
                    },
                    y: {
                      ...chartOptions.scales.y,
                      title: {
                        ...chartOptions.scales.y.title,
                        text: chart.axisLabels.y,
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      grid: {
                        ...chartOptions.scales.y.grid,
                        color: "rgba(255, 255, 255, 0.02)",
                      },
                      border: {
                        ...chartOptions.scales.y.border,
                        color: "rgba(255, 255, 255, 0.08)",
                      },
                    },
                  },
                }}
              />
              {/* Metrics Panel */}
              <div className="absolute top-2 right-2 bg-black/10 backdrop-blur-sm rounded p-2 text-xs font-mono">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-white/20">CHG</div>
                    <div className="text-white/40">{chart.metrics.change}</div>
                  </div>
                  <div>
                    <div className="text-white/20">VOL</div>
                    <div className="text-white/40">
                      {chart.metrics.volatility}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/20">AVG</div>
                    <div className="text-white/40">{chart.metrics.average}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="bg-indigo-500/10 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium">
              Professional-Grade Trading Platform
            </span>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Build. Test. Trade.
          </h1>
          <p className="text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Design sophisticated trading algorithms, backtest them with
            precision, and optimize your strategy with institutional-grade
            tools.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold backdrop-blur-sm transition-all duration-200">
              View Demo
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-indigo-400 mb-2">10+</div>
            <div className="text-gray-300">Years of Historical Data</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-indigo-400 mb-2">99.9%</div>
            <div className="text-gray-300">Backtest Accuracy</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-indigo-400 mb-2">50K+</div>
            <div className="text-gray-300">Active Traders</div>
          </div>
        </div>

        {/* Platform Preview */}
        <div className="mt-16 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25"></div>
          <div className="relative bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            {/* Laptop Top Bar */}
            <div className="h-8 bg-gray-800 flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-gray-400 text-sm ml-4">
                Strategy Performance
              </div>
            </div>

            {/* Laptop Screen Content */}
            <div className="relative aspect-[16/10] bg-gray-900 p-4">
              {/* Main Chart with Parameters */}
              <div className="h-1/2 mb-4 relative flex gap-4">
                {/* Chart Section */}
                <div className="flex-1 relative">
                  <Line
                    data={{
                      labels: Array.from({ length: 100 }, (_, i) => i),
                      datasets: [
                        {
                          label: "Strategy Performance",
                          data: baseData,
                          borderColor: "#6366f1",
                          borderWidth: 2,
                          fill: true,
                          backgroundColor: "rgba(99, 102, 241, 0.1)",
                          tension: 0.4,
                          pointRadius: 0,
                          pointHoverRadius: 0,
                        },
                        {
                          label: "Benchmark",
                          data: benchmarkData,
                          borderColor: "rgba(255, 255, 255, 0.2)",
                          borderWidth: 1,
                          fill: false,
                          tension: 0.4,
                          pointRadius: 0,
                          pointHoverRadius: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
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
                        point: {
                          radius: 0,
                        },
                        line: {
                          tension: 0.4,
                        },
                      },
                      animation: {
                        duration: 0,
                      },
                    }}
                  />
                  {/* Overlay Metrics */}
                  <div className="absolute top-2 left-2 flex space-x-4">
                    <div className="bg-indigo-600/20 backdrop-blur-sm rounded px-2 py-1">
                      <div className="text-indigo-300 text-xs font-mono">
                        ALPHA
                      </div>
                      <div className="text-white text-sm font-mono">+0.24</div>
                    </div>
                    <div className="bg-green-600/20 backdrop-blur-sm rounded px-2 py-1">
                      <div className="text-green-300 text-xs font-mono">
                        BETA
                      </div>
                      <div className="text-white text-sm font-mono">0.82</div>
                    </div>
                  </div>
                </div>

                {/* Parameters Widget */}
                <div className="w-64 bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-3 font-medium">
                    Backtest Parameters
                  </div>

                  {/* Time Range Selector */}
                  <div className="mb-4">
                    <div className="text-gray-500 text-xs mb-1">Time Range</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-indigo-500/20 text-indigo-300 text-xs py-1.5 rounded hover:bg-indigo-500/30 transition-colors">
                        1M
                      </button>
                      <button className="bg-gray-700/50 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-700/70 transition-colors">
                        3M
                      </button>
                      <button className="bg-gray-700/50 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-700/70 transition-colors">
                        6M
                      </button>
                      <button className="bg-gray-700/50 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-700/70 transition-colors">
                        1Y
                      </button>
                    </div>
                  </div>

                  {/* Strategy Parameters */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Lookback Period
                      </div>
                      <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">
                        14 days
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Entry Threshold
                      </div>
                      <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">
                        0.75
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Exit Threshold
                      </div>
                      <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">
                        0.25
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Position Size
                      </div>
                      <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">
                        100%
                      </div>
                    </div>
                  </div>

                  {/* Run Button */}
                  <button className="w-full mt-4 bg-indigo-500/20 text-indigo-300 text-xs py-2 rounded hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-2">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Run Backtest
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 h-1/2">
                {/* Performance Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">
                    PERF
                  </div>
                  <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">
                    +24.8%
                  </div>
                  <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">
                    YTD
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">
                    ALGO-1
                  </div>
                </div>

                {/* Volume Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">
                    VOL
                  </div>
                  <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">
                    1.2M
                  </div>
                  <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">
                    24H
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">
                    ALGO-2
                  </div>
                </div>

                {/* Signal Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">
                    SIG
                  </div>
                  <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">
                    0.78
                  </div>
                  <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">
                    STR
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">
                    ALGO-3
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-pink-500/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">
                    RISK
                  </div>
                  <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">
                    0.32
                  </div>
                  <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">
                    BETA
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">
                    ALGO-4
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">
                    ALPHA
                  </div>
                  <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">
                    0.15
                  </div>
                  <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">
                    DAILY
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">
                    ALGO-5
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">
                    SHARPE
                  </div>
                  <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">
                    2.1
                  </div>
                  <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">
                    RATIO
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">
                    ALGO-6
                  </div>
                </div>

                {/* New Styled Metrics Cards */}
                <div className="col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="grid grid-rows-2 gap-4 h-full">
                    {/* Win Rate Card */}
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">
                            Win Rate
                          </div>
                          <div className="text-2xl font-bold text-white">
                            68.5%
                          </div>
                          <div className="text-green-400 text-sm mt-1">
                            ↑ 2.3% from last month
                          </div>
                        </div>
                        <div className="bg-green-500/10 rounded-full p-2">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sharpe Ratio Card */}
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">
                            Sharpe Ratio
                          </div>
                          <div className="text-2xl font-bold text-white">
                            2.4
                          </div>
                          <div className="text-green-400 text-sm mt-1">
                            Excellent risk-adjusted returns
                          </div>
                        </div>
                        <div className="bg-indigo-500/10 rounded-full p-2">
                          <svg
                            className="w-4 h-4 text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Laptop Previews */}
          <div className="absolute inset-0 -z-10">
            {/* Top Right Laptop */}
            <div className="absolute top-[-10%] right-[-5%] w-64 transform rotate-12">
              <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="h-6 bg-gray-800 flex items-center px-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="aspect-[16/10] bg-gray-900 p-2">
                  <div className="h-full bg-gray-800/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Bottom Left Laptop */}
            <div className="absolute bottom-[-15%] left-[-8%] w-72 transform -rotate-6">
              <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="h-6 bg-gray-800 flex items-center px-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="aspect-[16/10] bg-gray-900 p-2">
                  <div className="h-full bg-gray-800/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Top Left Laptop */}
            <div className="absolute top-[-5%] left-[-12%] w-56 transform -rotate-12">
              <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="h-6 bg-gray-800 flex items-center px-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="aspect-[16/10] bg-gray-900 p-2">
                  <div className="h-full bg-gray-800/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Bottom Right Laptop */}
            <div className="absolute bottom-[-8%] right-[-15%] w-60 transform rotate-8">
              <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="h-6 bg-gray-800 flex items-center px-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="aspect-[16/10] bg-gray-900 p-2">
                  <div className="h-full bg-gray-800/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Middle Right Laptop */}
            <div className="absolute top-1/2 right-[-20%] w-52 transform -translate-y-1/2 rotate-3">
              <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="h-6 bg-gray-800 flex items-center px-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="aspect-[16/10] bg-gray-900 p-2">
                  <div className="h-full bg-gray-800/30 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
