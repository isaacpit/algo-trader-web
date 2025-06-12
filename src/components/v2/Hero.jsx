import React, { useEffect, useRef, useState } from "react";
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
import LayoutSelector from '../laptop-previews/LayoutSelector';

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
    const width = window.innerWidth * 0.6;
    const height = window.innerHeight * 0.45;
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

// Add new laptop section styles
const laptopStyles = {
  modern: {
    name: "Modern Dark",
    description: "Clean, minimalist design with dark theme",
    bgColor: "bg-gray-900",
    borderColor: "border-gray-800",
    accentColor: "indigo",
  },
  neon: {
    name: "Neon Cyberpunk",
    description: "Vibrant neon accents with cyberpunk aesthetic",
    bgColor: "bg-black",
    borderColor: "border-purple-500/30",
    accentColor: "purple",
  },
  retro: {
    name: "Retro Terminal",
    description: "Classic terminal look with monospace fonts",
    bgColor: "bg-gray-950",
    borderColor: "border-green-500/30",
    accentColor: "green",
  },
  minimal: {
    name: "Minimal Light",
    description: "Light theme with subtle shadows",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
    accentColor: "blue",
  },
  gradient: {
    name: "Gradient Flow",
    description: "Smooth gradient transitions",
    bgColor: "bg-gradient-to-br from-gray-900 to-indigo-950",
    borderColor: "border-indigo-500/30",
    accentColor: "indigo",
  },
};

const Hero = () => {
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const chartRefs = useRef(backgroundCharts.map(() => null));

  // Generate all required data
  const { baseData, benchmarkData } = generateStrategyData();
  
  // Generate additional data for technical indicators
  const rsiData = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: [{
      data: generateChartData(50, 1, 50, 0, 0.2),
      borderColor: 'rgba(99, 102, 241, 0.5)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const macdData = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: [{
      data: generateChartData(50, 1.5, 0, 0, 0.3),
      borderColor: 'rgba(79, 70, 229, 0.5)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Format data for charts
  const chartData = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: [
      {
        label: 'Strategy',
        data: baseData,
        borderColor: 'rgba(99, 102, 241, 0.5)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Benchmark',
        data: benchmarkData,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const volumeData = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: [{
      data: generateChartData(50, 2, 100, 0, 0.5),
      borderColor: 'rgba(79, 70, 229, 0.5)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const signalData = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: [{
      data: generateChartData(50, 1, 0, 0, 0.2),
      borderColor: 'rgba(99, 102, 241, 0.5)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const riskData = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: [{
      data: generateChartData(50, 1.5, 50, 0, 0.3),
      borderColor: 'rgba(79, 70, 229, 0.5)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  useEffect(() => {
    const animateCharts = () => {
      backgroundCharts.forEach((chart, index) => {
        if (chartRefs.current[index]) {
          const newData = generateChartData(100, 2 + Math.random() * 2, 50, (Math.random() - 0.5) * 10, 0.5);
          chartRefs.current[index].data.datasets[0].data = newData;
          chartRefs.current[index].update();
        }
      });
    };

    const interval = setInterval(animateCharts, 8000);
    return () => clearInterval(interval);
  }, []);

  const getStyleClasses = (style) => {
    const currentStyle = laptopStyles[style];
    return {
      container: `${currentStyle.bgColor} ${currentStyle.borderColor} border-2 rounded-lg shadow-2xl overflow-hidden`,
      header: `h-8 ${currentStyle.bgColor} flex items-center px-4 border-b ${currentStyle.borderColor}`,
      content: `relative aspect-[16/10] ${currentStyle.bgColor} p-4`,
      button: `bg-${currentStyle.accentColor}-500 hover:bg-${currentStyle.accentColor}-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`,
      metricCard: `bg-${currentStyle.accentColor}-500/10 backdrop-blur-sm rounded-lg p-3 border border-${currentStyle.accentColor}-500/20`,
    };
  };

  const renderLaptopSection = (style) => {
    const classes = getStyleClasses(style);
    
    return (
      <div className={classes.container}>
        {/* Laptop Top Bar */}
        <div className={classes.header}>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-gray-400 text-sm ml-4">Strategy Performance</div>
        </div>
        
        {/* Laptop Screen Content */}
        <div className={classes.content}>
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
                      borderColor: `rgb(var(--${laptopStyles[style].accentColor}-500))`,
                      borderWidth: 2,
                      fill: true,
                      backgroundColor: `rgba(var(--${laptopStyles[style].accentColor}-500), 0.1)`,
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
                <div className={`bg-${laptopStyles[style].accentColor}-600/20 backdrop-blur-sm rounded px-2 py-1`}>
                  <div className={`text-${laptopStyles[style].accentColor}-300 text-xs font-mono`}>ALPHA</div>
                  <div className="text-white text-sm font-mono">+0.24</div>
                </div>
                <div className="bg-green-600/20 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-green-300 text-xs font-mono">BETA</div>
                  <div className="text-white text-sm font-mono">0.82</div>
                </div>
              </div>
            </div>

            {/* Parameters Widget */}
            <div className={`w-64 bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-3`}>
              <div className={`text-${laptopStyles[style].accentColor}-300 text-sm mb-3 font-medium`}>Backtest Parameters</div>
              
              {/* Time Range Selector */}
              <div className="mb-4">
                <div className="text-gray-500 text-xs mb-1">Time Range</div>
                <div className="grid grid-cols-2 gap-2">
                  <button className={`bg-${laptopStyles[style].accentColor}-500/20 text-${laptopStyles[style].accentColor}-300 text-xs py-1.5 rounded hover:bg-${laptopStyles[style].accentColor}-500/30 transition-colors`}>1M</button>
                  <button className="bg-gray-700/50 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-700/70 transition-colors">3M</button>
                  <button className="bg-gray-700/50 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-700/70 transition-colors">6M</button>
                  <button className="bg-gray-700/50 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-700/70 transition-colors">1Y</button>
                </div>
              </div>

              {/* Strategy Parameters */}
              <div className="space-y-3">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Lookback Period</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">14 days</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Entry Threshold</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">0.75</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Exit Threshold</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">0.25</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Position Size</div>
                  <div className="bg-gray-700/50 rounded px-2 py-1.5 text-gray-300 text-xs">100%</div>
                </div>
              </div>

              {/* Run Button */}
              <button className={`w-full mt-4 bg-${laptopStyles[style].accentColor}-500/20 text-${laptopStyles[style].accentColor}-300 text-xs py-2 rounded hover:bg-${laptopStyles[style].accentColor}-500/30 transition-colors flex items-center justify-center gap-2`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Backtest
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-3 h-1/2">
            {/* Performance Metrics */}
            <div className={`bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${laptopStyles[style].accentColor}-500/10 rounded-full -mr-6 -mt-6`}></div>
              <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">PERF</div>
              <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">+24.8%</div>
              <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">YTD</div>
              <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-1</div>
            </div>

            {/* Volume Metrics */}
            <div className={`bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${laptopStyles[style].accentColor}-500/10 rounded-full -mr-6 -mt-6`}></div>
              <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">VOL</div>
              <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">1.2M</div>
              <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">24H</div>
              <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-2</div>
            </div>

            {/* Signal Metrics */}
            <div className={`bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${laptopStyles[style].accentColor}-500/10 rounded-full -mr-6 -mt-6`}></div>
              <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">SIG</div>
              <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">0.78</div>
              <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">STR</div>
              <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-3</div>
            </div>

            {/* Risk Metrics */}
            <div className={`bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${laptopStyles[style].accentColor}-500/10 rounded-full -mr-6 -mt-6`}></div>
              <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">RISK</div>
              <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">0.32</div>
              <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">BETA</div>
              <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-4</div>
            </div>

            {/* Additional Metrics */}
            <div className={`bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${laptopStyles[style].accentColor}-500/10 rounded-full -mr-6 -mt-6`}></div>
              <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">ALPHA</div>
              <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">0.15</div>
              <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">DAILY</div>
              <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-5</div>
            </div>

            <div className={`bg-${laptopStyles[style].accentColor}-500/10 backdrop-blur-sm rounded-lg p-2 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${laptopStyles[style].accentColor}-500/10 rounded-full -mr-6 -mt-6`}></div>
              <div className="text-white/20 text-[10px] font-mono mb-0.5 filter blur-[0.5px]">SHARPE</div>
              <div className="text-white/40 text-xs font-mono filter blur-[0.5px]">2.1</div>
              <div className="text-white/20 text-[10px] font-mono mt-1 filter blur-[0.5px]">RATIO</div>
              <div className="absolute bottom-0.5 right-0.5 text-white/10 text-[6px] font-mono">ALGO-6</div>
            </div>

            {/* New Styled Metrics Cards */}
            <div className="col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <div className="grid grid-rows-2 gap-4 h-full">
                {/* Win Rate Card */}
                <div className={`bg-${laptopStyles[style].accentColor}-500/10 rounded-lg p-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`text-${laptopStyles[style].accentColor}-300 text-sm mb-1`}>Win Rate</div>
                      <div className="text-2xl font-bold text-white">68.5%</div>
                      <div className="text-green-400 text-sm mt-1">↑ 2.3% from last month</div>
                    </div>
                    <div className={`bg-${laptopStyles[style].accentColor}-500/10 rounded-full p-2`}>
                      <svg className={`w-4 h-4 text-${laptopStyles[style].accentColor}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sharpe Ratio Card */}
                <div className={`bg-${laptopStyles[style].accentColor}-500/10 rounded-lg p-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`text-${laptopStyles[style].accentColor}-300 text-sm mb-1`}>Sharpe Ratio</div>
                      <div className="text-2xl font-bold text-white">2.4</div>
                      <div className="text-green-400 text-sm mt-1">Excellent risk-adjusted returns</div>
                    </div>
                    <div className={`bg-${laptopStyles[style].accentColor}-500/10 rounded-full p-2`}>
                      <svg className={`w-4 h-4 text-${laptopStyles[style].accentColor}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Background Charts */}
      <div className="absolute inset-0 z-0">
        {backgroundCharts.map((chart, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: chart.position.top,
              left: chart.position.left,
              transform: `rotate(${chart.position.rotate}deg)`,
              opacity: 0.1,
              width: '300px',
              height: '200px',
            }}
          >
            <Line
              ref={(el) => (chartRefs.current[index] = el)}
              data={{
                labels,
                datasets: [{
                  data: chart.data,
                  borderColor: chart.color.border,
                  backgroundColor: chart.color.fill,
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={chartOptions}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Algorithmic Trading</span>
            <span className="block text-indigo-400">Made Simple</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Build, test, and deploy algorithmic trading strategies with our powerful platform. 
            No coding required.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Start Free Trial
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>

        {/* Platform Preview */}
        <div className="mt-16">
          <LayoutSelector data={{
            chartData,
            volumeData,
            signalData,
            riskData,
            rsiData,
            macdData
          }} />
        </div>

        {/* Stats Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="text-gray-400 text-sm">Active Users</div>
              <div className="mt-2 text-3xl font-bold text-white">10,000+</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="text-gray-400 text-sm">Trading Volume</div>
              <div className="mt-2 text-3xl font-bold text-white">$1.2B+</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="text-gray-400 text-sm">Success Rate</div>
              <div className="mt-2 text-3xl font-bold text-white">85%</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="text-gray-400 text-sm">Support Response</div>
              <div className="mt-2 text-3xl font-bold text-white">&lt; 1hr</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
