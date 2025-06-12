import React from "react";
import { FaCheck } from "react-icons/fa";

const features = {
  starter: [
    "10 Monthly Backtest Runs",
    "3 Strategy Slots",
    "1 Year Historical Data",
    "Basic Options Chain",
    "Community Support",
    "Basic Analytics"
  ],
  pro: [
    "Unlimited Backtest Runs",
    "Unlimited Strategy Slots",
    "10+ Years Historical Data",
    "Full Options Chain Access",
    "Priority Support",
    "Advanced Analytics",
    "Custom Indicators",
    "API Access",
    "Team Collaboration",
    "Exportable Reports"
  ],
  enterprise: [
    "Everything in Pro",
    "Dedicated Account Manager",
    "Custom Data Integration",
    "White Label Solutions",
    "SLA Guarantee",
    "On-premise Deployment",
    "Custom Development",
    "Training & Onboarding"
  ]
};

export default function PricingPlans() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-7xl mx-auto">
      {/* Starter Plan */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
          <p className="text-gray-600 mb-4">Perfect for individual traders</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
        </div>
        
        <ul className="space-y-4 mb-8">
          {features.starter.map((feature) => (
            <li key={feature} className="flex items-start">
              <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
          Get Started
        </button>
      </div>

      {/* Pro Plan */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-xl relative transform hover:scale-105 transition-all duration-300">
        <div className="absolute top-4 right-4">
          <span className="bg-white text-indigo-600 text-sm font-semibold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
          <p className="text-indigo-100 mb-4">For serious traders and teams</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white">$99</span>
            <span className="text-indigo-100 ml-2">/month</span>
          </div>
        </div>
        
        <ul className="space-y-4 mb-8">
          {features.pro.map((feature) => (
            <li key={feature} className="flex items-start">
              <FaCheck className="w-5 h-5 text-white mr-3 mt-0.5" />
              <span className="text-indigo-100">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button className="w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
          Start Free Trial
        </button>
      </div>

      {/* Enterprise Plan */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
          <p className="text-gray-600 mb-4">For institutions and large teams</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">Custom</span>
          </div>
        </div>
        
        <ul className="space-y-4 mb-8">
          {features.enterprise.map((feature) => (
            <li key={feature} className="flex items-start">
              <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
}
