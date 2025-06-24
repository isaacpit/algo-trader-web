import React, { Suspense, lazy, useState, useEffect, useRef, useMemo } from 'react';
import PerformanceChart from './PerformanceChart';

// Lazy load the chart component
const ChartComponent = lazy(() => import('./PerformanceChart'));

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error('[LAZY_CHART] Error boundary caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LAZY_CHART] Chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export const LazyChart = ({ chartData, title, height = 300, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState(0);
  const [loadTime, setLoadTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const chartRef = useRef(null);
  const observerRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const hasReportedRef = useRef(false);

  // Generate stable unique ID for this chart instance
  const chartId = useMemo(() => `chart-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    console.log(`[LAZY CHART ${chartId}] Component mounted, setting up intersection observer`);

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log(`[LAZY CHART ${chartId}] Intersection observed:`, { 
            isIntersecting: entry.isIntersecting, 
            intersectionRatio: entry.intersectionRatio 
          });
          
          if (entry.isIntersecting && !isVisible) {
            console.log(`[LAZY CHART ${chartId}] Chart became visible, starting load`);
            // Set load start time when chart becomes visible
            setLoadStartTime(performance.now());
            setIsVisible(true);
            
            // Start fallback timer in case chart doesn't load
            fallbackTimerRef.current = setTimeout(() => {
              console.warn(`[LAZY CHART ${chartId}] Fallback timer triggered - forcing visibility`);
              setIsVisible(true);
            }, 5000);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Start observing
    if (chartRef.current) {
      console.log(`[LAZY CHART ${chartId}] Starting to observe chart element`);
      observerRef.current.observe(chartRef.current);
    }

    return () => {
      console.log(`[LAZY CHART ${chartId}] Cleaning up intersection observer`);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []); // Remove chartId from dependencies since it's now stable

  const handleChartLoad = () => {
    const endTime = performance.now();
    const totalLoadTime = endTime - loadStartTime;
    
    console.log(`[LAZY CHART ${chartId}] Chart loaded successfully in ${totalLoadTime.toFixed(2)}ms`);
    
    setLoadTime(totalLoadTime);
    setIsLoaded(true);
    setHasError(false);
    
    // Clear fallback timer
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    // Report to performance monitor only once per chart instance
    if (window.trackChartRender && !hasReportedRef.current) {
      hasReportedRef.current = true;
      window.trackChartRender(totalLoadTime, true);
    }
  };

  const handleChartError = (error) => {
    const endTime = performance.now();
    const totalLoadTime = endTime - loadStartTime;
    
    console.error(`[LAZY CHART ${chartId}] Chart failed to load after ${totalLoadTime.toFixed(2)}ms:`, error);
    
    setLoadTime(totalLoadTime);
    setHasError(true);
    
    // Clear fallback timer
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    // Report to performance monitor only once per chart instance
    if (window.trackChartRender && !hasReportedRef.current) {
      hasReportedRef.current = true;
      window.trackChartRender(totalLoadTime, false);
    }
  };

  console.log(`[LAZY CHART ${chartId}] Render state:`, { 
    isVisible, 
    isLoaded, 
    hasError, 
    loadTime: loadTime.toFixed(2) 
  });

  return (
    <div 
      ref={chartRef}
      id={chartId}
      className={`relative ${className}`}
      style={{ minHeight: height }}
    >
      {!isVisible ? (
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chart loading...</p>
          </div>
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rendering chart...</p>
            </div>
          </div>
        }>
          <PerformanceChart
            data={chartData}
            title={title}
            height={height}
            onLoad={handleChartLoad}
            onError={handleChartError}
            className={className}
            renderStartTime={loadStartTime}
          />
        </Suspense>
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-xs text-gray-400 bg-black bg-opacity-50 px-2 py-1 rounded">
          {isLoaded ? `✓ ${loadTime.toFixed(0)}ms` : hasError ? `✗ ${loadTime.toFixed(0)}ms` : '...'}
        </div>
      )}
    </div>
  );
};

export default LazyChart; 