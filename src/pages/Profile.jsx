import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDebug } from "../context/DebugContext";

export const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addDebugLog } = useDebug();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      addDebugLog({
        emoji: "🔒",
        title: "Unauthorized Access",
        message: "No user data found, redirecting to home",
      });
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      addDebugLog({
        emoji: "👤",
        title: "Profile Loaded",
        data: parsedUser,
      });
    } catch (error) {
      addDebugLog({
        emoji: "❌",
        title: "Error Parsing User Data",
        error: error.message,
      });
      navigate("/");
    }
  }, [navigate, addDebugLog]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    addDebugLog({
      emoji: "✅",
      title: "Profile picture loaded successfully",
    });
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    addDebugLog({
      emoji: "❌",
      title: "Profile picture failed to load",
      data: { pictureUrl: userData?.picture },
    });
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div
          className={`rounded-lg shadow-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-8 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
          >
            <div className="flex items-center">
              {/* Profile Picture or Fallback */}
              <div className="relative">
                {userData.picture && !imageError ? (
                  <>
                    {imageLoading && (
                      <div
                        className={`absolute inset-0 h-20 w-20 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                    <img
                      src={userData.picture}
                      alt="Profile"
                      className={`h-20 w-20 rounded-full object-cover ${
                        imageLoading ? "opacity-0" : "opacity-100"
                      } transition-opacity duration-300`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      crossOrigin="anonymous"
                    />
                  </>
                ) : (
                  <div
                    className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                      isDarkMode
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    {userData.name ? userData.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {userData.name || "User"}
                </h2>
                <p
                  className={`mt-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {userData.email || "No email provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h3
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Account Information
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Name
                    </p>
                    <p
                      className={`mt-1 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {userData.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Email
                    </p>
                    <p
                      className={`mt-1 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {userData.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw User Data */}
              <div>
                <h3
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Raw User Data
                </h3>
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                  }`}
                >
                  <pre
                    className={`text-sm overflow-x-auto ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Profile Picture Section */}
              {userData.picture && (
                <div>
                  <h3
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Profile Picture
                  </h3>
                  <div className="mt-4">
                    {!imageError ? (
                      <div className="relative">
                        {imageLoading && (
                          <div
                            className={`absolute inset-0 h-32 w-32 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                        )}
                        <img
                          src={userData.picture}
                          alt="Profile"
                          className={`h-32 w-32 rounded-full object-cover ${
                            imageLoading ? "opacity-0" : "opacity-100"
                          } transition-opacity duration-300`}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (
                      <div
                        className={`h-32 w-32 rounded-full flex items-center justify-center text-4xl font-bold ${
                          isDarkMode
                            ? "bg-indigo-600 text-white"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        {userData.name ? userData.name[0].toUpperCase() : "U"}
                      </div>
                    )}
                    {imageError && (
                      <p
                        className={`mt-2 text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Unable to load profile picture. Showing initials
                        instead.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Account Actions */}
              <div className="pt-6">
                <h3
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Account Actions
                </h3>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className={`px-4 py-2 rounded-md font-medium ${
                      isDarkMode
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("access_token");
                      window.dispatchEvent(new Event("authStateChanged"));
                      navigate("/");
                    }}
                    className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                      isDarkMode
                        ? "text-white bg-gray-700/90 hover:bg-red-500 border border-gray-600 shadow-sm shadow-red-500/30 hover:shadow-red-500/40 hover:border-red-400"
                        : "text-gray-800 bg-gray-50 hover:bg-red-100 hover:text-red-600 border border-gray-200 shadow-sm shadow-red-200 hover:shadow-red-300 hover:border-red-300"
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
