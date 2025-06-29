import React from "react";
import { BacktestJobsView } from "../components/BacktestJobsView";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export const BacktestJobsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BacktestJobsView userId={user.id} />
      </div>
    </div>
  );
};
