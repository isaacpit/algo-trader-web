import React from "react";
import { useTheme } from "../context/ThemeContext";
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from "react-icons/fa";

export const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`${
        isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-600"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Algo Trader
            </h3>
            <p className="text-sm">
              Professional-grade algorithmic trading platform for backtesting
              and deploying trading strategies.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FaDiscord className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4
              className={`text-sm font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`text-sm font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`text-sm font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode ? "hover:text-white" : "hover:text-gray-900"
                  }`}
                >
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center ${
            isDarkMode ? "border-gray-800" : "border-gray-300"
          }`}
        >
          <p className="text-sm">
            © {new Date().getFullYear()} Algo Trader. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Made with ❤️ for traders and developers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
