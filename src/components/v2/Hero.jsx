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

// Sample data for the charts
const generateChartData = (baseValue, volatility, points, trend = 0) => {
  return Array.from({ length: points }, (_, i) => {
    const randomChange = (Math.random() - 0.5) * volatility;
    const trendEffect = (i / points) * trend;
    return baseValue + randomChange + trendEffect;
  });
};

// Generate profitable strategy data
const generateStrategyData = () => {
  const baseData = generateChartData(100, 2, 30, 15); // Upward trend
  const benchmarkData = generateChartData(100, 2, 30, 5); // Smaller upward trend
  return { baseData, benchmarkData };
};

// Generate static data for background waves
const generateWaveData = (baseValue, volatility, points, phase = 0) => {
  return Array.from({ length: points }, (_, i) => {
    const x = (i / points) * Math.PI * 2 + phase;
    return baseValue + Math.sin(x) * volatility;
  });
};

const waveData1 = generateWaveData(100, 5, 50, 0);
const waveData2 = generateWaveData(95, 3, 50, Math.PI / 4);
const waveData3 = generateWaveData(90, 4, 50, Math.PI / 2);
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
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  elements: {
    point: {
      radius: 2,
      borderWidth: 2,
      hoverRadius: 3,
      hoverBorderWidth: 2,
    },
    line: {
      tension: 0.4,
    },
  },
  animation: {
    duration: 2000,
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

export default function Hero() {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);

  useEffect(() => {
    const animateCharts = () => {
      if (chartRef1.current && chartRef2.current && chartRef3.current) {
        const newData1 = generateWaveData(100, 5, 50, Math.random() * Math.PI * 2);
        const newData2 = generateWaveData(95, 3, 50, Math.random() * Math.PI * 2);
        const newData3 = generateWaveData(90, 4, 50, Math.random() * Math.PI * 2);

        chartRef1.current.data.datasets[0].data = newData1;
        chartRef2.current.data.datasets[0].data = newData2;
        chartRef3.current.data.datasets[0].data = newData3;

        chartRef1.current.update();
        chartRef2.current.update();
        chartRef3.current.update();
      }
    };

    const interval = setInterval(animateCharts, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate static data for laptop charts
  const { baseData, benchmarkData } = generateStrategyData();

  return (
    <section className="relative text-white py-32 px-6 overflow-hidden">
      {/* Floating charts */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-48 opacity-10 transform -rotate-12">
          <Line
            ref={chartRef1}
            data={{
              labels,
              datasets: [
                {
                  data: waveData1,
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
            options={chartOptions}
          />
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-48 opacity-10 transform rotate-12">
          <Line
            ref={chartRef2}
            data={{
              labels,
              datasets: [
                {
                  data: waveData2,
                  borderColor: "#8b5cf6",
                  borderWidth: 2,
                  fill: true,
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  pointBackgroundColor: "#8b5cf6",
                  pointBorderColor: "#8b5cf6",
                  pointHoverBackgroundColor: "#8b5cf6",
                  pointHoverBorderColor: "#8b5cf6",
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-48 opacity-10">
          <Line
            ref={chartRef3}
            data={{
              labels,
              datasets: [
                {
                  data: waveData3,
                  borderColor: "#4f46e5",
                  borderWidth: 2,
                  fill: true,
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  pointBackgroundColor: "#4f46e5",
                  pointBorderColor: "#4f46e5",
                  pointHoverBackgroundColor: "#4f46e5",
                  pointHoverBorderColor: "#4f46e5",
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
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
      </div>
    </section>
  );
} 