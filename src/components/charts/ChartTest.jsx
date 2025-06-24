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

const ChartTest = ({ data }) => {
  console.log('[CHART_TEST] Testing chart data:', data);

  if (!data) {
    console.error('[CHART_TEST] No data provided');
    return <div>No data provided</div>;
  }

  if (!data.labels || !data.datasets) {
    console.error('[CHART_TEST] Invalid data structure:', data);
    return <div>Invalid data structure</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
        },
      },
      y: {
        display: true,
        grid: {
          display: true,
        },
      },
    },
  };

  try {
    return (
      <div style={{ height: '200px', width: '100%' }}>
        <Line data={data} options={options} />
      </div>
    );
  } catch (error) {
    console.error('[CHART_TEST] Error rendering chart:', error);
    return <div>Error rendering chart: {error.message}</div>;
  }
};

export default ChartTest; 