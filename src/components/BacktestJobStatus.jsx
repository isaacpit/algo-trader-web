import React, { useState, useEffect, useRef } from "react";
import apiService from "../services/api";

// Main component that displays job data (used in BacktestJobsView)
export const BacktestJobStatus = ({ jobData, onComplete, onCancel }) => {
  // No more polling - this is now a pure display component

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      case "running":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900";
      case "completed":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "failed":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      case "cancelled":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "running":
        return "🔄";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      case "cancelled":
        return "🚫";
      default:
        return "❓";
    }
  };

  if (!jobData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading job data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {jobData.strategy_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {jobData.strategy_description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              jobData.status
            )}`}
          >
            <span className="mr-1">{getStatusIcon(jobData.status)}</span>
            {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
          </div>

          {/* Cancel Button for pending/running jobs */}
          {(jobData.status === "pending" || jobData.status === "running") &&
            onCancel && (
              <button
                onClick={() => onCancel(jobData.job_id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                title="Cancel Job"
              >
                Cancel
              </button>
            )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(jobData.progress || 0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${jobData.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-400">Timeframe</div>
          <div className="text-gray-900 dark:text-white font-medium">
            {jobData.timeframe}
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Assets</div>
          <div className="text-gray-900 dark:text-white font-medium">
            {jobData.assets?.length || 0} selected
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Period</div>
          <div className="text-gray-900 dark:text-white font-medium">
            {jobData.period}
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">
            Initial Capital
          </div>
          <div className="text-gray-900 dark:text-white font-medium">
            ${jobData.initial_capital?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {jobData.error_message && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200 text-sm">
            <strong>Error:</strong> {jobData.error_message}
          </div>
        </div>
      )}

      {/* Timing Information */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            <div>Created</div>
            <div>
              {jobData.created_at
                ? new Date(jobData.created_at).toLocaleString()
                : "N/A"}
            </div>
          </div>
          {jobData.started_at && (
            <div>
              <div>Started</div>
              <div>{new Date(jobData.started_at).toLocaleString()}</div>
            </div>
          )}
          {jobData.completed_at && (
            <div>
              <div>Completed</div>
              <div>{new Date(jobData.completed_at).toLocaleString()}</div>
            </div>
          )}
          {jobData.actual_duration && (
            <div>
              <div>Duration</div>
              <div>{jobData.actual_duration}s</div>
            </div>
          )}
        </div>
      </div>

      {/* Result Link */}
      {jobData.status === "completed" && jobData.result_backtest_id && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={`/backtest/${jobData.result_backtest_id}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Results
          </a>
        </div>
      )}
    </div>
  );
};

// Component that fetches job data by ID and polls for updates (used in SignalCreation)
export const BacktestJobStatusById = ({ jobId, onComplete, onCancel }) => {
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (jobId) {
      fetchJobData();
      setupPolling();
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      const data = await apiService.getBacktestJob(jobId);
      setJobData(data);
      setError(null);

      // Check if job is complete
      if (
        data.status === "completed" ||
        data.status === "failed" ||
        data.status === "cancelled"
      ) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        if (onComplete) {
          onComplete(data);
        }
      }
    } catch (err) {
      console.error("Error fetching job data:", err);
      setError(err.message || "Failed to fetch job data");
    } finally {
      setLoading(false);
    }
  };

  const setupPolling = () => {
    // Poll every 3 seconds for job updates
    pollIntervalRef.current = setInterval(() => {
      fetchJobData();
    }, 3000);
  };

  const handleCancel = async (jobId) => {
    try {
      if (onCancel) {
        await onCancel(jobId);
      } else {
        await apiService.cancelBacktestJob(jobId);
      }
      // Refresh job data after cancellation
      fetchJobData();
    } catch (err) {
      console.error("Error cancelling job:", err);
      setError(err.message || "Failed to cancel job");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading job status...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="text-red-800 dark:text-red-200 text-sm">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchJobData}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <BacktestJobStatus
      jobData={jobData}
      onComplete={onComplete}
      onCancel={handleCancel}
    />
  );
};
