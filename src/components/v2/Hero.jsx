import React, { useEffect, useRef } from "react";
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
  const prefixes = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'THETA', 'OMEGA'];
  const suffixes = ['STRAT', 'SIG', 'IND', 'MOM', 'VOL', 'TREND', 'RSI', 'MACD'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}-${suffix}`;
};

const generateDerivedMetrics = (data) => {
  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const change = ((lastValue - firstValue) / firstValue * 100).toFixed(2);
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
    { top: '0%', left: '0%', rotate: -1 },
    { top: '25%', right: '0%', rotate: 1 },
    { top: '50%', left: '0%', rotate: -1 },
  ];

  const colors = [
    { border: 'rgba(99, 102, 241, 0.25)', fill: 'rgba(99, 102, 241, 0.03)' },
    { border: 'rgba(79, 70, 229, 0.25)', fill: 'rgba(79, 70, 229, 0.03)' },
    { border: 'rgba(67, 56, 202, 0.25)', fill: 'rgba(67, 56, 202, 0.03)' },
  ];

  const axisLabels = [
    { x: 'Time (UTC)', y: 'Price (USD)' },
    { x: 'Time (UTC)', y: 'Volume' },
    { x: 'Time (UTC)', y: 'Signal' },
  ];

  positions.forEach((position, index) => {
    const width = window.innerWidth * 0.6; // 60% of viewport width
    const height = window.innerHeight * 0.45; // 45% of viewport height
    const data = generateChartData(100, 2 + Math.random() * 2, 50, (Math.random() - 0.5) * 10, 0.5);
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
      text: 'CHART_TITLE',
      color: 'rgba(255, 255, 255, 0.2)',
      font: {
        size: 12,
        family: 'monospace',
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
        color: 'rgba(255, 255, 255, 0.03)',
        drawBorder: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        display: false,
      },
      border: {
        display: true,
        color: 'rgba(255, 255, 255, 0.1)',
      },
      title: {
        display: true,
        text: 'X_AXIS_TITLE',
        color: 'rgba(255, 255, 255, 0.15)',
        font: {
          size: 10,
          family: 'monospace',
        },
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(255, 255, 255, 0.03)',
        drawBorder: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        display: false,
      },
      border: {
        display: true,
        color: 'rgba(255, 255, 255, 0.1)',
      },
      title: {
        display: true,
        text: 'Y_AXIS_TITLE',
        color: 'rgba(255, 255, 255, 0.15)',
        font: {
          size: 10,
          family: 'monospace',
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

// Static chart options for laptop display
const staticChartOptions = {
  ...chartOptions,
  animation: false,
  elements: {
    ...chartOptions.elements,
    point: {
      ...chartOptions.elements.point,
      radius: 3,
      hoverRadius: 4,
    },
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
    // Generate base strategy data with more pronounced trends
    const baseChange = (Math.random() - 0.45) * 2; // Slight upward bias
    const baseTrend = Math.sin(i * 0.1) * 0.5;
    baseValue += baseChange + baseTrend;
    baseData.push(baseValue);

    // Generate benchmark data with less volatility
    const benchmarkChange = (Math.random() - 0.5) * 1.5;
    const benchmarkTrend = Math.sin(i * 0.08) * 0.3;
    benchmarkValue += benchmarkChange + benchmarkTrend;
    benchmarkData.push(benchmarkValue);
  }

  return { baseData, benchmarkData };
};

export default function Hero() {
  const chartRefs = useRef(backgroundCharts.map(() => null));
  const { baseData, benchmarkData } = generateStrategyData();

  useEffect(() => {
    const animateCharts = () => {
      chartRefs.current.forEach((chartRef, index) => {
        if (chartRef) {
          const trend = (Math.random() - 0.5) * 15;
          const volatility = 1.5 + Math.random() * 2;
          const noise = 0.2 + Math.random() * 0.3;
          const newData = generateChartData(100, volatility, 50, trend, noise);
          
          // Smoother transition between data points
          const currentData = chartRef.data.datasets[0].data;
          const interpolatedData = currentData.map((current, i) => {
            const target = newData[i];
            return current + (target - current) * 0.2; // Reduced interpolation speed
          });
          
          chartRef.data.datasets[0].data = interpolatedData;
          chartRef.update('none');
        }
      });
    };

    const interval = setInterval(animateCharts, 8000); // Slowed down to 8 seconds
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
                      color: 'rgba(255, 255, 255, 0.15)',
                    },
                  },
                  scales: {
                    x: {
                      ...chartOptions.scales.x,
                      title: {
                        ...chartOptions.scales.x.title,
                        text: chart.axisLabels.x,
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      grid: {
                        ...chartOptions.scales.x.grid,
                        color: 'rgba(255, 255, 255, 0.02)',
                      },
                      border: {
                        ...chartOptions.scales.x.border,
                        color: 'rgba(255, 255, 255, 0.08)',
                      },
                    },
                    y: {
                      ...chartOptions.scales.y,
                      title: {
                        ...chartOptions.scales.y.title,
                        text: chart.axisLabels.y,
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      grid: {
                        ...chartOptions.scales.y.grid,
                        color: 'rgba(255, 255, 255, 0.02)',
                      },
                      border: {
                        ...chartOptions.scales.y.border,
                        color: 'rgba(255, 255, 255, 0.08)',
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
                    <div className="text-white/40">{chart.metrics.volatility}</div>
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
            Design sophisticated trading algorithms, backtest them with precision, and optimize your strategy with institutional-grade tools.
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
          <div className="relative bg-gray-900 rounded-lg p-4">
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="w-full h-full relative">
                {/* Simulated trading interface */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/80"></div>
                
                {/* Window controls */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-gray-400 text-sm">Strategy Performance</div>
                </div>

                {/* Trading interface content */}
                <div className="absolute inset-0 p-8 pt-16">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Main chart */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-green-400 text-sm font-medium">Strategy Performance</div>
                          <div className="text-2xl font-bold text-white">+15.8%</div>
                        </div>
                        <div className="text-gray-400 text-sm">Last 30 days</div>
                      </div>
                      <div className="h-[200px]">
                        <Line
                          data={{
                            labels: Array.from({ length: 30 }, (_, i) => i),
                            datasets: [
                              {
                                data: baseData,
                                borderColor: "#34d399",
                                borderWidth: 2,
                                fill: true,
                                backgroundColor: "rgba(52, 211, 153, 0.1)",
                                pointBackgroundColor: "#34d399",
                                pointBorderColor: "#34d399",
                                pointHoverBackgroundColor: "#34d399",
                                pointHoverBorderColor: "#34d399",
                              },
                            ],
                          }}
                          options={staticChartOptions}
                        />
                      </div>
                    </div>

                    {/* Stats panel */}
                    <div className="grid grid-rows-2 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Win Rate</div>
                        <div className="text-2xl font-bold text-white">68.5%</div>
                        <div className="text-green-400 text-sm mt-1">↑ 2.3% from last month</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Sharpe Ratio</div>
                        <div className="text-2xl font-bold text-white">2.4</div>
                        <div className="text-green-400 text-sm mt-1">Excellent risk-adjusted returns</div>
                      </div>
                    </div>

                    {/* Benchmark comparison */}
                    <div className="col-span-2 bg-gray-900/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-400 text-sm">Strategy vs Benchmark</div>
                        <div className="text-green-400 text-sm">Outperforming by 10.3%</div>
                      </div>
                      <div className="h-[100px]">
                        <Line
                          data={{
                            labels: Array.from({ length: 30 }, (_, i) => i),
                            datasets: [
                              {
                                data: benchmarkData,
                                borderColor: "#6366f1",
                                borderWidth: 2,
                                fill: true,
                                backgroundColor: "rgba(99, 102, 241, 0.1)",
                                pointBackgroundColor: "#6366f1",
                                pointBorderColor: "#6366f1",
                                pointHoverBackgroundColor: "#6366f1",
                                pointHoverBorderColor: "#6366f1",
                              },
                            ],
                          }}
                          options={staticChartOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Section Container */}
        <div className="relative w-full max-w-6xl mx-auto mt-16">
          {/* Main Laptop Frame */}
          <div className="relative bg-gray-900 rounded-lg shadow-2xl overflow-hidden z-10">
            {/* Laptop Top Bar */}
            <div className="h-8 bg-gray-800 flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            
            {/* Laptop Screen Content */}
            <div className="relative aspect-[16/10] bg-gray-900 p-4">
              {/* Main Chart */}
              <div className="h-1/2 mb-4 relative">
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
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-4 h-1/2">
                {/* Performance Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">PERF</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">+24.8%</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">YTD</div>
                </div>

                {/* Volume Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">VOL</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">1.2M</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">24H</div>
                </div>

                {/* Signal Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">SIG</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">0.78</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">STR</div>
                </div>

                {/* Risk Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">RISK</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">0.32</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">BETA</div>
                </div>

                {/* Additional Metrics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">ALPHA</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">0.15</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">DAILY</div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">SHARPE</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">2.1</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">RATIO</div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">DRAWDOWN</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">-8.2%</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">MAX</div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/20 text-xs font-mono mb-1 filter blur-[0.5px]">WIN RATE</div>
                  <div className="text-white/40 text-sm font-mono filter blur-[0.5px]">68%</div>
                  <div className="text-white/20 text-xs font-mono mt-2 filter blur-[0.5px]">30D</div>
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
} 