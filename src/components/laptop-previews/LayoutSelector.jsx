import React, { useState, useMemo } from "react";
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
import { ModernLayout } from "./ModernLayout";
import { CommandCenterLayout } from "./CommandCenterLayout";
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

// Predefined chart patterns with technical analysis overlays
const chartPatterns = {
  strategy: [
    // Complex uptrend with pullbacks and support/resistance
    {
      data: Array.from({ length: 50 }, (_, i) => {
        const base = 50 + i * 0.4;
        const pullback = i > 15 && i < 25 ? -3 : 0;
        const volatility = Math.sin(i * 0.3) * 2;
        const noise = (Math.random() - 0.5) * 0.5;
        return base + pullback + volatility + noise;
      }),
      overlays: [
        {
          type: "trendline",
          points: [0, 15, 25, 49],
          color: "rgba(16,185,129,0.3)",
          label: "Uptrend Support",
        },
        {
          type: "highlight",
          start: 15,
          end: 25,
          color: "rgba(245,158,11,0.2)",
          label: "Pullback to Support",
          outcome: "+12.5% after breakout",
        },
        {
          type: "trendline",
          points: [25, 35, 49],
          color: "rgba(16,185,129,0.3)",
          label: "Resumption of Trend",
        },
      ],
    },
    // Wavy sideways with breakout and volume confirmation
    {
      data: Array.from({ length: 50 }, (_, i) => {
        const base = 50 + Math.sin(i * 0.2) * 3;
        const breakout = i > 35 ? (i - 35) * 0.8 : 0;
        const noise = (Math.random() - 0.5) * 0.5;
        return base + breakout + noise;
      }),
      overlays: [
        {
          type: "channel",
          top: [0, 35],
          bottom: [0, 35],
          color: "rgba(99,102,241,0.2)",
          label: "Consolidation Channel",
        },
        {
          type: "highlight",
          start: 35,
          end: 49,
          color: "rgba(16,185,129,0.2)",
          label: "Volume Breakout",
          outcome: "+8.3% in 14 periods",
        },
        {
          type: "trendline",
          points: [35, 42, 49],
          color: "rgba(16,185,129,0.3)",
          label: "Breakout Trend",
        },
      ],
    },
  ],
  rsi: [
    // RSI with divergences and overbought/oversold
    {
      data: Array.from({ length: 50 }, (_, i) => {
        const base = 50 + Math.sin(i * 0.2) * 30;
        const divergence = i > 20 && i < 30 ? -15 : 0;
        const noise = (Math.random() - 0.5) * 2;
        return Math.min(100, Math.max(0, base + divergence + noise));
      }),
      overlays: [
        {
          type: "highlight",
          start: 10,
          end: 20,
          color: "rgba(239,68,68,0.2)",
          label: "Overbought Zone",
          outcome: "Price dropped 5.2%",
        },
        {
          type: "highlight",
          start: 20,
          end: 30,
          color: "rgba(16,185,129,0.2)",
          label: "Bullish Divergence",
          outcome: "Reversal +7.8%",
        },
        {
          type: "trendline",
          points: [20, 25, 30],
          color: "rgba(16,185,129,0.3)",
          label: "Divergence Line",
        },
      ],
    },
  ],
  volume: [
    // Volume with accumulation/distribution
    {
      data: Array.from({ length: 50 }, (_, i) => {
        const base = 20 + Math.sin(i * 0.3) * 10;
        const accumulation = i > 15 && i < 25 ? 30 : 0;
        const distribution = i > 35 && i < 45 ? 25 : 0;
        const noise = (Math.random() - 0.5) * 2;
        return base + accumulation + distribution + noise;
      }),
      overlays: [
        {
          type: "highlight",
          start: 15,
          end: 25,
          color: "rgba(16,185,129,0.2)",
          label: "Accumulation Phase",
          outcome: "Price increased 6.4%",
        },
        {
          type: "highlight",
          start: 35,
          end: 45,
          color: "rgba(239,68,68,0.2)",
          label: "Distribution Phase",
          outcome: "Price decreased 4.8%",
        },
        {
          type: "trendline",
          points: [15, 20, 25],
          color: "rgba(16,185,129,0.3)",
          label: "Accumulation Trend",
        },
      ],
    },
  ],
  macd: [
    // MACD with crossovers and divergences
    {
      data: Array.from({ length: 50 }, (_, i) => {
        const base = Math.sin(i * 0.2) * 10;
        const crossover = i > 25 ? 15 : -15;
        const divergence = i > 35 ? -8 : 0;
        const noise = (Math.random() - 0.5) * 1;
        return base + crossover + divergence + noise;
      }),
      overlays: [
        {
          type: "highlight",
          start: 20,
          end: 30,
          color: "rgba(99,102,241,0.2)",
          label: "Bullish Crossover",
          outcome: "Price rallied 9.2%",
        },
        {
          type: "highlight",
          start: 35,
          end: 45,
          color: "rgba(239,68,68,0.2)",
          label: "Bearish Divergence",
          outcome: "Price dropped 5.6%",
        },
        {
          type: "trendline",
          points: [25, 30, 35],
          color: "rgba(99,102,241,0.3)",
          label: "MACD Trend",
        },
      ],
    },
  ],
  risk: [
    // Risk metrics with volatility spikes
    {
      data: Array.from({ length: 50 }, (_, i) => {
        const base = 30 + Math.sin(i * 0.2) * 10;
        const spike = i > 15 && i < 25 ? 40 : 0;
        const correction = i > 35 ? -20 : 0;
        const noise = (Math.random() - 0.5) * 2;
        return base + spike + correction + noise;
      }),
      overlays: [
        {
          type: "highlight",
          start: 15,
          end: 25,
          color: "rgba(239,68,68,0.2)",
          label: "Volatility Spike",
          outcome: "Max Drawdown -12.3%",
        },
        {
          type: "highlight",
          start: 35,
          end: 45,
          color: "rgba(16,185,129,0.2)",
          label: "Risk Normalization",
          outcome: "Recovery +8.7%",
        },
        {
          type: "trendline",
          points: [25, 30, 35],
          color: "rgba(16,185,129,0.3)",
          label: "Risk Reduction",
        },
      ],
    },
  ],
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

const layouts = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, modern layout with focus on performance metrics",
    component: ModernLayout,
  },
  {
    id: "command",
    name: "Command Center",
    description: "Command center style with multiple panels and controls",
    component: CommandCenterLayout,
  },
];

export const LayoutSelector = ({ data }) => {
  const [selectedLayout, setSelectedLayout] = useState("modern");
  const { isDarkMode } = useTheme();

  const SelectedLayout = layouts.find(
    (layout) => layout.id === selectedLayout
  ).component;

  // Generate chart data with overlays
  const chartData = useMemo(() => {
    const generatedData = generateChartData("strategy");
    return {
      labels: Array.from({ length: 50 }, (_, i) => i.toString()),
      datasets: [
        {
          label: "Strategy",
          data: generatedData.data,
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          label: "Market",
          data: generatedData.marketData,
          borderColor: isDarkMode
            ? "rgba(255, 255, 255, 0.4)"
            : "rgba(0, 0, 0, 0.4)",
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
      ],
      overlays: generatedData.overlays,
    };
  }, [isDarkMode]);

  return (
    <div className="space-y-8">
      {/* Layout Selector */}
      <div
        className={`${
          isDarkMode ? "bg-gray-800/30" : "bg-white/80"
        } rounded-lg p-4 border ${
          isDarkMode ? "border-white/10" : "border-gray-200"
        }`}
      >
        <div
          className={`text-sm mb-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Select Layout
        </div>
        <div className="grid grid-cols-2 gap-4">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-4 rounded-lg transition-all ${
                selectedLayout === layout.id
                  ? isDarkMode
                    ? "bg-indigo-500/20 border border-indigo-500/50"
                    : "bg-indigo-100 border border-indigo-300"
                  : isDarkMode
                  ? "bg-gray-700/30 hover:bg-gray-700/50"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {layout.name}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {layout.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Layout - Fixed Height Container */}
      <div className="h-[700px] relative">
        <div className="absolute inset-0">
          <SelectedLayout data={chartData} />
        </div>
      </div>
    </div>
  );
};
