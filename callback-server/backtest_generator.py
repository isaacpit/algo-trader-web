import asyncio
import json
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging

from database import DatabaseManager

logger = logging.getLogger(__name__)

class BacktestGenerator:
    """Generates backtest data for trading strategies"""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db_manager = db_manager

        # Strategy templates
        self.strategy_templates = {
            "momentum": {
                "indicators": ["RSI", "MACD", "Volume"],
                "entry_conditions": ["RSI oversold", "MACD crossover", "Volume spike"],
                "exit_conditions": ["RSI overbought", "MACD reversal", "Target reached"]
            },
            "trend_following": {
                "indicators": ["Moving Average", "Bollinger Bands", "ADX"],
                "entry_conditions": ["Price above MA", "BB breakout", "ADX > 25"],
                "exit_conditions": ["Price below MA", "BB reversal", "ADX < 20"]
            },
            "mean_reversion": {
                "indicators": ["Bollinger Bands", "RSI", "Stochastic"],
                "entry_conditions": ["Price at BB lower", "RSI oversold", "Stoch oversold"],
                "exit_conditions": ["Price at BB upper", "RSI overbought", "Stoch overbought"]
            },
            "breakout": {
                "indicators": ["Support/Resistance", "Volume", "ATR"],
                "entry_conditions": ["Price breaks resistance", "High volume", "ATR expansion"],
                "exit_conditions": ["Price breaks support", "Volume decline", "Target reached"]
            }
        }

    def generate_chart_data(self, base_value: float, volatility: float, trend: float, length: int = 100, strategy_type: str = "momentum") -> Dict[str, Any]:
        """Generate realistic market data with strong trends and breakouts for backtests"""
        import math

        data = []

        # Initialize with starting price
        current_price = base_value
        current_momentum = 0
        trend_strength = 0

        # Define market phases based on strategy type and performance
        phases = []
        remaining_length = length

        # Create realistic market phases based on strategy type
        while remaining_length > 0:
            phase_length = min(random.randint(8, 25), remaining_length)

            # Strategy-specific phase selection
            if strategy_type == "momentum":
                phase_type = random.choice(["strong_uptrend", "breakout_up", "volatile_chop", "consolidation"])
            elif strategy_type == "trend_following":
                phase_type = random.choice(["strong_uptrend", "strong_downtrend", "steady_drift", "consolidation"])
            elif strategy_type == "mean_reversion":
                phase_type = random.choice(["volatile_range", "consolidation", "steady_drift"])
            elif strategy_type == "breakout":
                phase_type = random.choice(["consolidation", "breakout_up", "breakout_down", "volatile_chop"])
            else:
                phase_type = random.choice(["strong_uptrend", "steady_drift", "volatile_chop"])

            phases.append((phase_type, phase_length))
            remaining_length -= phase_length

        # Generate data based on phases
        for phase_type, phase_length in phases:
            for i in range(phase_length):
                # Base price movement based on phase
                if phase_type == "strong_uptrend":
                    # Strong consistent upward movement
                    base_move = random.uniform(0.3, 1.8) * volatility * current_price / 100
                    trend_strength = min(trend_strength + 0.1, 1.0)

                elif phase_type == "strong_downtrend":
                    # Strong consistent downward movement
                    base_move = -random.uniform(0.3, 1.8) * volatility * current_price / 100
                    trend_strength = min(trend_strength + 0.1, 1.0)

                elif phase_type == "breakout_up":
                    # Explosive upward movement
                    base_move = random.uniform(0.8, 3.0) * volatility * current_price / 100
                    # Add acceleration effect
                    acceleration = (i / phase_length) * random.uniform(0.3, 1.2)
                    base_move *= (1 + acceleration)
                    trend_strength = 1.0

                elif phase_type == "breakout_down":
                    # Sharp downward movement
                    base_move = -random.uniform(0.8, 3.0) * volatility * current_price / 100
                    # Add acceleration effect
                    acceleration = (i / phase_length) * random.uniform(0.3, 1.2)
                    base_move *= (1 + acceleration)
                    trend_strength = 1.0

                elif phase_type == "consolidation":
                    # Sideways movement with small range
                    max_deviation = volatility * current_price * 0.015  # 1.5% range
                    base_move = random.uniform(-max_deviation, max_deviation)
                    trend_strength *= 0.9

                elif phase_type == "volatile_chop":
                    # High volatility with no clear direction
                    base_move = random.gauss(0, volatility * current_price * 0.025)
                    # Add occasional large spikes
                    if random.random() < 0.12:  # 12% chance
                        spike = random.uniform(-1, 1) * volatility * current_price * 0.04
                        base_move += spike
                    trend_strength *= 0.8

                else:  # steady_drift
                    # Gentle trend following
                    base_move = trend * current_price * random.uniform(0.4, 1.2)
                    trend_strength = min(trend_strength + 0.05, 0.6)

                # Apply momentum from previous moves
                momentum_effect = current_momentum * trend_strength * 0.6

                # Add realistic noise (smaller for portfolio data)
                noise = random.gauss(0, volatility * current_price * 0.008)

                # Calculate price change
                price_change = base_move + momentum_effect + noise

                # Apply some resistance/support levels
                new_price = current_price + price_change

                # Simulate support/resistance at round numbers
                if random.random() < 0.08:  # 8% chance
                    round_level = round(new_price / (current_price * 0.05)) * (current_price * 0.05)
                    if abs(new_price - round_level) < current_price * 0.015:
                        bounce_strength = random.uniform(0.4, 0.7)
                        if new_price > round_level:
                            new_price = round_level + (new_price - round_level) * bounce_strength
                        else:
                            new_price = round_level - (round_level - new_price) * bounce_strength

                # Update momentum (with decay)
                current_momentum = current_momentum * 0.88 + price_change * 0.12

                # Ensure price doesn't go negative
                current_price = max(0.01, new_price)
                data.append(round(current_price, 2))

        # Generate timestamps
        timestamps = []
        for i in range(length):
            timestamp = datetime.now() - timedelta(days=length-i)
            timestamps.append(timestamp.strftime("%Y-%m-%d"))

        return {
            "labels": timestamps,
            "datasets": [
                {
                    "label": "Portfolio Value",
                    "data": data,
                    "borderColor": "rgba(75, 192, 192, 1)",
                    "backgroundColor": "rgba(75, 192, 192, 0.2)",
                    "fill": True,
                    "tension": 0.4
                }
            ]
        }

    def generate_performance_metrics(self, strategy_type: str) -> Dict[str, Any]:
        """Generate realistic performance metrics based on strategy type"""
        base_metrics = {
            "momentum": {
                "win_rate": (0.55, 0.75),
                "profit_factor": (1.3, 2.5),
                "avg_return": (2.0, 8.0),
                "max_drawdown": (-15.0, -8.0),
                "sharpe_ratio": (1.2, 2.0)
            },
            "trend_following": {
                "win_rate": (0.45, 0.65),
                "profit_factor": (1.5, 3.0),
                "avg_return": (3.0, 12.0),
                "max_drawdown": (-20.0, -10.0),
                "sharpe_ratio": (1.0, 1.8)
            },
            "mean_reversion": {
                "win_rate": (0.60, 0.80),
                "profit_factor": (1.2, 2.0),
                "avg_return": (1.5, 6.0),
                "max_drawdown": (-12.0, -6.0),
                "sharpe_ratio": (1.5, 2.5)
            },
            "breakout": {
                "win_rate": (0.40, 0.60),
                "profit_factor": (1.8, 3.5),
                "avg_return": (4.0, 15.0),
                "max_drawdown": (-25.0, -15.0),
                "sharpe_ratio": (0.8, 1.6)
            }
        }

        strategy_metrics = base_metrics.get(strategy_type, base_metrics["momentum"])

        return {
            "win_rate": round(random.uniform(*strategy_metrics["win_rate"]), 3),
            "profit_factor": round(random.uniform(*strategy_metrics["profit_factor"]), 2),
            "total_trades": random.randint(20, 200),
            "avg_return": round(random.uniform(*strategy_metrics["avg_return"]), 2),
            "max_drawdown": round(random.uniform(*strategy_metrics["max_drawdown"]), 2),
            "sharpe_ratio": round(random.uniform(*strategy_metrics["sharpe_ratio"]), 2),
            "calmar_ratio": round(random.uniform(0.5, 2.0), 2),
            "sortino_ratio": round(random.uniform(1.0, 2.5), 2)
        }

    def generate_trade_history(self, total_trades: int, initial_capital: float) -> List[Dict[str, Any]]:
        """Generate realistic trade history"""
        trades = []
        current_capital = initial_capital

        for i in range(total_trades):
            # Generate trade outcome
            is_win = random.random() > 0.4  # 60% win rate base
            trade_return = random.uniform(0.5, 3.0) if is_win else random.uniform(-2.0, -0.5)

            # Calculate trade amount
            trade_amount = current_capital * random.uniform(0.02, 0.1)  # 2-10% of capital
            profit_loss = trade_amount * trade_return / 100

            # Update capital
            current_capital += profit_loss

            trade = {
                "id": f"trade_{i+1}",
                "timestamp": (datetime.now() - timedelta(days=total_trades-i)).isoformat(),
                "type": "buy" if is_win else "sell",
                "amount": round(trade_amount, 2),
                "return_pct": round(trade_return, 2),
                "profit_loss": round(profit_loss, 2),
                "capital_after": round(current_capital, 2),
                "status": "win" if is_win else "loss"
            }
            trades.append(trade)

        return trades

    async def generate_backtest(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a complete backtest based on request parameters"""
        try:
            # Extract parameters
            strategy_name = request.get("strategy_name", "Generic Strategy")
            strategy_description = request.get("strategy_description", "A trading strategy")
            timeframe = request.get("timeframe", "1h")
            assets = request.get("assets", ["BTC/USD"])
            period = request.get("period", "6 months")
            initial_capital = request.get("initial_capital", 10000)
            strategy_config = request.get("strategy_config", {})
            user_id = request.get("user_id", "unknown")

            # Determine strategy type
            strategy_type = strategy_config.get("type", "momentum")

            # Generate performance metrics
            performance = self.generate_performance_metrics(strategy_type)

            # Calculate final capital based on performance
            total_return = performance["avg_return"] * performance["total_trades"] / 100
            final_capital = initial_capital * (1 + total_return / 100)

            # Generate chart data with improved realism
            base_value = initial_capital
            # Vary volatility based on strategy type
            if strategy_type == "breakout":
                volatility = random.uniform(0.20, 0.35)
            elif strategy_type == "momentum":
                volatility = random.uniform(0.15, 0.28)
            elif strategy_type == "mean_reversion":
                volatility = random.uniform(0.10, 0.20)
            else:  # trend_following
                volatility = random.uniform(0.12, 0.25)

            # More varied trend based on performance
            if total_return > 15:
                trend = random.uniform(0.002, 0.006)
            elif total_return > 5:
                trend = random.uniform(0.001, 0.003)
            elif total_return > -5:
                trend = random.uniform(-0.001, 0.002)
            else:
                trend = random.uniform(-0.006, -0.001)

            chart_data = self.generate_chart_data(base_value, volatility, trend, 100, strategy_type)

            # Generate trade history
            trade_history = self.generate_trade_history(performance["total_trades"], initial_capital)

            # Create backtest ID
            backtest_id = f"backtest_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

            # Build backtest data
            backtest_data = {
                "id": backtest_id,
                "user_id": user_id,
                "name": strategy_name,
                "description": strategy_description,
                "timeframe": timeframe,
                "assets": assets,
                "period": period,
                "initial_capital": initial_capital,
                "final_capital": round(final_capital, 2),
                "status": "completed",
                "performance": performance,
                "chart_data": chart_data,
                "strategy_config": {
                    "type": strategy_type,
                    "indicators": self.strategy_templates[strategy_type]["indicators"],
                    "entry_conditions": self.strategy_templates[strategy_type]["entry_conditions"],
                    "exit_conditions": self.strategy_templates[strategy_type]["exit_conditions"]
                },
                "trade_history": trade_history,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "likes": random.randint(0, 50),
                "comments": random.randint(0, 20),
                "shares": random.randint(0, 10)
            }

            logger.info(f"Generated backtest: {backtest_id} for user: {user_id}")
            return backtest_data

        except Exception as e:
            logger.error(f"Error generating backtest: {str(e)}")
            raise e

    async def generate_multiple_backtests(self, requests: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate multiple backtests"""
        backtests = []

        for request in requests:
            try:
                backtest = await self.generate_backtest(request)
                backtests.append(backtest)
            except Exception as e:
                logger.error(f"Failed to generate backtest: {str(e)}")

        return backtests

    def validate_request(self, request: Dict[str, Any]) -> bool:
        """Validate backtest generation request"""
        required_fields = ["strategy_name", "timeframe", "assets", "initial_capital"]

        for field in required_fields:
            if field not in request:
                logger.error(f"Missing required field: {field}")
                return False

        if not isinstance(request["assets"], list) or len(request["assets"]) == 0:
            logger.error("Assets must be a non-empty list")
            return False

        if request["initial_capital"] <= 0:
            logger.error("Initial capital must be positive")
            return False

        return True

# Example usage and testing
async def test_backtest_generator():
    """Test the backtest generator"""
    generator = BacktestGenerator()

    # Test request
    test_request = {
        "strategy_name": "RSI Momentum Trader",
        "strategy_description": "RSI-based momentum trading strategy",
        "timeframe": "1h",
        "assets": ["BTC/USD"],
        "period": "6 months",
        "initial_capital": 15000,
        "strategy_config": {
            "type": "momentum"
        },
        "user_id": "test_user_001"
    }

    try:
        backtest = await generator.generate_backtest(test_request)
        print("✅ Backtest generated successfully")
        print(f"Backtest ID: {backtest['id']}")
        print(f"Final Capital: ${backtest['final_capital']}")
        print(f"Win Rate: {backtest['performance']['win_rate']}")
        print(f"Total Trades: {backtest['performance']['total_trades']}")

        return backtest

    except Exception as e:
        print(f"❌ Failed to generate backtest: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(test_backtest_generator())
