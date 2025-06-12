import React, { useEffect, useState, useRef } from 'react';
import { useDebug } from '../context/DebugContext';
import { PerformanceChart } from '../components/charts/PerformanceChart';

export const Dashboard = () => {
    const { addDebugLog } = useDebug();
    const [signals, setSignals] = useState([]);
    const hasLoadedSignals = useRef(false);

    // Dummy signal definitions - moved outside component to prevent recreation
    const dummySignals = [
        {
            id: 1,
            name: 'Moving Average Crossover',
            description: 'Buy when short MA crosses above long MA, sell when it crosses below',
            timeframe: '1h',
            assets: ['BTC/USD', 'ETH/USD'],
            lastRun: '2024-03-15T10:30:00Z',
            performance: {
                winRate: 0.68,
                profitFactor: 1.85,
                totalTrades: 156,
            },
            chartData: {
                labels: Array.from({ length: 100 }, (_, i) => i),
                datasets: [
                    {
                        label: 'Strategy Performance',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.1) * 100 + i * 10),
                        borderColor: 'rgba(99, 102, 241, 0.8)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                    },
                    {
                        label: 'Benchmark',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 50 + i * 5),
                        borderColor: 'rgba(156, 163, 175, 0.8)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        fill: true,
                    }
                ]
            }
        },
        {
            id: 2,
            name: 'RSI Oversold/Overbought',
            description: 'Buy when RSI < 30, sell when RSI > 70',
            timeframe: '4h',
            assets: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
            lastRun: '2024-03-15T09:15:00Z',
            performance: {
                winRate: 0.72,
                profitFactor: 2.1,
                totalTrades: 89,
            },
            chartData: {
                labels: Array.from({ length: 100 }, (_, i) => i),
                datasets: [
                    {
                        label: 'Strategy Performance',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.12) * 120 + i * 12),
                        borderColor: 'rgba(16, 185, 129, 0.8)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                    },
                    {
                        label: 'Benchmark',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 50 + i * 5),
                        borderColor: 'rgba(156, 163, 175, 0.8)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        fill: true,
                    }
                ]
            }
        },
        {
            id: 3,
            name: 'Bollinger Band Breakout',
            description: 'Buy when price breaks above upper band, sell when it breaks below lower band',
            timeframe: '1d',
            assets: ['BTC/USD'],
            lastRun: '2024-03-14T23:45:00Z',
            performance: {
                winRate: 0.65,
                profitFactor: 1.95,
                totalTrades: 45,
            },
            chartData: {
                labels: Array.from({ length: 100 }, (_, i) => i),
                datasets: [
                    {
                        label: 'Strategy Performance',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.15) * 150 + i * 15),
                        borderColor: 'rgba(245, 158, 11, 0.8)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                    },
                    {
                        label: 'Benchmark',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 50 + i * 5),
                        borderColor: 'rgba(156, 163, 175, 0.8)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        fill: true,
                    }
                ]
            }
        },
        {
            id: 4,
            name: 'MACD Divergence',
            description: 'Look for bullish/bearish divergences between price and MACD',
            timeframe: '4h',
            assets: ['ETH/USD', 'SOL/USD'],
            lastRun: '2024-03-15T08:30:00Z',
            performance: {
                winRate: 0.75,
                profitFactor: 2.3,
                totalTrades: 67,
            },
            chartData: {
                labels: Array.from({ length: 100 }, (_, i) => i),
                datasets: [
                    {
                        label: 'Strategy Performance',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.1) * 100 + i * 20),
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                    },
                    {
                        label: 'Benchmark',
                        data: Array.from({ length: 100 }, (_, i) => 1000 + Math.sin(i * 0.08) * 50 + i * 5),
                        borderColor: 'rgba(156, 163, 175, 0.8)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        fill: true,
                    }
                ]
            }
        },
    ];

    useEffect(() => {
        // Only load signals once
        if (!hasLoadedSignals.current) {
            setSignals(dummySignals);
            hasLoadedSignals.current = true;
            
            addDebugLog({
                emoji: '📊',
                title: 'Loaded dummy signals',
                data: dummySignals,
            });
        }
    }, []); // Empty dependency array since we only want this to run once

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your trading signals and monitor their performance
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {signals.map((signal) => (
                        <div
                            key={signal.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {signal.name}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {signal.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                        {signal.timeframe}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {signal.assets.map((asset) => (
                                        <span
                                            key={asset}
                                            className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                        >
                                            {asset}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 h-64">
                                <PerformanceChart
                                    data={signal.chartData}
                                    height="100%"
                                    showLegend={true}
                                    showTooltip={true}
                                    showGrid={true}
                                    showAxes={true}
                                />
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                        {(signal.performance.winRate * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Factor</p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                        {signal.performance.profitFactor.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                        {signal.performance.totalTrades}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Last run: {new Date(signal.lastRun).toLocaleString()}
                                </p>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};