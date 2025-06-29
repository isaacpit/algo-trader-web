#!/usr/bin/env python3
"""
Script to populate the database with initial sample data for testing
Supports both LocalStack (local development) and AWS DynamoDB (production)
Updated for two-table architecture: User table and Feed table
"""

import asyncio
import json
import random
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import traceback

from database import DatabaseManager
from backtest_generator import BacktestGenerator
from models import DynamoDBUser, DynamoDBSignal, DynamoDBBacktest, DynamoDBBacktestJob

# Debug mode detection
DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"

def debug_print(message: str, data: Any = None):
    """Print debug information when debug mode is enabled"""
    if DEBUG_MODE:
        print(f"🔍 DEBUG: {message}")
        if data is not None:
            if isinstance(data, dict):
                print(json.dumps(data, indent=2, default=str))
            else:
                print(data)
        print()

def error_print(message: str, error: Optional[Exception] = None, context: Optional[Dict[str, Any]] = None):
    """Print detailed error information"""
    print(f"❌ ERROR: {message}")

    if error is not None:
        print(f"   Exception Type: {type(error).__name__}")
        print(f"   Exception Message: {str(error)}")

        # Print the full traceback in debug mode
        if DEBUG_MODE:
            print("   Full Traceback:")
            print(traceback.format_exc())

    if context is not None:
        print(f"   Context: {json.dumps(context, indent=2, default=str)}")

    print()

def validate_required_fields(data: Dict[str, Any], required_fields: List[str], item_name: str) -> List[str]:
    """Validate that all required fields are present in data"""
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)

    if missing_fields:
        error_print(f"Missing required fields for {item_name}", context={
            "missing_fields": missing_fields,
            "provided_data": data,
            "required_fields": required_fields
        })

    return missing_fields

# Sample data
SAMPLE_USERS = [
    {
        "id": "user_001",
        "email": "cryptotrader@example.com",
        "name": "CryptoTrader_Pro",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoTrader_Pro",
        "verified": True,
        "followers": 1250
    },
    {
        "id": "user_002",
        "email": "quantmaster@example.com",
        "name": "QuantMaster",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=QuantMaster",
        "verified": True,
        "followers": 890
    },
    {
        "id": "user_003",
        "email": "altcoinhunter@example.com",
        "name": "AltcoinHunter",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=AltcoinHunter",
        "verified": False,
        "followers": 456
    },
    {
        "id": "user_004",
        "email": "bitcoinwhale@example.com",
        "name": "BitcoinWhale",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitcoinWhale",
        "verified": True,
        "followers": 2100
    },
    {
        "id": "user_005",
        "email": "ethmaximalist@example.com",
        "name": "ETH_Maximalist",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=ETH_Maximalist",
        "verified": True,
        "followers": 1678
    },
    {
        "id": "user_006",
        "email": "solanatrader@example.com",
        "name": "SolanaTrader",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=SolanaTrader",
        "verified": True,
        "followers": 934
    },
    {
        "id": "user_007",
        "email": "defiexpert@example.com",
        "name": "DeFi_Expert",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=DeFi_Expert",
        "verified": False,
        "followers": 567
    },
    {
        "id": "user_008",
        "email": "technicalanalyst@example.com",
        "name": "TechnicalAnalyst",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=TechnicalAnalyst",
        "verified": True,
        "followers": 1445
    }
]

SAMPLE_SIGNALS = [
    {
        "name": "BTC Momentum Strategy",
        "description": "Advanced momentum detection using RSI and volume confirmation with multi-timeframe analysis",
        "timeframe": "1h",
        "assets": ["BTC/USD"],
        "entry": "Buy at $45,200",
        "target": "$48,500",
        "stop_loss": "$43,800",
        "confidence": 85
    },
    {
        "name": "ETH Scalping System",
        "description": "High-frequency scalping strategy with tight spreads and order flow analysis",
        "timeframe": "5m",
        "assets": ["ETH/USD"],
        "entry": "Buy at $2,850",
        "target": "$2,920",
        "stop_loss": "$2,820",
        "confidence": 78
    },
    {
        "name": "SOL Breakout Detector",
        "description": "Breakout detection with volume and price action confirmation using Bollinger Bands",
        "timeframe": "15m",
        "assets": ["SOL/USD"],
        "entry": "Buy at $98.50",
        "target": "$105.00",
        "stop_loss": "$95.00",
        "confidence": 72
    },
    {
        "name": "Multi-Asset Portfolio",
        "description": "Diversified portfolio strategy across multiple cryptocurrencies with risk parity allocation",
        "timeframe": "4h",
        "assets": ["BTC/USD", "ETH/USD", "SOL/USD"],
        "entry": "Buy at market",
        "target": "15% portfolio gain",
        "stop_loss": "8% portfolio loss",
        "confidence": 68
    },
    {
        "name": "ADA Smart Money Tracker",
        "description": "Following smart money flows and whale movements in Cardano ecosystem",
        "timeframe": "1h",
        "assets": ["ADA/USD"],
        "entry": "Buy at $0.385",
        "target": "$0.420",
        "stop_loss": "$0.365",
        "confidence": 76
    },
    {
        "name": "DOT Parachain Momentum",
        "description": "Polkadot momentum strategy based on parachain auction cycles and ecosystem growth",
        "timeframe": "4h",
        "assets": ["DOT/USD"],
        "entry": "Buy at $7.25",
        "target": "$8.15",
        "stop_loss": "$6.85",
        "confidence": 71
    },
    {
        "name": "LINK Oracle Network Play",
        "description": "Chainlink price action based on oracle network adoption and integration news",
        "timeframe": "1d",
        "assets": ["LINK/USD"],
        "entry": "Buy at $14.50",
        "target": "$17.80",
        "stop_loss": "$13.20",
        "confidence": 82
    },
    {
        "name": "AVAX Ecosystem Arbitrage",
        "description": "Cross-chain arbitrage opportunities within Avalanche DeFi ecosystem",
        "timeframe": "15m",
        "assets": ["AVAX/USD"],
        "entry": "Buy at $36.80",
        "target": "$41.20",
        "stop_loss": "$34.50",
        "confidence": 69
    },
    {
        "name": "MATIC Layer 2 Surge",
        "description": "Polygon network growth strategy targeting Ethereum scaling adoption",
        "timeframe": "1h",
        "assets": ["MATIC/USD"],
        "entry": "Buy at $0.92",
        "target": "$1.08",
        "stop_loss": "$0.86",
        "confidence": 74
    },
    {
        "name": "Multi-Exchange Spread Trading",
        "description": "Statistical arbitrage across multiple exchanges using mean reversion techniques",
        "timeframe": "15m",
        "assets": ["BTC/USD", "ETH/USD"],
        "entry": "Dynamic based on spread",
        "target": "2-4% spread capture",
        "stop_loss": "1% max loss per trade",
        "confidence": 88
    }
]

SAMPLE_BACKTESTS = [
    {
        "name": "RSI Divergence Trader",
        "description": "RSI divergence detection for trend reversals with volume confirmation",
        "timeframe": "1h",
        "assets": ["BTC/USD"],
        "period": "6 months",
        "initial_capital": 15000,
        "strategy_type": "momentum"
    },
    {
        "name": "MACD Crossover Pro",
        "description": "MACD signal crossover with momentum confirmation and trend filtering",
        "timeframe": "4h",
        "assets": ["ETH/USD"],
        "period": "1 year",
        "initial_capital": 25000,
        "strategy_type": "trend_following"
    },
    {
        "name": "Bollinger Band Master",
        "description": "Bollinger Band breakout and mean reversion strategy with dynamic position sizing",
        "timeframe": "1d",
        "assets": ["SOL/USD"],
        "period": "3 months",
        "initial_capital": 10000,
        "strategy_type": "mean_reversion"
    },
    {
        "name": "Volume Price Analysis",
        "description": "Volume-based price action analysis with order flow insights",
        "timeframe": "15m",
        "assets": ["BTC/USD", "ETH/USD"],
        "period": "6 months",
        "initial_capital": 20000,
        "strategy_type": "breakout"
    },
    {
        "name": "Fibonacci Retracement System",
        "description": "Multi-timeframe Fibonacci analysis with confluence zone identification",
        "timeframe": "4h",
        "assets": ["ADA/USD"],
        "period": "4 months",
        "initial_capital": 12000,
        "strategy_type": "trend_following"
    },
    {
        "name": "Ichimoku Cloud Strategy",
        "description": "Complete Ichimoku system with cloud breakouts and Tenkan-Kijun crosses",
        "timeframe": "4h",
        "assets": ["DOT/USD"],
        "period": "8 months",
        "initial_capital": 18000,
        "strategy_type": "trend_following"
    },
    {
        "name": "Stochastic RSI Oscillator",
        "description": "Overbought/oversold signals with divergence analysis and momentum confirmation",
        "timeframe": "1h",
        "assets": ["LINK/USD"],
        "period": "5 months",
        "initial_capital": 14000,
        "strategy_type": "momentum"
    },
    {
        "name": "Support Resistance Levels",
        "description": "Dynamic support and resistance identification with breakout confirmation",
        "timeframe": "15m",
        "assets": ["AVAX/USD"],
        "period": "3 months",
        "initial_capital": 16000,
        "strategy_type": "breakout"
    },
    {
        "name": "Moving Average Confluence",
        "description": "Multiple moving average system with golden/death cross signals",
        "timeframe": "4h",
        "assets": ["MATIC/USD"],
        "period": "7 months",
        "initial_capital": 22000,
        "strategy_type": "trend_following"
    },
    {
        "name": "Grid Trading Algorithm",
        "description": "Automated grid trading with dynamic range adjustment and profit taking",
        "timeframe": "1h",
        "assets": ["BTC/USD", "ETH/USD", "SOL/USD"],
        "period": "6 months",
        "initial_capital": 30000,
        "strategy_type": "mean_reversion"
    }
]

# Sample backtest job data
SAMPLE_BACKTEST_JOBS = [
    {
        "signal_id": "signal_001",
        "strategy_name": "BTC Momentum Test",
        "description": "Testing BTC momentum strategy with RSI confirmation",
        "timeframe": "1h",
        "assets": ["BTC/USD"],
        "period": "30d",
        "initial_capital": 10000,
        "strategy_config": {
            "type": "momentum",
            "rsi_period": 14,
            "rsi_oversold": 30,
            "rsi_overbought": 70,
            "volume_confirmation": True
        },
        "status": "completed"
    },
    {
        "signal_id": "signal_002",
        "strategy_name": "ETH Scalping Backtest",
        "description": "High-frequency ETH scalping strategy validation",
        "timeframe": "5m",
        "assets": ["ETH/USD"],
        "period": "7d",
        "initial_capital": 5000,
        "strategy_config": {
            "type": "scalping",
            "spread_threshold": 0.02,
            "position_size": 0.1,
            "max_positions": 3
        },
        "status": "running"
    },
    {
        "signal_id": "signal_003",
        "strategy_name": "SOL Breakout Analysis",
        "description": "Analyzing SOL breakout patterns with volume confirmation",
        "timeframe": "15m",
        "assets": ["SOL/USD"],
        "period": "14d",
        "initial_capital": 7500,
        "strategy_config": {
            "type": "breakout",
            "bollinger_period": 20,
            "bollinger_std": 2,
            "volume_multiplier": 1.5
        },
        "status": "pending"
    },
    {
        "signal_id": "signal_004",
        "strategy_name": "Multi-Asset Portfolio Test",
        "description": "Testing diversified portfolio strategy across crypto assets",
        "timeframe": "4h",
        "assets": ["BTC/USD", "ETH/USD", "SOL/USD"],
        "period": "60d",
        "initial_capital": 25000,
        "strategy_config": {
            "type": "portfolio",
            "rebalance_frequency": "daily",
            "allocation": {"BTC": 0.4, "ETH": 0.4, "SOL": 0.2},
            "risk_parity": True
        },
        "status": "failed"
    },
    {
        "signal_id": "signal_005",
        "strategy_name": "ADA Smart Money Tracking",
        "description": "Backtesting smart money flow strategy for Cardano",
        "timeframe": "1h",
        "assets": ["ADA/USD"],
        "period": "21d",
        "initial_capital": 8000,
        "strategy_config": {
            "type": "smart_money",
            "whale_threshold": 1000000,
            "flow_window": 24,
            "correlation_threshold": 0.7
        },
        "status": "completed"
    }
]

def generate_chart_data(base_value: float, volatility: float, trend: float, length: int = 100, pattern_type: str = "random") -> Dict[str, Any]:
    """Generate realistic market data with strong trends and breakouts"""
    import math

    data = []
    benchmark_data = []

    # Initialize with starting price
    current_price = base_value
    current_momentum = 0
    trend_strength = 0

    # Define market phases for more realistic behavior
    phases = []
    remaining_length = length

    # Create realistic market phases
    while remaining_length > 0:
        phase_length = min(random.randint(8, 25), remaining_length)
        phase_type = random.choice([
            "strong_uptrend", "strong_downtrend", "consolidation",
            "breakout_up", "breakout_down", "volatile_chop", "steady_drift"
        ])

        # Adjust phase probabilities based on pattern type
        if pattern_type == "bullish_breakout":
            if len(phases) == 0:  # First phase
                phase_type = random.choice(["consolidation", "steady_drift"])
            else:  # Later phases favor upward movement
                phase_type = random.choice(["strong_uptrend", "breakout_up", "steady_drift"])
        elif pattern_type == "bearish_reversal":
            if len(phases) < 2:  # Early phases go up
                phase_type = random.choice(["strong_uptrend", "steady_drift"])
            else:  # Later phases go down
                phase_type = random.choice(["strong_downtrend", "breakout_down"])
        elif pattern_type == "exponential_growth":
            phase_type = random.choice(["strong_uptrend", "breakout_up", "steady_drift"])
        elif pattern_type == "volatile_range":
            phase_type = random.choice(["volatile_chop", "consolidation", "breakout_up", "breakout_down"])

        phases.append((phase_type, phase_length))
        remaining_length -= phase_length

    # Generate data based on phases
    for phase_type, phase_length in phases:
        for i in range(phase_length):
            # Base price movement based on phase
            if phase_type == "strong_uptrend":
                # Strong consistent upward movement
                base_move = random.uniform(0.5, 2.5) * volatility * current_price / 100
                trend_strength = min(trend_strength + 0.1, 1.0)  # Build momentum

            elif phase_type == "strong_downtrend":
                # Strong consistent downward movement
                base_move = -random.uniform(0.5, 2.5) * volatility * current_price / 100
                trend_strength = min(trend_strength + 0.1, 1.0)  # Build momentum

            elif phase_type == "breakout_up":
                # Explosive upward movement
                base_move = random.uniform(1.0, 4.0) * volatility * current_price / 100
                # Add acceleration effect
                acceleration = (i / phase_length) * random.uniform(0.5, 1.5)
                base_move *= (1 + acceleration)
                trend_strength = 1.0

            elif phase_type == "breakout_down":
                # Sharp downward movement
                base_move = -random.uniform(1.0, 4.0) * volatility * current_price / 100
                # Add acceleration effect
                acceleration = (i / phase_length) * random.uniform(0.5, 1.5)
                base_move *= (1 + acceleration)
                trend_strength = 1.0

            elif phase_type == "consolidation":
                # Sideways movement with small range
                range_center = current_price
                max_deviation = volatility * current_price * 0.02  # 2% range
                base_move = random.uniform(-max_deviation, max_deviation)
                trend_strength *= 0.9  # Reduce momentum

            elif phase_type == "volatile_chop":
                # High volatility with no clear direction
                base_move = random.gauss(0, volatility * current_price * 0.03)
                # Add occasional large spikes
                if random.random() < 0.15:  # 15% chance
                    spike = random.uniform(-1, 1) * volatility * current_price * 0.05
                    base_move += spike
                trend_strength *= 0.8

            else:  # steady_drift
                # Gentle trend following
                base_move = trend * current_price * random.uniform(0.5, 1.5)
                trend_strength = min(trend_strength + 0.05, 0.6)

            # Apply momentum from previous moves
            momentum_effect = current_momentum * trend_strength * 0.7

            # Add realistic noise (but not too much)
            noise = random.gauss(0, volatility * current_price * 0.01)

            # Calculate price change
            price_change = base_move + momentum_effect + noise

            # Apply some resistance/support levels (prices tend to bounce off round numbers)
            new_price = current_price + price_change

            # Simulate support/resistance at round numbers
            if random.random() < 0.1:  # 10% chance
                round_level = round(new_price / (current_price * 0.05)) * (current_price * 0.05)
                if abs(new_price - round_level) < current_price * 0.02:
                    # Price "bounces" off the level
                    bounce_strength = random.uniform(0.3, 0.8)
                    if new_price > round_level:
                        new_price = round_level + (new_price - round_level) * bounce_strength
                    else:
                        new_price = round_level - (round_level - new_price) * bounce_strength

            # Update momentum (with decay)
            current_momentum = current_momentum * 0.85 + price_change * 0.15

            # Ensure price doesn't go negative
            current_price = max(0.01, new_price)
            data.append(round(current_price, 2))

    # Generate benchmark data (usually follows market but with less volatility)
    benchmark_price = base_value
    benchmark_momentum = 0

    for i in range(length):
        # Benchmark follows similar direction but with 60% of the volatility
        if i < len(data) - 1:
            market_change = data[i+1] - data[i] if i < len(data) - 1 else 0
            benchmark_change = market_change * random.uniform(0.4, 0.7)  # Follow but dampened
        else:
            benchmark_change = trend * benchmark_price * random.uniform(0.3, 0.6)

        # Add independent noise
        benchmark_noise = random.gauss(0, volatility * benchmark_price * 0.008)

        # Update benchmark momentum
        benchmark_momentum = benchmark_momentum * 0.9 + benchmark_change * 0.1

        # Calculate new benchmark price
        total_change = benchmark_change + benchmark_momentum * 0.3 + benchmark_noise
        benchmark_price = max(0.01, benchmark_price + total_change)
        benchmark_data.append(round(benchmark_price, 2))

    # Generate realistic time labels
    time_labels = []
    start_time = datetime.now() - timedelta(days=length)
    for i in range(length):
        time_labels.append((start_time + timedelta(days=i)).strftime("%Y-%m-%d"))

    # Determine colors based on performance
    final_return = ((data[-1] - data[0]) / data[0]) * 100
    if final_return > 15:
        strategy_color = "#10B981"  # Strong green
        benchmark_color = "#059669"
    elif final_return > 5:
        strategy_color = "#3B82F6"  # Blue
        benchmark_color = "#1D4ED8"
    elif final_return > -5:
        strategy_color = "#8B5CF6"  # Purple
        benchmark_color = "#7C3AED"
    else:
        strategy_color = "#EF4444"  # Red
        benchmark_color = "#DC2626"

    return {
        "labels": time_labels,
        "datasets": [
            {
                "label": "Strategy Performance",
                "data": data,
                "borderColor": strategy_color,
                "backgroundColor": strategy_color + "20",
                "fill": False,
                "tension": 0.1
            },
            {
                "label": "Benchmark",
                "data": benchmark_data,
                "borderColor": benchmark_color,
                "backgroundColor": benchmark_color + "20",
                "fill": False,
                "tension": 0.1,
                "borderDash": [5, 5]
            }
        ]
    }

def generate_performance_metrics(strategy_type: str = "general", confidence: int = 75) -> Dict[str, Any]:
    """Generate realistic performance metrics based on strategy type and confidence"""

    # Base metrics influenced by confidence level
    confidence_multiplier = confidence / 75.0  # Normalize around 75%

    # Strategy-specific performance characteristics
    if strategy_type == "scalping":
        win_rate_base = 0.65
        profit_factor_base = 1.8
        total_trades_base = 150
        avg_return_base = 3.5
        max_drawdown_base = 8.0
        sharpe_base = 1.2
    elif strategy_type == "momentum":
        win_rate_base = 0.58
        profit_factor_base = 2.2
        total_trades_base = 80
        avg_return_base = 8.5
        max_drawdown_base = 15.0
        sharpe_base = 1.6
    elif strategy_type == "breakout":
        win_rate_base = 0.52
        profit_factor_base = 2.8
        total_trades_base = 45
        avg_return_base = 12.0
        max_drawdown_base = 20.0
        sharpe_base = 1.4
    elif strategy_type == "arbitrage":
        win_rate_base = 0.78
        profit_factor_base = 1.5
        total_trades_base = 200
        avg_return_base = 2.8
        max_drawdown_base = 4.0
        sharpe_base = 2.1
    else:  # general/trend_following
        win_rate_base = 0.62
        profit_factor_base = 2.0
        total_trades_base = 65
        avg_return_base = 6.5
        max_drawdown_base = 12.0
        sharpe_base = 1.3

    # Apply confidence-based adjustments with some randomness
    variance = 0.15  # 15% variance around base values

    metrics = {
        "win_rate": max(0.3, min(0.9, win_rate_base * confidence_multiplier * random.uniform(1-variance, 1+variance))),
        "profit_factor": max(1.0, profit_factor_base * confidence_multiplier * random.uniform(1-variance, 1+variance)),
        "total_trades": max(10, int(total_trades_base * random.uniform(1-variance*2, 1+variance*2))),
        "avg_return": max(0.5, avg_return_base * confidence_multiplier * random.uniform(1-variance, 1+variance)),
        "max_drawdown": -max(2.0, max_drawdown_base * (2.0 - confidence_multiplier) * random.uniform(1-variance, 1+variance)),
        "sharpe_ratio": max(0.2, sharpe_base * confidence_multiplier * random.uniform(1-variance, 1+variance))
    }

    # Add additional metrics for backtests
    if random.random() > 0.5:  # 50% chance to include these
        metrics.update({
            "sortino_ratio": metrics["sharpe_ratio"] * random.uniform(1.1, 1.4),
            "calmar_ratio": abs(metrics["avg_return"] / metrics["max_drawdown"]) * random.uniform(0.8, 1.2),
            "max_consecutive_wins": random.randint(3, 12),
            "max_consecutive_losses": random.randint(2, 8),
            "avg_trade_duration": f"{random.randint(2, 48)} hours" if strategy_type == "scalping" else f"{random.randint(1, 14)} days"
        })

    debug_print("Generated sophisticated performance metrics", {
        "strategy_type": strategy_type,
        "confidence": confidence,
        "confidence_multiplier": confidence_multiplier,
        "metrics": metrics
    })

    return metrics

async def populate_users(db: DatabaseManager) -> List[str]:
    """Populate users and return user IDs"""
    user_ids = []
    failures = []

    debug_print("Starting user population", {
        "total_users": len(SAMPLE_USERS),
        "sample_users": SAMPLE_USERS
    })

    for i, user_data in enumerate(SAMPLE_USERS):
        try:
            # Create user
            success = await db.create_user(user_data)
            if not success:
                raise Exception(f"Database operation returned False for user {user_data['name']}")

            user_ids.append(user_data["id"])
            print(f"✅ Created user: {user_data['name']}")

            debug_print(f"Created user successfully", {
                "user_id": user_data["id"],
                "user_data": user_data
            })

        except Exception as e:
            error_context = {
                "user_index": i,
                "user_data": user_data,
                "user_id": user_data.get("id", "unknown")
            }

            error_print(f"Failed to create user {user_data.get('name', 'unknown')}",
                       error=e, context=error_context)

            failures.append(f"User {i+1} ({user_data.get('name', 'unknown')}): {str(e)}")

    # If any users failed to create, raise an exception
    if failures:
        raise Exception(f"Failed to create {len(failures)} users:\n" + "\n".join(failures))

    if not user_ids:
        raise Exception("No users were created successfully")

    return user_ids

async def populate_signals(db: DatabaseManager, user_ids: List[str]):
    """Populate signals"""
    failures = []

    debug_print("Starting signal population", {
        "total_signals": len(SAMPLE_SIGNALS),
        "available_user_ids": user_ids
    })

    for i, signal_data in enumerate(SAMPLE_SIGNALS):
        try:
            user_id = user_ids[i % len(user_ids)]
            signal_id = f"signal_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}"

            # Generate chart data with highly varied parameters
            # Much wider range of base values and more realistic price levels
            asset_type = random.choice(["major_crypto", "altcoin", "defi_token", "meme_coin"])
            if asset_type == "major_crypto":
                base_value = random.uniform(20000, 70000)  # BTC-like prices
            elif asset_type == "altcoin":
                base_value = random.uniform(1000, 5000)    # ETH-like prices
            elif asset_type == "defi_token":
                base_value = random.uniform(10, 500)       # Mid-cap tokens
            else:  # meme_coin
                base_value = random.uniform(0.001, 10)     # Low price tokens

                        # Much more varied volatility and ensure balanced market conditions
            market_conditions = ["bull_market", "bear_market", "sideways", "high_volatility", "crash", "recovery"]
            market_condition = market_conditions[i % len(market_conditions)]  # Ensure even distribution

            if market_condition == "bull_market":
                volatility = random.uniform(0.08, 0.20)
                trend_bias = random.uniform(0.002, 0.008)
            elif market_condition == "bear_market":
                volatility = random.uniform(0.12, 0.35)
                trend_bias = random.uniform(-0.008, -0.002)
            elif market_condition == "crash":
                volatility = random.uniform(0.20, 0.50)
                trend_bias = random.uniform(-0.015, -0.005)
            elif market_condition == "recovery":
                volatility = random.uniform(0.15, 0.30)
                trend_bias = random.uniform(0.003, 0.012)
            elif market_condition == "sideways":
                volatility = random.uniform(0.05, 0.15)
                trend_bias = random.uniform(-0.001, 0.001)
            else:  # high_volatility
                volatility = random.uniform(0.25, 0.60)
                trend_bias = random.uniform(-0.010, 0.010)

            # Add random shock events that can dramatically change the trend
            if random.random() < 0.3:  # 30% chance of trend modification
                trend_modifier = random.uniform(-0.008, 0.008)
                trend_bias += trend_modifier

            trend = trend_bias
            length = random.randint(50, 180)         # More consistent length range

                        # Choose pattern type based on market condition to ensure variety
            if market_condition == "bull_market":
                pattern_type = random.choice(["bullish_breakout", "steady_growth", "exponential_growth"])
            elif market_condition == "bear_market":
                pattern_type = random.choice(["bearish_reversal", "volatile_range"])
            elif market_condition == "crash":
                pattern_type = "bearish_reversal"  # Crashes are always bearish reversals
            elif market_condition == "recovery":
                pattern_type = random.choice(["bullish_breakout", "exponential_growth"])
            elif market_condition == "sideways":
                pattern_type = random.choice(["volatile_range", "fibonacci_retracement"])
            else:  # high_volatility
                pattern_type = random.choice(["volatile_range", "random"])

            # Add some randomness - 15% chance to pick a different pattern
            if random.random() < 0.15:
                all_patterns = ["bullish_breakout", "bearish_reversal", "steady_growth", "volatile_range", "exponential_growth", "fibonacci_retracement", "random"]
                pattern_type = random.choice(all_patterns)

            chart_data = generate_chart_data(base_value, volatility, trend, length, pattern_type)

            # Generate performance metrics based on signal characteristics
            strategy_type = "general"
            if "scalping" in signal_data["name"].lower():
                strategy_type = "scalping"
            elif "momentum" in signal_data["name"].lower() or "breakout" in signal_data["name"].lower():
                strategy_type = "momentum"
            elif "arbitrage" in signal_data["name"].lower() or "spread" in signal_data["name"].lower():
                strategy_type = "arbitrage"

            performance = generate_performance_metrics(strategy_type, signal_data["confidence"])

            # Create signal
            signal_item = {
                "id": signal_id,
                "user_id": user_id,
                "name": signal_data["name"],
                "description": signal_data["description"],
                "timeframe": signal_data["timeframe"],
                "assets": signal_data["assets"],
                "entry": signal_data["entry"],
                "target": signal_data["target"],
                "stop_loss": signal_data["stop_loss"],
                "confidence": signal_data["confidence"],
                "status": "active",
                "performance": performance,
                "chart_data": chart_data,
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                "updated_at": datetime.now().isoformat(),
                "likes": random.randint(5, 500),
                "comments": random.randint(1, 100),
                "shares": random.randint(1, 50)
            }

            success = await db.create_signal(signal_item)
            if not success:
                raise Exception(f"Database operation returned False for signal {signal_data['name']}")

            print(f"✅ Created signal: {signal_data['name']}")

            debug_print(f"Created signal successfully", {
                "signal_id": signal_id,
                "user_id": user_id,
                "signal_data": signal_item
            })

        except Exception as e:
            error_context = {
                "signal_index": i,
                "signal_data": signal_data,
                "user_id": user_id if 'user_id' in locals() else "unknown",
                "signal_id": signal_id if 'signal_id' in locals() else "unknown"
            }

            error_print(f"Failed to create signal {signal_data.get('name', 'unknown')}",
                       error=e, context=error_context)

            failures.append(f"Signal {i+1} ({signal_data.get('name', 'unknown')}): {str(e)}")

    # If any signals failed to create, raise an exception
    if failures:
        raise Exception(f"Failed to create {len(failures)} signals:\n" + "\n".join(failures))

async def populate_backtests(db: DatabaseManager, user_ids: List[str]):
    """Populate backtests"""
    backtest_generator = BacktestGenerator()
    failures = []

    debug_print("Starting backtest population", {
        "total_backtests": len(SAMPLE_BACKTESTS),
        "available_user_ids": user_ids
    })

    for i, backtest_data in enumerate(SAMPLE_BACKTESTS):
        try:
            user_id = user_ids[i % len(user_ids)]

            # Generate backtest using the generator
            generation_request = {
                "strategy_name": backtest_data["name"],
                "strategy_description": backtest_data["description"],
                "timeframe": backtest_data["timeframe"],
                "assets": backtest_data["assets"],
                "period": backtest_data["period"],
                "initial_capital": backtest_data["initial_capital"],
                "strategy_config": {
                    "type": backtest_data["strategy_type"]
                },
                "user_id": user_id
            }

            debug_print(f"Generating backtest", {
                "backtest_name": backtest_data["name"],
                "generation_request": generation_request
            })

            generated_backtest = await backtest_generator.generate_backtest(generation_request)

            debug_print(f"Generated backtest data", {
                "backtest_name": backtest_data["name"],
                "generated_backtest": generated_backtest
            })

            # Store in database
            success = await db.create_backtest(generated_backtest)
            if not success:
                raise Exception(f"Database operation returned False for backtest {backtest_data['name']}")

            print(f"✅ Created backtest: {backtest_data['name']}")

        except Exception as e:
            error_msg = f"Failed to create backtest {backtest_data['name']}: {e}"
            print(f"❌ {error_msg}")
            debug_print(f"Failed to create backtest", {
                "backtest_data": backtest_data,
                "error": str(e)
            })
            failures.append(error_msg)

    # If any backtests failed to create, raise an exception
    if failures:
        raise Exception(f"Failed to create {len(failures)} backtests:\n" + "\n".join(failures))

async def populate_backtest_jobs(db: DatabaseManager, user_ids: List[str]):
    """Populate backtest jobs"""
    failures = []

    debug_print("Starting backtest jobs population", {
        "total_jobs": len(SAMPLE_BACKTEST_JOBS),
        "available_user_ids": user_ids
    })

    # Required fields for backtest job based on DynamoDBBacktestJob model
    required_fields = [
        "job_id", "user_id", "status", "priority", "strategy_name",
        "strategy_description", "timeframe", "assets", "period",
        "initial_capital", "strategy_definition"
    ]

    for i, job_data in enumerate(SAMPLE_BACKTEST_JOBS):
        try:
            user_id = user_ids[i % len(user_ids)]
            job_id = f"job_{str(i+1).zfill(3)}_{int(datetime.now().timestamp())}"

            debug_print(f"Creating backtest job {i+1}/{len(SAMPLE_BACKTEST_JOBS)}", {
                "job_id": job_id,
                "user_id": user_id,
                "source_data": job_data
            })

            # Create job item with all required fields
            job_item = {
                "job_id": job_id,
                "user_id": user_id,
                "status": job_data["status"],
                "priority": "normal",  # Add missing priority field
                "strategy_name": job_data["strategy_name"],
                "strategy_description": job_data["description"],  # Map description to strategy_description
                "timeframe": job_data["timeframe"],
                "assets": job_data["assets"],
                "period": job_data["period"],
                "initial_capital": job_data["initial_capital"],
                "strategy_definition": job_data["strategy_config"],  # Map strategy_config to strategy_definition
                "progress": 100.0 if job_data["status"] == "completed" else
                          float(random.randint(10, 90)) if job_data["status"] == "running" else 0.0,
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 7))).isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            # Add optional fields based on status
            if job_data["status"] == "completed":
                job_item["completed_at"] = datetime.now().isoformat()
                job_item["actual_duration"] = random.randint(300, 3600)  # 5 minutes to 1 hour
                job_item["result_backtest_id"] = f"backtest_{job_id}"
            elif job_data["status"] == "running":
                job_item["started_at"] = datetime.now().isoformat()
                job_item["estimated_duration"] = random.randint(600, 1800)  # 10-30 minutes
            elif job_data["status"] == "failed":
                job_item["error_message"] = "Insufficient data for the specified timeframe and period"
                job_item["started_at"] = (datetime.now() - timedelta(minutes=random.randint(5, 30))).isoformat()
                job_item["completed_at"] = datetime.now().isoformat()

            # Validate required fields before creating
            missing_fields = validate_required_fields(job_item, required_fields, f"backtest job {job_data['strategy_name']}")
            if missing_fields:
                raise ValueError(f"Missing required fields: {missing_fields}")

            debug_print(f"Job item prepared for database", {
                "job_item": job_item,
                "required_fields_check": "passed"
            })

            success = await db.create_backtest_job(job_item)
            if not success:
                raise Exception(f"Database operation returned False - check database logs for details")

            print(f"✅ Created backtest job: {job_data['strategy_name']} ({job_data['status']})")

            debug_print(f"Created backtest job successfully", {
                "job_id": job_id,
                "user_id": user_id,
                "status": job_data["status"]
            })

        except Exception as e:
            error_context = {
                "job_index": i,
                "job_data": job_data,
                "user_id": user_id if 'user_id' in locals() else "unknown",
                "job_id": job_id if 'job_id' in locals() else "unknown"
            }

            error_print(f"Failed to create backtest job {job_data.get('strategy_name', 'unknown')}",
                       error=e, context=error_context)

            failures.append(f"Job {i+1} ({job_data.get('strategy_name', 'unknown')}): {str(e)}")

    # If any jobs failed to create, raise an exception
    if failures:
        error_print(f"Failed to create {len(failures)} out of {len(SAMPLE_BACKTEST_JOBS)} backtest jobs",
                   context={"failures": failures})
        raise Exception(f"Failed to create {len(failures)} backtest jobs:\n" + "\n".join(failures))

def get_config_from_env():
    """Get configuration from environment variables"""
    config = {
        "user_table_name": os.getenv("USER_TABLE_NAME", "Algo-Trader-User-Token-Table"),
        "feed_table_name": os.getenv("FEED_TABLE_NAME", "Algo-Trader-Feed-Table"),
        "backtest_jobs_table_name": os.getenv("BACKTEST_JOBS_TABLE_NAME", "Algo-Trader-Backtest-Jobs-Table"),
        "region": os.getenv("AWS_REGION", "us-east-1"),
        "use_localstack": os.getenv("USE_LOCALSTACK", "true").lower() == "true",
        "localstack_endpoint": os.getenv("LOCALSTACK_ENDPOINT", "http://localhost:4566"),
        "debug": DEBUG_MODE
    }

    debug_print("Configuration loaded", config)
    return config

async def main():
    """Main function to populate the database"""
    print("🚀 Starting database population...")

    if DEBUG_MODE:
        print("🔍 DEBUG MODE ENABLED - Will output generated data")

    # Get configuration
    config = get_config_from_env()

    print(f"Configuration:")
    print(f"  User Table Name: {config['user_table_name']}")
    print(f"  Feed Table Name: {config['feed_table_name']}")
    print(f"  Backtest Jobs Table Name: {config['backtest_jobs_table_name']}")
    print(f"  Region: {config['region']}")
    print(f"  Use LocalStack: {config['use_localstack']}")
    print(f"  Debug Mode: {config['debug']}")
    if config['use_localstack']:
        print(f"  LocalStack Endpoint: {config['localstack_endpoint']}")

    # Initialize database with all table names
    db = DatabaseManager(
        config["user_table_name"],
        config["feed_table_name"],
        config["backtest_jobs_table_name"],
        config["region"],
        config["use_localstack"],
        config["localstack_endpoint"]
    )

    if not db.is_connected():
        error_msg = "❌ Failed to connect to database"
        print(error_msg)
        if DEBUG_MODE:
            import traceback
            debug_print("Database connection error", traceback.format_exc())
        sys.exit(1)

    print("✅ Connected to database")

    try:
        # Populate users
        print("\n👥 Populating users...")
        user_ids = await populate_users(db)

        # Populate signals
        print("\n📊 Populating signals...")
        await populate_signals(db, user_ids)

        # Populate backtests
        print("\n📈 Populating backtests...")
        await populate_backtests(db, user_ids)

        # Populate backtest jobs
        print("\n⚙️ Populating backtest jobs...")
        await populate_backtest_jobs(db, user_ids)

        print("\n✅ Database population completed successfully!")
        print(f"📊 Created {len(user_ids)} users, {len(SAMPLE_SIGNALS)} signals, {len(SAMPLE_BACKTESTS)} backtests, and {len(SAMPLE_BACKTEST_JOBS)} backtest jobs")

        # Display access information
        if config['use_localstack']:
            print("\n🔗 LocalStack Access:")
            print(f"  - LocalStack: http://localhost:4566")
            print(f"  - DynamoDB Admin: http://localhost:8001")
            print(f"  - Health Check: http://localhost:4566/_localstack/health")

        if DEBUG_MODE:
            print("\n🔍 DEBUG SUMMARY:")
            print(f"  - Generated {len(user_ids)} user IDs: {user_ids}")
            print(f"  - Generated {len(SAMPLE_SIGNALS)} signals with chart data and performance metrics")
            print(f"  - Generated {len(SAMPLE_BACKTESTS)} backtests with strategy configurations")
            print(f"  - Generated {len(SAMPLE_BACKTEST_JOBS)} backtest jobs with various statuses")

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: Database population failed: {e}")
        if DEBUG_MODE:
            import traceback
            debug_print("Full error traceback", traceback.format_exc())

        # Exit with non-zero status code to indicate failure
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Database population interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        if DEBUG_MODE:
            import traceback
            debug_print("Unexpected error traceback", traceback.format_exc())
        sys.exit(1)
