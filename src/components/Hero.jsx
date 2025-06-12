import React from "react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white py-32 px-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Build. Test. Trade.
          </h1>
          <p className="text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Design sophisticated trading algorithms, backtest them with precision, and optimize your strategy with institutional-grade tools.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold backdrop-blur-sm transition-all duration-200">
              View Demo
            </button>
          </div>
        </div>
        <div className="mt-16 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25"></div>
          <div className="relative bg-gray-900 rounded-lg p-4">
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Platform Preview</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
