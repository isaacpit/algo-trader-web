import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

// Simulated trading strategy performance data
const chartData = [
  { date: "Jan", strategy: 10000, benchmark: 10000, drawdown: 0 },
  { date: "Feb", strategy: 10500, benchmark: 10100, drawdown: -2 },
  { date: "Mar", strategy: 11200, benchmark: 10200, drawdown: -1 },
  { date: "Apr", strategy: 10800, benchmark: 10300, drawdown: -3 },
  { date: "May", strategy: 11500, benchmark: 10400, drawdown: -1 },
  { date: "Jun", strategy: 12200, benchmark: 10500, drawdown: -2 },
  { date: "Jul", strategy: 13000, benchmark: 10600, drawdown: -1 },
  { date: "Aug", strategy: 13800, benchmark: 10700, drawdown: -2 },
  { date: "Sep", strategy: 14500, benchmark: 10800, drawdown: -1 },
  { date: "Oct", strategy: 15200, benchmark: 10900, drawdown: -2 },
  { date: "Nov", strategy: 16000, benchmark: 11000, drawdown: -1 },
  { date: "Dec", strategy: 16800, benchmark: 11100, drawdown: -2 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-indigo-600">
          Strategy: ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-gray-600">
          Benchmark: ${payload[1].value.toLocaleString()}
        </p>
        <p className="text-red-500">
          Drawdown: {payload[2].value}%
        </p>
      </div>
    );
  }
  return null;
};

export const ChartDemo = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Real-Time Performance Analytics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your strategy's performance against benchmarks with detailed metrics and visualizations
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Performance</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="strategyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="strategy"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#strategyGradient)"
                    name="Strategy"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#9ca3af"
                    fillOpacity={1}
                    fill="url(#benchmarkGradient)"
                    name="Benchmark"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Return</p>
                  <p className="text-2xl font-bold text-indigo-600">+68%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-indigo-600">2.1</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Max Drawdown</p>
                  <p className="text-2xl font-bold text-red-500">-3%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">65%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="drawdown"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Drawdown %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChartDemo;
