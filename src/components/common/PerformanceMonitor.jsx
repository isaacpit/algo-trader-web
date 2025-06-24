import React, { useState, useEffect } from 'react';

export const PerformanceMonitor = ({ isVisible = true }) => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    chartRenderCount: 0,
    totalCharts: 0,
    averageChartLoadTime: 0,
    totalChartLoadTime: 0,
    memoryUsage: 0,
    pageLoadStartTime: 0,
    chartsLoaded: 0,
    chartsFailed: 0,
    currentPage: 1,
    itemsPerPage: 10,
    // API tracking
    apiCallCount: 0,
    totalApiLoadTime: 0,
    averageApiLoadTime: 0,
    apiCallsSucceeded: 0,
    apiCallsFailed: 0
  });

  useEffect(() => {
    // Record page load start time
    const loadStartTime = performance.now();
    setMetrics(prev => ({ ...prev, pageLoadStartTime: loadStartTime }));

    // Measure page load time using a more reliable method
    const measurePageLoadTime = () => {
      // Measure the time from component mount until the next tick
      // This gives us a reasonable approximation of initial render time
      const loadTime = performance.now() - loadStartTime;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    // This ensures we measure after the initial render cycle
    if (window.requestIdleCallback) {
      window.requestIdleCallback(measurePageLoadTime);
    } else {
      // Use a small delay to ensure initial render is complete
      setTimeout(measurePageLoadTime, 10);
    }

    // Monitor memory usage if available
    if (performance.memory) {
      const updateMemoryUsage = () => {
        const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        setMetrics(prev => ({ ...prev, memoryUsage: memoryMB }));
      };
      
      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  // Function to track chart rendering
  const trackChartRender = (loadTime, success = true) => {
    setMetrics(prev => {
      const newCount = prev.chartRenderCount + 1;
      const newTotalTime = prev.totalChartLoadTime + loadTime;
      const newAverage = newTotalTime / newCount;
      const newChartsLoaded = success ? prev.chartsLoaded + 1 : prev.chartsLoaded;
      const newChartsFailed = success ? prev.chartsFailed : prev.chartsFailed + 1;
      
      return {
        ...prev,
        chartRenderCount: newCount,
        totalChartLoadTime: newTotalTime,
        averageChartLoadTime: newAverage,
        chartsLoaded: newChartsLoaded,
        chartsFailed: newChartsFailed
      };
    });
  };

  // Function to track API calls
  const trackApiCall = (loadTime, success = true) => {
    setMetrics(prev => {
      const newCount = prev.apiCallCount + 1;
      const newTotalTime = prev.totalApiLoadTime + loadTime;
      const newAverage = newTotalTime / newCount;
      const newApiCallsSucceeded = success ? prev.apiCallsSucceeded + 1 : prev.apiCallsSucceeded;
      const newApiCallsFailed = success ? prev.apiCallsFailed : prev.apiCallsFailed + 1;
      
      return {
        ...prev,
        apiCallCount: newCount,
        totalApiLoadTime: newTotalTime,
        averageApiLoadTime: newAverage,
        apiCallsSucceeded: newApiCallsSucceeded,
        apiCallsFailed: newApiCallsFailed
      };
    });
  };

  // Function to set total charts
  const setTotalCharts = (total) => {
    setMetrics(prev => ({ ...prev, totalCharts: total }));
  };

  // Function to update page info
  const updatePageInfo = (page, itemsPerPage) => {
    setMetrics(prev => ({ ...prev, currentPage: page, itemsPerPage }));
  };

  // Function to reset metrics for new page
  const resetChartMetrics = () => {
    setMetrics(prev => ({
      ...prev,
      chartRenderCount: 0,
      totalChartLoadTime: 0,
      averageChartLoadTime: 0,
      chartsLoaded: 0,
      chartsFailed: 0,
      // Reset API metrics too
      apiCallCount: 0,
      totalApiLoadTime: 0,
      averageApiLoadTime: 0,
      apiCallsSucceeded: 0,
      apiCallsFailed: 0
    }));
  };

  // Expose functions globally for other components to use
  React.useEffect(() => {
    window.trackChartRender = trackChartRender;
    window.trackApiCall = trackApiCall;
    window.setTotalCharts = setTotalCharts;
    window.updatePageInfo = updatePageInfo;
    window.resetChartMetrics = resetChartMetrics;
    return () => {
      delete window.trackChartRender;
      delete window.trackApiCall;
      delete window.setTotalCharts;
      delete window.updatePageInfo;
      delete window.resetChartMetrics;
    };
  }, []);

  const formatTime = (ms) => {
    // Handle invalid or negative values
    if (!ms || ms < 0 || isNaN(ms)) {
      return 'N/A';
    }
    
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getProgressPercentage = () => {
    if (metrics.totalCharts === 0) return 0;
    return (metrics.chartRenderCount / metrics.totalCharts) * 100;
  };

  const getSuccessRate = () => {
    if (metrics.chartRenderCount === 0) return 0;
    return (metrics.chartsLoaded / metrics.chartRenderCount) * 100;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-semibold mb-3 text-sm border-b border-gray-600 pb-2">
        📊 Performance Monitor
      </div>
      
      <div className="space-y-2">
        {/* Page Load Time */}
        <div className="flex justify-between">
          <span>Page Load:</span>
          <span className={
            !metrics.pageLoadTime || metrics.pageLoadTime === 0 ? 'text-gray-400' :
            metrics.pageLoadTime > 2000 ? 'text-yellow-400' : 'text-green-400'
          }>
            {formatTime(metrics.pageLoadTime)}
          </span>
        </div>

        {/* Current Page Info */}
        <div className="flex justify-between">
          <span>Page:</span>
          <span>{metrics.currentPage} ({metrics.itemsPerPage} items)</span>
        </div>

        {/* Chart Progress */}
        <div className="flex justify-between">
          <span>Charts:</span>
          <span>{metrics.chartRenderCount}/{metrics.totalCharts}</span>
        </div>

        {/* Progress Bar */}
        {metrics.totalCharts > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        )}

        {/* Average Chart Load Time */}
        <div className="flex justify-between">
          <span>Avg Chart Load:</span>
          <span className={metrics.averageChartLoadTime > 500 ? 'text-yellow-400' : 'text-green-400'}>
            {formatTime(metrics.averageChartLoadTime)}
          </span>
        </div>

        {/* API Load Time */}
        <div className="flex justify-between">
          <span>Avg API Load:</span>
          <span className={metrics.averageApiLoadTime > 1000 ? 'text-yellow-400' : 'text-green-400'}>
            {formatTime(metrics.averageApiLoadTime)}
          </span>
        </div>

        {/* API Call Count */}
        <div className="flex justify-between text-xs text-gray-300">
          <span>API Calls: {metrics.apiCallCount}</span>
          <span>✅ {metrics.apiCallsSucceeded} ❌ {metrics.apiCallsFailed}</span>
        </div>

        {/* Success Rate */}
        <div className="flex justify-between">
          <span>Success Rate:</span>
          <span className={getSuccessRate() < 90 ? 'text-red-400' : 'text-green-400'}>
            {getSuccessRate().toFixed(1)}%
          </span>
        </div>

        {/* Chart Stats */}
        <div className="flex justify-between text-xs text-gray-300">
          <span>✅ {metrics.chartsLoaded}</span>
          <span>❌ {metrics.chartsFailed}</span>
        </div>

        {/* Memory Usage */}
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={metrics.memoryUsage > 100 ? 'text-yellow-400' : 'text-green-400'}>
            {metrics.memoryUsage.toFixed(1)}MB
          </span>
        </div>

        {/* Progress Percentage */}
        {metrics.totalCharts > 0 && (
          <div className="text-center text-xs text-gray-300 pt-1 border-t border-gray-600">
            {getProgressPercentage().toFixed(1)}% Complete
          </div>
        )}

        {/* Performance Status */}
        <div className="text-center text-xs pt-1">
          {getProgressPercentage() === 100 ? (
            <span className="text-green-400">✓ All charts loaded</span>
          ) : metrics.chartRenderCount > 0 ? (
            <span className="text-blue-400">⏳ Loading charts...</span>
          ) : (
            <span className="text-gray-400">Waiting for charts...</span>
          )}
        </div>
      </div>
    </div>
  );
};
