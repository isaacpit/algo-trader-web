import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/api";
import { ROUTES } from "../constants";

export const BacktestJobsSummary = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobStats();
  }, [userId]);

  const fetchJobStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get(`/backtest-jobs/user/${userId}`);
      const jobs = response.jobs || [];

      const stats = {
        total: jobs.length,
        pending: jobs.filter((job) => job.status === "pending").length,
        running: jobs.filter((job) => job.status === "running").length,
        completed: jobs.filter((job) => job.status === "completed").length,
        failed: jobs.filter((job) => job.status === "failed").length,
        cancelled: jobs.filter((job) => job.status === "cancelled").length,
      };

      setStats(stats);
    } catch (err) {
      console.error("Error fetching job stats:", err);
      setError(err.message || "Failed to fetch job stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg mb-2">❌</div>
          <div className="text-red-600 dark:text-red-400 font-medium">
            Error Loading Jobs
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "running":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "cancelled":
        return "text-gray-600";
      default:
        return "text-gray-600";
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
        return "📊";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Backtest Jobs
        </h3>
        <Link
          to={ROUTES.BACKTEST_JOBS}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {stats.total === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-3xl mb-2">
            📊
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            No backtest jobs yet
          </div>
          <div className="text-gray-500 dark:text-gray-500 text-sm">
            Create your first backtest to get started
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Jobs
            </div>
          </div>

          {stats.pending > 0 && (
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getStatusColor("pending")}`}
              >
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <span className="mr-1">{getStatusIcon("pending")}</span>
                Pending
              </div>
            </div>
          )}

          {stats.running > 0 && (
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getStatusColor("running")}`}
              >
                {stats.running}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <span className="mr-1">{getStatusIcon("running")}</span>
                Running
              </div>
            </div>
          )}

          {stats.completed > 0 && (
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getStatusColor("completed")}`}
              >
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <span className="mr-1">{getStatusIcon("completed")}</span>
                Completed
              </div>
            </div>
          )}

          {stats.failed > 0 && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStatusColor("failed")}`}>
                {stats.failed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <span className="mr-1">{getStatusIcon("failed")}</span>
                Failed
              </div>
            </div>
          )}

          {stats.cancelled > 0 && (
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getStatusColor("cancelled")}`}
              >
                {stats.cancelled}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <span className="mr-1">{getStatusIcon("cancelled")}</span>
                Cancelled
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {(stats.running > 0 || stats.pending > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Recent Activity
          </div>
          <div className="flex items-center justify-between">
            {stats.running > 0 && (
              <div className="flex items-center text-sm">
                <span className="mr-1">🔄</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {stats.running} running
                </span>
              </div>
            )}
            {stats.pending > 0 && (
              <div className="flex items-center text-sm">
                <span className="mr-1">⏳</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {stats.pending} pending
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestJobsSummary;
