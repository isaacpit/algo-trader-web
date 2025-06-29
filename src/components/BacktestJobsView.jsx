import React, { useState, useEffect, useRef } from "react";
import { BacktestJobStatus } from "./BacktestJobStatus";
import apiService from "../services/api";

export const BacktestJobsView = ({ userId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [toastError, setToastError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const pollIntervalRef = useRef(null);
  const lastPollTime = useRef(0);
  const requestInProgress = useRef(false);

  useEffect(() => {
    fetchBacktestJobs();
    return () => {
      // Cleanup polling on unmount
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userId]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => {
        setToastError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  // Smart polling effect
  useEffect(() => {
    setupSmartPolling();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [jobs]);

  const setupSmartPolling = () => {
    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Check if any jobs are still in progress (exclude cancelled jobs from active polling)
    const activeJobs = jobs.filter(
      (job) => job.status === "pending" || job.status === "running"
    );

    if (activeJobs.length === 0) {
      // No active jobs - poll very infrequently
      console.log("[JobsView] No active jobs. Setting up slow polling (20s)");
      pollIntervalRef.current = setInterval(() => {
        fetchBacktestJobs(false); // silent fetch
      }, 20000); // 20 seconds
    } else {
      // Active jobs exist - poll more frequently but reasonably
      console.log(
        `[JobsView] ${activeJobs.length} active jobs. Setting up normal polling (5s)`
      );
      pollIntervalRef.current = setInterval(() => {
        fetchBacktestJobs(false); // silent fetch
      }, 5000); // 5 seconds
    }
  };

  const fetchBacktestJobs = async (showLoading = true) => {
    try {
      // Prevent concurrent requests
      if (requestInProgress.current) {
        console.log("[JobsView] Request already in progress - skipping");
        return;
      }

      // Rate limiting: don't allow requests more than once every 3 seconds
      const now = Date.now();
      if (now - lastPollTime.current < 3000) {
        console.log("[JobsView] Rate limited - skipping fetch");
        return;
      }

      requestInProgress.current = true;
      lastPollTime.current = now;

      if (showLoading) {
        setLoading(true);
      }

      // Clear any existing toast errors when making a new request
      if (toastError) {
        setToastError(null);
      }

      console.log("[JobsView] Fetching all backtest jobs...");
      const response = await apiService.getUserBacktestJobs(userId);
      setJobs(response.jobs || []);

      // Mark as successfully loaded at least once
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }

      // Clear any persistent error since we successfully fetched
      setError(null);

      if (showLoading) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching backtest jobs:", err);

      if (hasInitiallyLoaded) {
        // We've successfully loaded jobs before, so show a toast instead of full error
        setToastError(
          "Unable to refresh job statuses. Retrying automatically..."
        );
      } else {
        // This is the initial load and it failed, show full error screen
        setError(err.message || "Failed to fetch backtest jobs");
      }

      if (showLoading) {
        setLoading(false);
      }
    } finally {
      requestInProgress.current = false;
    }
  };

  const handleJobComplete = (jobData) => {
    // Update the job in the list when it completes or gets cancelled
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.job_id === jobData.job_id ? { ...job, ...jobData } : job
      )
    );
    // Trigger re-setup of polling since job states changed
    setTimeout(setupSmartPolling, 100);
  };

  const handleCancelJob = async (jobId) => {
    try {
      console.log(`[JobsView] Cancelling job ${jobId}...`);

      // Optimistically update the UI to show the job as cancelled
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.job_id === jobId
            ? { ...job, status: "cancelled", progress: job.progress }
            : job
        )
      );

      // Cancel the job on the backend
      await apiService.cancelBacktestJob(jobId);

      // Refresh the jobs list to get the latest status
      fetchBacktestJobs(false);

      // Trigger re-setup of polling since job states changed
      setTimeout(setupSmartPolling, 100);
    } catch (err) {
      console.error("Error cancelling job:", err);

      // Show toast error instead of breaking the UI
      setToastError(
        `Failed to cancel job. ${err.message || "Please try again."}`
      );

      // Revert the optimistic update on error
      fetchBacktestJobs(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (
      sortBy === "created_at" ||
      sortBy === "started_at" ||
      sortBy === "completed_at"
    ) {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);

      // Check for invalid dates
      if (isNaN(aValue.getTime())) aValue = new Date(0);
      if (isNaN(bValue.getTime())) bValue = new Date(0);
    }

    // Handle string sorting
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusCount = (status) => {
    return jobs.filter((job) => job.status === status).length;
  };

  const statusFilters = [
    { key: "all", label: "All Jobs", count: jobs.length },
    { key: "pending", label: "Pending", count: getStatusCount("pending") },
    { key: "running", label: "Running", count: getStatusCount("running") },
    {
      key: "completed",
      label: "Completed",
      count: getStatusCount("completed"),
    },
    { key: "failed", label: "Failed", count: getStatusCount("failed") },
    {
      key: "cancelled",
      label: "Cancelled",
      count: getStatusCount("cancelled"),
    },
  ];

  // Only show full error screen if we never successfully loaded jobs
  if (error && !hasInitiallyLoaded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-2xl mb-4">❌</div>
          <div className="text-red-600 dark:text-red-400 font-medium text-lg mb-2">
            Error Loading Backtest Jobs
          </div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => fetchBacktestJobs()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading only during initial load
  if (loading && !hasInitiallyLoaded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400 text-lg">
            Loading backtest jobs...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Error Notification */}
      {toastError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-red-400 text-lg">⚠️</div>
              </div>
              <div className="ml-3 flex-1">
                <div className="text-red-800 dark:text-red-200 text-sm font-medium">
                  Connection Issue
                </div>
                <div className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {toastError}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setToastError(null)}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Backtest Jobs
          </h2>
          <button
            onClick={() => fetchBacktestJobs()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFilters.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="created_at">Created Date</option>
              <option value="started_at">Started Date</option>
              <option value="completed_at">Completed Date</option>
              <option value="strategy_name">Strategy Name</option>
              <option value="status">Status</option>
              <option value="progress">Progress</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Order:
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {sortedJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📊
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-2">
              {filter === "all"
                ? "No backtest jobs found"
                : `No ${filter} jobs found`}
            </div>
            <div className="text-gray-500 dark:text-gray-500 text-sm">
              {filter === "all"
                ? "Submit your first backtest job to get started"
                : `Try selecting a different filter to see jobs`}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedJobs.map((job) => (
            <BacktestJobStatus
              key={job.job_id}
              jobData={job}
              onComplete={handleJobComplete}
              onCancel={handleCancelJob}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {jobs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusFilters.slice(1).map(({ key, label, count }) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
