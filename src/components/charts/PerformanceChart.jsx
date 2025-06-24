import React, { useEffect, useRef, useCallback } from 'react';
import { Chart } from 'chart.js/auto';

export const PerformanceChart = ({ data, title, height = 300, className = '', onLoad, onError, renderStartTime }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const hasReportedRef = useRef(false);

  // Use the passed render start time or fall back to component mount time
  const loadStartTime = useRef(renderStartTime || performance.now());

  // Memoize the callbacks to prevent unnecessary re-renders
  const handleLoad = useCallback(() => {
    if (onLoad && !hasReportedRef.current) {
      hasReportedRef.current = true;
      onLoad();
    }
  }, [onLoad]);

  const handleError = useCallback((error) => {
    if (onError && !hasReportedRef.current) {
      hasReportedRef.current = true;
      onError(error);
    }
  }, [onError]);

  useEffect(() => {
    console.log('[PERFORMANCE CHART] Component mounted, creating chart');
    
    if (!chartRef.current || !data) {
      console.warn('[PERFORMANCE CHART] Missing chart ref or data');
      if (handleError) handleError(new Error('Missing chart ref or data'));
      return;
    }

    try {
      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        console.log('[PERFORMANCE CHART] Destroying existing chart');
        chartInstanceRef.current.destroy();
      }

      console.log('[PERFORMANCE CHART] Creating new chart with data:', {
        labelsCount: data.labels?.length || 0,
        datasetsCount: data.datasets?.length || 0,
        firstDatasetDataCount: data.datasets?.[0]?.data?.length || 0
      });

      const ctx = chartRef.current.getContext('2d');
      
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: !!title,
              text: title || '',
              color: '#6B7280',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: '#6B7280'
              }
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              },
              ticks: {
                color: '#6B7280',
                maxTicksLimit: 8
              }
            },
            y: {
              display: true,
              grid: {
                color: 'rgba(107, 114, 128, 0.1)'
              },
              ticks: {
                color: '#6B7280',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          elements: {
            point: {
              radius: 0,
              hoverRadius: 4
            },
            line: {
              tension: 0.4
            }
          }
        }
      });

      // Chart created successfully
      const loadTime = performance.now() - loadStartTime.current;
      console.log(`[PERFORMANCE CHART] Chart created successfully in ${loadTime.toFixed(2)}ms`);
      
      if (handleLoad) {
        handleLoad();
      }

    } catch (error) {
      console.error('[PERFORMANCE CHART] Error creating chart:', error);
      const loadTime = performance.now() - loadStartTime.current;
      console.error(`[PERFORMANCE CHART] Chart failed after ${loadTime.toFixed(2)}ms:`, error);
      
      if (handleError) {
        handleError(error);
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        console.log('[PERFORMANCE CHART] Cleaning up chart instance');
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, title, handleLoad, handleError]);

  console.log('[PERFORMANCE CHART] Rendering chart component:', {
    hasData: !!data,
    title,
    height,
    className,
    renderStartTime: renderStartTime || 'not provided'
  });

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PerformanceChart;
