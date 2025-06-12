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

// Generate random data for charts
const generateChartData = (length, volatility, baseValue, min, max) => {
  return Array.from({ length }, () => {
    const value = baseValue + (Math.random() * (max - min) + min);
    return Math.max(0, value + (Math.random() - 0.5) * volatility);
  });
};

// Generate initial strategy data
const generateStrategyData = () => {
  const baseData = generateChartData(100, 2, 50, 0, 100);
  const benchmarkData = generateChartData(100, 1.5, 45, 0, 90);
  return { baseData, benchmarkData };
};

// Generate background charts
const generateBackgroundCharts = (isDarkMode) => {
  return [
    {
      position: { top: '10%', left: '5%', rotate: -15 },
      width: '300px',
      height: '200px',
      data: generateChartData(50, 2, 50, 0, 100),
      color: {
        border: isDarkMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)',
        fill: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
      },
      title: 'Market Overview',
      axisLabels: { x: 'Time', y: 'Price' },
      metrics: {
        change: '+2.5%',
        volatility: '1.2%',
        average: '45.8',
      },
    },
    {
      position: { bottom: '15%', right: '5%', rotate: 15 },
      width: '350px',
      height: '250px',
      data: generateChartData(50, 1.5, 60, 0, 120),
      color: {
        border: isDarkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)',
        fill: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
      },
      title: 'Performance',
      axisLabels: { x: 'Time', y: 'Value' },
      metrics: {
        change: '+1.8%',
        volatility: '0.9%',
        average: '58.3',
      },
    },
  ];
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
      borderWidth: 2,
    },
  },
  animation: {
    duration: 0,
  },
});

// Predefined window data
const surroundingWindows = [
  {
    id: 'market-overview',
    title: 'Market Overview',
    position: { top: '5%', right: '5%' },
    size: { width: '300px', height: '200px' },
    type: 'chart',
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
    type: 'list',
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
    type: 'chart',
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
    type: 'chart',
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

    // Animate background charts
    useEffect(() => {
        const interval = setInterval(() => {
            setBackgroundCharts(prevCharts =>
                prevCharts.map(chart => ({
                    ...chart,
                    data: generateChartData(50, 2, 50, 0, 100),
                }))
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const renderWindow = (window) => {
        const baseClasses = `absolute rounded-lg shadow-lg overflow-hidden backdrop-blur-sm ${
            isDarkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
        }`;

        return (
            <div
                key={window.id}
                className={baseClasses}
                style={{
                    ...window.position,
                    ...window.size,
                }}
            >
                <div className={`px-4 py-2 border-b ${
                    isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
                }`}>
                    <h3 className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                        {window.title}
                    </h3>
                </div>
                <div className="p-4">
                    {window.type === 'chart' && (
                        <Line
                            data={window.data}
                            options={{
                                ...getChartOptions(isDarkMode),
                                plugins: {
                                    ...getChartOptions(isDarkMode).plugins,
                                    legend: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    ...getChartOptions(isDarkMode).scales,
                                    x: {
                                        ...getChartOptions(isDarkMode).scales.x,
                                        display: false,
                                    },
                                    y: {
                                        ...getChartOptions(isDarkMode).scales.y,
                                        display: false,
                                    },
                                },
                            }}
                        />
                    )}
                    {window.type === 'list' && (
                        <div className="space-y-2">
                            {window.items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded ${
                                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                    }`}
                                >
                                    <span className={`text-sm ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        {item.name}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            item.signal === 'BUY'
                                                ? 'bg-green-500/20 text-green-500'
                                                : item.signal === 'SELL'
                                                ? 'bg-red-500/20 text-red-500'
                                                : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                            {item.signal}
                                        </span>
                                        <span className={`text-xs ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            {item.confidence}
                                        </span>
                                    </div>
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
                        options={getChartOptions(isDarkMode)}
                    />
                </div>
            ))}

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
                    <LayoutSelector />
                </div>
            </div>
        </section>
    );
};
