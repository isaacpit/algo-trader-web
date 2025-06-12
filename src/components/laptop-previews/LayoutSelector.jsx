import React, { useState, useMemo } from 'react';
import { ModernLayout } from './ModernLayout';
import { GridLayout } from './GridLayout';
import { CommandCenterLayout } from './CommandCenterLayout';
import { MinimalLayout } from './MinimalLayout';
import { TechnicalLayout } from './TechnicalLayout';

// Generate chart data
const generateChartData = (length, volatility, baseValue, min, max) => {
  return Array.from({ length }, () => {
    const value = baseValue + (Math.random() * (max - min) + min);
    return Math.max(0, value + (Math.random() - 0.5) * volatility);
  });
};

const layouts = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, modern layout with focus on performance metrics',
    component: ModernLayout
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Grid-based layout with multiple charts and metrics',
    component: GridLayout
  },
  {
    id: 'command',
    name: 'Command Center',
    description: 'Command center style with multiple panels and controls',
    component: CommandCenterLayout
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Minimal layout focusing on essential information',
    component: MinimalLayout
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Technical analysis focused with multiple indicators',
    component: TechnicalLayout
  }
];

export const LayoutSelector = ({ data }) => {
  const [selectedLayout, setSelectedLayout] = useState('modern');
  
  const SelectedLayout = layouts.find(layout => layout.id === selectedLayout).component;

  // Generate consistent chart data
  const chartData = useMemo(() => {
    const baseData = generateChartData(50, 2, 50, 0, 100);
    const benchmarkData = generateChartData(50, 1.5, 45, 0, 90);
    const rsiData = generateChartData(20, 1, 50, 0, 100);
    const volumeData = generateChartData(20, 1.5, 30, 0, 60);
    const macdData = generateChartData(20, 1.2, 0, -20, 20);
    const riskData = generateChartData(20, 0.8, 0.5, 0, 1);

    return {
      chartData: {
        labels: Array(50).fill(''),
        datasets: [
          {
            label: 'Strategy',
            data: baseData,
            borderColor: 'rgba(99,102,241,0.8)',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Market',
            data: benchmarkData,
            borderColor: 'rgba(156,163,175,0.5)',
            backgroundColor: 'rgba(156,163,175,0.05)',
            fill: true,
            tension: 0.1,
            borderDash: [5, 5]
          }
        ]
      },
      benchmarkData,
      rsiData: {
        labels: Array(20).fill(''),
        datasets: [{
          label: 'RSI',
          data: rsiData,
          borderColor: 'rgba(16,185,129,0.8)',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      volumeData: {
        labels: Array(20).fill(''),
        datasets: [{
          label: 'Volume',
          data: volumeData,
          borderColor: 'rgba(245,158,11,0.8)',
          backgroundColor: 'rgba(245,158,11,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      macdData: {
        labels: Array(20).fill(''),
        datasets: [{
          label: 'MACD',
          data: macdData,
          borderColor: 'rgba(99,102,241,0.8)',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      riskData: {
        labels: Array(20).fill(''),
        datasets: [{
          label: 'Risk',
          data: riskData,
          borderColor: 'rgba(239,68,68,0.8)',
          backgroundColor: 'rgba(239,68,68,0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Layout Selector */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="text-gray-400 text-sm mb-4">Select Layout</div>
        <div className="grid grid-cols-5 gap-4">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-4 rounded-lg transition-all ${
                selectedLayout === layout.id
                  ? 'bg-indigo-500/20 border border-indigo-500/50'
                  : 'bg-gray-700/30 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-white font-medium mb-1">{layout.name}</div>
              <div className="text-gray-400 text-xs">{layout.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Layout */}
      <div className="relative">
        <SelectedLayout data={chartData} />
      </div>
    </div>
  );
}; 