import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GoogleSignIn } from "../components/GoogleSignIn";
import { ROUTES } from "../constants";

export const GoogleSignUp = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome to Algo Trader
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign up to start building your trading algorithms
        </p>
        {from !== ROUTES.DASHBOARD && (
          <p className="mt-2 text-center text-sm text-indigo-600 dark:text-indigo-400">
            You'll be redirected to {from} after signing in
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Google Sign In Button */}
            <div>
              <GoogleSignIn />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            {/* Email Sign Up Link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              >
                Continue with Email
              </Link>
            </div>

            <div className="text-sm text-center">
              <p className="text-gray-600 dark:text-gray-400">
                By signing up, you agree to our{" "}
                <Link
                  to="/terms"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="text-sm text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
