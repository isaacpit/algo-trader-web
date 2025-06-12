import React from "react";

export default function PricingTable() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Free Tier */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
          <p className="text-gray-500 mb-6">Perfect for individual traders</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>10 Monthly Backtest Runs</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>3 Strategy Slots</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>1 Year Historical Data</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Basic Options Chain</span>
            </li>
          </ul>
          <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Get Started
          </button>
        </div>
      </div>

      {/* Pro Plan */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-4 right-4">
          <span className="bg-white text-indigo-600 text-sm font-semibold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
        <div className="p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Professional</h3>
          <p className="text-indigo-100 mb-6">For serious traders and teams</p>
          <div className="mb-6">
            <span className="text-4xl font-bold">$99</span>
            <span className="text-indigo-100">/month</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Unlimited Backtest Runs</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Unlimited Strategy Slots</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>10+ Years Historical Data</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Full Options Chain Access</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Exportable Reports</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Priority Support</span>
            </li>
          </ul>
          <button className="w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
