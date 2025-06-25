import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Hero } from "../../components/v2/Hero";
import { FeaturesIcons } from "../../components/FeaturesIcons";
import { Footer } from "../../components/Footer";

const features = [
  { name: "Unlimited Backtests", free: true, premium: true },
  { name: "Real-Time Data", free: false, premium: true },
  { name: "Strategy Templates", free: true, premium: true },
  { name: "Advanced Charting", free: false, premium: true },
  { name: "Priority Support", free: false, premium: true },
  { name: "API Access", free: false, premium: true },
  { name: "Portfolio Analytics", free: false, premium: true },
  { name: "Unlimited Paper Trading", free: false, premium: true },
  { name: "Community Access", free: true, premium: true },
];

export const LandingPageV2 = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 text-gray-900"
      }`}
    >
      <div
        className={`fixed inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] ${
          isDarkMode ? "opacity-20" : "opacity-5"
        }`}
      ></div>
      <div className="relative z-10">
        <div className="pt-20">
          <Hero />
          <FeaturesIcons />
          <section id="pricing" className="py-24 px-6 max-w-4xl mx-auto">
            <div
              className={`backdrop-blur-md rounded-2xl border shadow-2xl p-8 md:p-12 ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/90 border-gray-200"
              }`}
            >
              <h2
                className={`text-4xl font-bold mb-10 text-center bg-clip-text text-transparent ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
              >
                Compare Plans
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr>
                      <th className="py-3 px-4"></th>
                      <th
                        className={`py-3 px-4 text-center font-semibold ${
                          isDarkMode ? "text-indigo-300" : "text-indigo-600"
                        }`}
                      >
                        Free
                      </th>
                      <th
                        className={`py-3 px-4 text-center font-semibold ${
                          isDarkMode
                            ? "text-indigo-100 bg-indigo-700/20"
                            : "text-indigo-700 bg-indigo-50"
                        } rounded-lg`}
                      >
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, idx) => (
                      <tr
                        key={feature.name}
                        className={
                          idx % 2 === 0
                            ? isDarkMode
                              ? "bg-white/0"
                              : "bg-gray-50/50"
                            : isDarkMode
                            ? "bg-white/5"
                            : "bg-white/50"
                        }
                      >
                        <td
                          className={`py-3 px-4 font-medium ${
                            isDarkMode ? "text-white/90" : "text-gray-900"
                          }`}
                        >
                          {feature.name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {feature.free ? (
                            <span
                              className={`inline-block w-5 h-5 ${
                                isDarkMode ? "text-green-400" : "text-green-600"
                              }`}
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              className={`inline-block w-5 h-5 ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {feature.premium ? (
                            <span
                              className={`inline-block w-5 h-5 ${
                                isDarkMode ? "text-green-400" : "text-green-600"
                              }`}
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              className={`inline-block w-5 h-5 ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mt-10 justify-center items-center">
                <div className="flex-1 text-center">
                  <div
                    className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? "text-indigo-300" : "text-indigo-600"
                    }`}
                  >
                    Free
                  </div>
                  <div className="text-3xl font-extrabold mb-2">$0</div>
                  <div
                    className={`mb-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Get started with basic features
                  </div>
                  <a
                    href="#"
                    className={`inline-block px-8 py-3 rounded-lg font-semibold transition-all ${
                      isDarkMode
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Start Free
                  </a>
                </div>
                <div
                  className={`flex-1 text-center rounded-xl p-6 border shadow-lg ${
                    isDarkMode
                      ? "bg-indigo-700/10 border-indigo-500/20"
                      : "bg-indigo-50 border-indigo-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? "text-indigo-100" : "text-indigo-700"
                    }`}
                  >
                    Premium
                  </div>
                  <div
                    className={`text-3xl font-extrabold mb-2 ${
                      isDarkMode ? "text-indigo-200" : "text-indigo-800"
                    }`}
                  >
                    $39
                    <span
                      className={`text-lg font-normal ${
                        isDarkMode ? "text-indigo-300" : "text-indigo-600"
                      }`}
                    >
                      /mo
                    </span>
                  </div>
                  <div
                    className={`mb-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Full access to all features
                  </div>
                  <a
                    href="#"
                    className={`inline-block px-8 py-3 rounded-lg font-semibold transition-all ${
                      isDarkMode
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Get Premium
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
};
