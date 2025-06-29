import React, { useEffect, useRef, useCallback } from "react";
import { Chart } from "chart.js/auto";

export const LazyChart = ({
  chartData,
  title,
  height = 300,
  className = "",
  onLoad,
  onError,
  renderStartTime,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showAxes = true,
}) => {
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

  const handleError = useCallback(
    (error) => {
      if (onError && !hasReportedRef.current) {
        hasReportedRef.current = true;
        onError(error);
      }
    },
    [onError]
  );

  // Check if chart data is valid
  const hasValidChartData =
    chartData &&
    chartData.labels &&
    chartData.datasets &&
    chartData.datasets.length > 0 &&
    chartData.datasets.every(
      (dataset) => dataset.data && dataset.data.length > 0
    );

  useEffect(() => {
    console.log("[LAZY_CHART] Component mounted:", {
      title,
      hasChartData: !!chartData,
      hasValidChartData,
      chartDataKeys: chartData ? Object.keys(chartData) : null,
      datasetsCount: chartData?.datasets?.length || 0,
    });

    return () => {
      console.log("[LAZY_CHART] Component unmounted:", { title });
    };
  }, [title, chartData, hasValidChartData]);

  useEffect(() => {
    if (!hasValidChartData) {
      console.log("[LAZY_CHART] No valid chart data available:", {
        title,
        chartData,
      });
      return;
    }

    const ctx = chartRef.current;
    if (!ctx) {
      console.error("[LAZY_CHART] Canvas ref not available");
      return;
    }

    console.log("[LAZY_CHART] Creating chart:", {
      title,
      dataPoints: chartData.labels.length,
      datasets: chartData.datasets.length,
    });

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      console.log("[LAZY_CHART] Destroying existing chart");
      chartInstanceRef.current.destroy();
    }

    try {
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: !!title,
              text: title || "",
              color: "#6B7280",
              font: {
                size: 14,
                weight: "bold",
              },
            },
            legend: {
              display: showLegend,
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                color: "#6B7280",
              },
            },
            tooltip: {
              enabled: showTooltip,
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              borderColor: "#6B7280",
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              display: showAxes,
              grid: {
                display: showGrid,
                color: "rgba(107, 114, 128, 0.1)",
              },
              ticks: {
                color: "#6B7280",
                maxTicksLimit: 8,
              },
            },
            y: {
              display: showAxes,
              grid: {
                display: showGrid,
                color: "rgba(107, 114, 128, 0.1)",
              },
              ticks: {
                color: "#6B7280",
                callback: function (value) {
                  return "$" + value.toLocaleString();
                },
              },
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          elements: {
            point: {
              radius: 0,
              hoverRadius: 4,
            },
            line: {
              tension: 0.4,
            },
          },
        },
      });

      // Chart created successfully
      const loadTime = performance.now() - loadStartTime.current;
      console.log(
        `[LAZY_CHART] Chart created successfully in ${loadTime.toFixed(2)}ms`
      );

      if (handleLoad) {
        handleLoad();
      }
    } catch (error) {
      console.error("[LAZY_CHART] Error creating chart:", error);
      if (handleError) {
        handleError(error);
      }
    }
  }, [
    chartData,
    title,
    showLegend,
    showTooltip,
    showGrid,
    showAxes,
    handleLoad,
    handleError,
    hasValidChartData,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        console.log("[LAZY_CHART] Cleaning up chart on unmount");
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // If no valid chart data, show placeholder
  if (!hasValidChartData) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm font-medium">Chart data not available</p>
          {title && <p className="text-xs mt-1">{title}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  );
};
