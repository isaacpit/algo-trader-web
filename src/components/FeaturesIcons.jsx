import React from "react";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    name: "Advanced Backtesting",
    description:
      "Test your strategies against 10+ years of historical data with institutional-grade accuracy.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    name: "Real-Time Analytics",
    description:
      "Monitor your portfolio performance with millisecond precision and advanced risk metrics.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    name: "Custom Indicators",
    description:
      "Build and deploy your own technical indicators with our powerful scripting engine.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  },
  {
    name: "Portfolio Optimization",
    description:
      "Automatically optimize your portfolio allocation using advanced machine learning algorithms.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    name: "Risk Management",
    description:
      "Set sophisticated risk parameters and automated stop-loss mechanisms.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    name: "API Integration",
    description:
      "Connect with major exchanges and data providers through our unified API interface.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const FeaturesIcons = () => {
  const { isDarkMode } = useTheme();

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-4xl font-bold mb-6 bg-clip-text text-transparent ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
          >
            Professional-Grade Trading Tools
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Everything you need to build, test, and deploy sophisticated trading
            strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className={`group relative backdrop-blur-sm rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${
                isDarkMode
                  ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-indigo-500/10"
                  : "bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-indigo-500/20"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isDarkMode
                    ? "from-indigo-500/10 to-blue-500/10"
                    : "from-indigo-500/5 to-blue-500/5"
                }`}
              ></div>
              <div className="relative">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 group-hover:transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-300 group-hover:from-indigo-500/30 group-hover:to-blue-500/30"
                      : "bg-gradient-to-br from-indigo-500/10 to-blue-500/10 text-indigo-600 group-hover:from-indigo-500/20 group-hover:to-blue-500/20"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                    isDarkMode
                      ? "text-white group-hover:text-indigo-300"
                      : "text-gray-900 group-hover:text-indigo-600"
                  }`}
                >
                  {feature.name}
                </h3>
                <p
                  className={`transition-colors duration-300 ${
                    isDarkMode
                      ? "text-gray-400 group-hover:text-gray-300"
                      : "text-gray-600 group-hover:text-gray-700"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
