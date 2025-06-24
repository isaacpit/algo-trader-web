import React, { useState, useEffect, Suspense } from 'react';
import { fetchFeedItems } from '../data/mockFeedData';
import LazyChart from './charts/LazyChart';
import Pagination from './common/Pagination';
import { PerformanceMonitor } from './common/PerformanceMonitor';

// Lazy load the feed item component
const FeedItem = React.lazy(() => import('./FeedItem'));

// Loading skeleton for feed items
const FeedItemSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
    <div className="p-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2 mx-auto"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
          </div>
        ))}
      </div>
      <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
          ))}
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
      </div>
    </div>
  </div>
);

export const Feed = () => {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({});
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(true);

  console.log('[FEED] Component rendered with state:', {
    feedDataLength: feedData.length,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    filters
  });

  const loadFeedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Feed: Starting to load data for page', currentPage, 'with page size', itemsPerPage);
      
      // Reset chart metrics for new page
      if (window.resetChartMetrics) {
        window.resetChartMetrics();
      }
      
      // Update page info in performance monitor
      if (window.updatePageInfo) {
        window.updatePageInfo(currentPage, itemsPerPage);
      }
      
      const data = await fetchFeedItems(currentPage, itemsPerPage, filters);
      console.log('✅ Feed: Data loaded successfully', data);
      
      setFeedData(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
      
      // Set total charts for performance monitoring
      if (window.setTotalCharts) {
        console.log('[FEED] Setting total charts for performance monitoring:', data.items.length);
        window.setTotalCharts(data.items.length);
      }
      
    } catch (err) {
      console.error('❌ Feed: Error loading data', err);
      setError('Failed to load feed data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[FEED] useEffect triggered:', { currentPage, itemsPerPage, filters });
    loadFeedData();
  }, [currentPage, itemsPerPage, filters]);

  const handlePageChange = (page) => {
    console.log('[FEED] handlePageChange called:', { page, currentPage });
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters) => {
    console.log('[FEED] handleFilterChange called:', { newFilters, currentFilters: filters });
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageSizeChange = (newPageSize) => {
    console.log('[FEED] handlePageSizeChange called:', { newPageSize, currentPageSize: itemsPerPage });
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (error) {
    console.log('[FEED] Rendering error state');
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
          <button 
            onClick={() => loadFeedData()}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log('[FEED] Rendering main component');
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Top Signals & Backtests</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover the best strategies from our community • {totalItems.toLocaleString()} total items
          </p>
        </div>
        <div className="flex space-x-2">
          <select 
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value || undefined })}
            value={filters.type || ''}
          >
            <option value="">All Types</option>
            <option value="signal">Signals</option>
            <option value="backtest">Backtests</option>
          </select>
          <select 
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            onChange={(e) => handleFilterChange({ ...filters, timeframe: e.target.value || undefined })}
            value={filters.timeframe || ''}
          >
            <option value="">All Timeframes</option>
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
          <select 
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            value={itemsPerPage}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Sort by Trending
          </button>
          <button 
            onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {showPerformanceMonitor ? 'Hide' : 'Show'} Monitor
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading feed data...</span>
        </div>
      )}

      {/* Feed Items */}
      <div className="space-y-6">
        {!loading && feedData.map((item) => {
          console.log('[FEED] Rendering feed item:', { id: item.id, type: item.type });
          return (
            <Suspense key={item.id} fallback={<FeedItemSkeleton />}>
              <FeedItem 
                item={item} 
                formatTimeAgo={formatTimeAgo}
              />
            </Suspense>
          );
        })}
        
        {/* Show skeletons while loading */}
        {loading && Array.from({ length: itemsPerPage }).map((_, index) => (
          <FeedItemSkeleton key={`skeleton-${index}`} />
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}

      {/* Empty state */}
      {!loading && feedData.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or check back later.
          </p>
        </div>
      )}

      {/* Performance Monitor */}
      <PerformanceMonitor isVisible={showPerformanceMonitor} />
    </div>
  );
}; 