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
import { Link } from 'react-router-dom';

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

// Generate initial strategy data outside component
const initialStrategyData = generateStrategyData();

const Hero = () => {
  const chartRefs = useRef(backgroundCharts.map(() => null));
  const [strategyData] = useState(initialStrategyData);
  const { baseData, benchmarkData } = strategyData;

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
          chartRef.update('none');
        }
      });
    };

    const interval = setInterval(animateCharts, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative text-gray-900 dark:text-white py-32 px-6 overflow-hidden">
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
                      color: 'rgba(0, 0, 0, 0.15)',
                    },
                  },
                  scales: {
                    x: {
                      ...chartOptions.scales.x,
                      title: {
                        ...chartOptions.scales.x.title,
                        text: chart.axisLabels.x,
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                      grid: {
                        ...chartOptions.scales.x.grid,
                        color: 'rgba(0, 0, 0, 0.02)',
                      },
                      border: {
                        ...chartOptions.scales.x.border,
                        color: 'rgba(0, 0, 0, 0.08)',
                      },
                    },
                    y: {
                      ...chartOptions.scales.y,
                      title: {
                        ...chartOptions.scales.y.title,
                        text: chart.axisLabels.y,
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                      grid: {
                        ...chartOptions.scales.y.grid,
                        color: 'rgba(0, 0, 0, 0.02)',
                      },
                      border: {
                        ...chartOptions.scales.y.border,
                        color: 'rgba(0, 0, 0, 0.08)',
                      },
                    },
                  },
                }}
              />
              {/* Metrics Panel */}
              <div className="absolute top-2 right-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded p-2 text-xs font-mono">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-600 dark:text-white/20">CHG</div>
                    <div className="text-gray-800 dark:text-white/40">{chart.metrics.change}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-white/20">VOL</div>
                    <div className="text-gray-800 dark:text-white/40">{chart.metrics.volatility}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-white/20">AVG</div>
                    <div className="text-gray-800 dark:text-white/40">{chart.metrics.average}</div>
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
            <span className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium">
              Professional-Grade Trading Platform
            </span>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Build. Test. Trade.
          </h1>
          <p className="text-2xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Design sophisticated trading algorithms, backtest them with precision, and optimize your strategy with institutional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/google-signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              Get Started
            </Link>
            <button
              onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-white/10">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">10+</div>
            <div className="text-gray-600 dark:text-gray-300">Years of Historical Data</div>
          </div>
          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-white/10">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-300">Backtest Accuracy</div>
          </div>
          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-white/10">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-300">Active Traders</div>
          </div>
        </div>

        {/* Platform Preview */}
        <div className="mt-16">
          <LayoutSelector data={{
            chartData: {
              labels: Array.from({ length: 100 }, (_, i) => i),
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
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  fill: true,
                  tension: 0.4
                }
              ]
            },
            volumeData: {
              labels: Array.from({ length: 50 }, (_, i) => i),
              datasets: [{
                data: generateChartData(50, 2, 100, 0, 0.5),
                borderColor: 'rgba(79, 70, 229, 0.5)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4
              }]
            },
            signalData: {
              labels: Array.from({ length: 50 }, (_, i) => i),
              datasets: [{
                data: generateChartData(50, 1, 0, 0, 0.2),
                borderColor: 'rgba(99, 102, 241, 0.5)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
              }]
            },
            riskData: {
              labels: Array.from({ length: 50 }, (_, i) => i),
              datasets: [{
                data: generateChartData(50, 1.5, 50, 0, 0.3),
                borderColor: 'rgba(79, 70, 229, 0.5)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4
              }]
            },
            rsiData: {
              labels: Array.from({ length: 50 }, (_, i) => i),
              datasets: [{
                data: generateChartData(50, 1, 50, 0, 0.2),
                borderColor: 'rgba(99, 102, 241, 0.5)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
              }]
            },
            macdData: {
              labels: Array.from({ length: 50 }, (_, i) => i),
              datasets: [{
                data: generateChartData(50, 1.5, 0, 0, 0.3),
                borderColor: 'rgba(79, 70, 229, 0.5)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4
              }]
            }
          }} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
