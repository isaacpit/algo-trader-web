import React from "react";
import {
  FaChartLine,
  FaRobot,
  FaCogs,
  FaDollarSign,
  FaLightbulb,
  FaDatabase,
  FaChartBar,
  FaShieldAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaChartLine className="w-6 h-6" />,
    title: "Advanced Backtesting",
    description: "Test your strategies against historical data with millisecond precision and realistic market conditions."
  },
  {
    icon: <FaRobot className="w-6 h-6" />,
    title: "Strategy Automation",
    description: "Deploy your tested algorithms directly to live markets with our automated execution system."
  },
  {
    icon: <FaDatabase className="w-6 h-6" />,
    title: "Comprehensive Data",
    description: "Access 10+ years of historical data across multiple asset classes and timeframes."
  },
  {
    icon: <FaChartBar className="w-6 h-6" />,
    title: "Performance Analytics",
    description: "Detailed performance metrics and risk analysis to optimize your trading strategies."
  },
  {
    icon: <FaShieldAlt className="w-6 h-6" />,
    title: "Risk Management",
    description: "Built-in risk controls and position sizing tools to protect your capital."
  },
  {
    icon: <FaDollarSign className="w-6 h-6" />,
    title: "Options Trading",
    description: "Full support for options strategies with advanced Greeks calculations and volatility analysis."
  }
];

export default function FeaturesIcons() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Professional-Grade Trading Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to develop, test, and deploy sophisticated trading strategies
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
