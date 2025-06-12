import React from 'react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

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

const PerformanceChart = ({ 
  data = {
    labels: [],
    datasets: []
  },
  height = '300px',
  showLegend = true,
  showTooltip = true,
  showGrid = false,
  showAxes = false,
  fill = true,
  tension = 0.4,
  pointRadius = 0,
  borderWidth = 2,
  className = '',
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: showLegend,
        position: 'top',
        labels: {
          color: 'rgba(156,163,175,0.8)',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: { 
        enabled: showTooltip,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        display: showAxes,
        grid: {
          display: showGrid,
          color: 'rgba(75, 85, 99, 0.1)',
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
        }
      },
      y: {
        display: showAxes,
        grid: {
          display: showGrid,
          color: 'rgba(75, 85, 99, 0.1)',
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: { 
        radius: pointRadius,
        hitRadius: 10,
        hoverRadius: 4,
      },
      line: { 
        tension: tension,
        borderWidth: borderWidth,
      },
    },
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default PerformanceChart; 