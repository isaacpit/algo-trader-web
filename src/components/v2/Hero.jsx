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
import { LayoutSelector } from '../laptop-previews/LayoutSelector';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

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
    const base = 50 + (i * 0.5); // Upward trend
    const noise = (Math.random() - 0.5) * 2; // Small random noise
    return base + noise;
  }),
  // Bearish trend
  Array.from({ length: 100 }, (_, i) => {
    const base = 50 - (i * 0.3); // Downward trend
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
  })
];

// Generate chart data with minor variations
const generateChartData = (patternIndex) => {
  const basePattern = chartPatterns[patternIndex];
  return basePattern.map(value => {
    const variation = (Math.random() - 0.5) * 1; // Very small random variation
    return Math.max(0, value + variation);
  });
};

// Generate chart title
const generateChartTitle = () => {
  const prefixes = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'THETA', 'OMEGA'];
  const suffixes = ['STRAT', 'SIG', 'IND', 'MOM', 'VOL', 'TREND', 'RSI', 'MACD'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}-${suffix}`;
};

// Generate derived metrics
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

// Generate initial strategy data
const generateStrategyData = () => {
  const baseData = generateChartData(Math.floor(Math.random() * chartPatterns.length));
  const benchmarkData = generateChartData(Math.floor(Math.random() * chartPatterns.length));
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
});

// Generate background charts
const generateBackgroundCharts = (isDarkMode) => {
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
    const data = generateChartData(Math.floor(Math.random() * chartPatterns.length));
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
const surroundingWindows = [
  {
    id: 'market-overview',
    title: 'Market Overview',
    position: { top: '5%', right: '5%' },
    size: { width: '300px', height: '200px' },
    type: 'laptop',
    data: {
      labels: Array.from({ length: 20 }, (_, i) => i),
      datasets: [{
        data: [65, 59, 80, 81, 56, 55, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 85, 80, 75],
        borderColor: 'rgba(99, 102, 241, 0.5)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    }
  },
  {
    id: 'active-signals',
    title: 'Active Signals',
    position: { bottom: '10%', left: '5%' },
    size: { width: '250px', height: '180px' },
    type: 'laptop',
    items: [
      { name: 'BTC/USD', signal: 'BUY', confidence: '85%' },
      { name: 'ETH/USD', signal: 'SELL', confidence: '72%' },
      { name: 'SOL/USD', signal: 'HOLD', confidence: '65%' },
    ]
  },
  {
    id: 'performance',
    title: 'Performance',
    position: { top: '30%', left: '5%' },
    size: { width: '280px', height: '220px' },
    type: 'laptop',
    data: {
      labels: Array.from({ length: 15 }, (_, i) => i),
      datasets: [{
        data: [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70, 65],
        borderColor: 'rgba(16, 185, 129, 0.5)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    }
  },
  {
    id: 'market-depth',
    title: 'Market Depth',
    position: { bottom: '15%', right: '5%' },
    size: { width: '320px', height: '240px' },
    type: 'laptop',
    data: {
      labels: Array.from({ length: 25 }, (_, i) => i),
      datasets: [{
        data: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30],
        borderColor: 'rgba(245, 158, 11, 0.5)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    }
  }
];

export const Hero = () => {
    const { isDarkMode } = useTheme();
    const [backgroundCharts, setBackgroundCharts] = useState(generateBackgroundCharts(isDarkMode));
    const chartRefs = useRef(backgroundCharts.map(() => null));
    const [strategyData] = useState(generateStrategyData());
    const { baseData, benchmarkData } = strategyData;

    // Update background charts when theme changes
    useEffect(() => {
        setBackgroundCharts(generateBackgroundCharts(isDarkMode));
    }, [isDarkMode]);

    // Animate background charts with reduced frequency
    useEffect(() => {
        const interval = setInterval(() => {
            setBackgroundCharts(prevCharts =>
                prevCharts.map(chart => ({
                    ...chart,
                    data: generateChartData(Math.floor(Math.random() * chartPatterns.length)),
                }))
            );
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const renderWindow = (window) => {
        const baseClasses = `absolute rounded-lg shadow-lg overflow-hidden backdrop-blur-sm bg-gray-900 border border-gray-700`;

        return (
            <div
                key={window.id}
                className={baseClasses}
                style={{
                    ...window.position,
                    ...window.size,
                }}
            >
                {/* Laptop Top Bar */}
                <div className="h-6 bg-gray-800 flex items-center px-3">
                    <div className="flex space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-gray-400 text-xs ml-3">{window.title}</div>
                </div>
                
                {/* Laptop Screen Content */}
                <div className="aspect-[16/10] bg-gray-900 p-2">
                    {window.type === 'chart' && (
                        <Line
                            data={window.data}
                            options={getChartOptions(isDarkMode)}
                        />
                    )}
                    {window.type === 'list' && (
                        <div className="space-y-2">
                            {window.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className={`px-2 py-1 rounded ${
                                        item.signal === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                        item.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {item.signal}
                                    </span>
                                    <span className="text-gray-400">{item.confidence}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="relative text-gray-900 dark:text-white py-32 px-6 overflow-hidden">
            {/* Background charts */}
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
                                    labels: Array.from({ length: chart.data.length }, (_, i) => i),
                                    datasets: [
                                        {
                                            data: chart.data,
                                            borderColor: chart.color.border,
                                            backgroundColor: chart.color.fill,
                                            fill: true,
                                            tension: 0.4,
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
                                        },
                                    },
                                    scales: {
                                        ...getChartOptions(isDarkMode).scales,
                                        x: {
                                            ...getChartOptions(isDarkMode).scales.x,
                                            title: {
                                                ...getChartOptions(isDarkMode).scales.x.title,
                                                text: chart.axisLabels.x,
                                            },
                                        },
                                        y: {
                                            ...getChartOptions(isDarkMode).scales.y,
                                            title: {
                                                ...getChartOptions(isDarkMode).scales.y.title,
                                                text: chart.axisLabels.y,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Surrounding windows */}
            {surroundingWindows.map(renderWindow)}

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                        <span className="block">Algorithmic Trading</span>
                        <span className="block text-indigo-600 dark:text-indigo-400">Made Simple</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Build, test, and deploy your trading strategies with our powerful platform.
                        Start trading smarter today.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="rounded-md shadow">
                            <Link
                                to="/signup"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-16">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25"></div>
                        <div className="relative">
                            <LayoutSelector />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
