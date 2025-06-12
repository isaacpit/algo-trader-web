import React from "react";
// import { Navbar } from "../../components/Navbar"; // Removed duplicate Navbar
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
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:via-indigo-900 dark:to-gray-900 text-gray-900 dark:text-white min-h-screen">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
      <div className="relative z-10">
        {/* <Navbar /> Removed duplicate Navbar */}
        <div className="pt-20">
          <Hero />
          <FeaturesIcons />
          <section id="pricing" className="py-24 px-6 max-w-4xl mx-auto">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-8 md:p-12">
              <h2 className="text-4xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Compare Plans
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr>
                      <th className="py-3 px-4"></th>
                      <th className="py-3 px-4 text-center font-semibold text-indigo-600 dark:text-indigo-300">Free</th>
                      <th className="py-3 px-4 text-center font-semibold text-indigo-700 dark:text-indigo-100 bg-indigo-50 dark:bg-indigo-700/20 rounded-lg">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, idx) => (
                      <tr key={feature.name} className={idx % 2 === 0 ? "bg-white/0" : "bg-gray-50/50 dark:bg-white/5"}>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white/90">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          {feature.free ? (
                            <span className="inline-block w-5 h-5 text-green-500 dark:text-green-400">✓</span>
                          ) : (
                            <span className="inline-block w-5 h-5 text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {feature.premium ? (
                            <span className="inline-block w-5 h-5 text-green-500 dark:text-green-400">✓</span>
                          ) : (
                            <span className="inline-block w-5 h-5 text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mt-10 justify-center items-center">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-2">Free</div>
                  <div className="text-3xl font-extrabold mb-2">$0</div>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">Get started with basic features</div>
                  <a
                    href="#"
                    className="inline-block px-8 py-3 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                  >
                    Start Free
                  </a>
                </div>
                <div className="flex-1 text-center bg-indigo-50 dark:bg-indigo-700/10 rounded-xl p-6 border border-indigo-200 dark:border-indigo-500/20 shadow-lg">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-100 mb-2">Premium</div>
                  <div className="text-3xl font-extrabold mb-2 text-indigo-800 dark:text-indigo-200">$39<span className="text-lg font-normal text-indigo-600 dark:text-indigo-300">/mo</span></div>
                  <div className="text-indigo-700 dark:text-indigo-200 mb-4">Unlock all features and priority support</div>
                  <a
                    href="#"
                    className="inline-block px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg transition-all"
                  >
                    Start Free Trial
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