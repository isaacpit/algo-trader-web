from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

# Enums
class ItemType(str, Enum):
    SIGNAL = "signal"
    BACKTEST = "backtest"

class Timeframe(str, Enum):
    ONE_MINUTE = "1m"
    FIVE_MINUTES = "5m"
    FIFTEEN_MINUTES = "15m"
    ONE_HOUR = "1h"
    FOUR_HOURS = "4h"
    ONE_DAY = "1d"

class Status(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DRAFT = "draft"
    ARCHIVED = "archived"
    COMPLETED = "completed"

# OAuth and Authentication Models
class CallbackRequest(BaseModel):
    access_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    access_token: str
    token_received_at: str
    expires_at: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: str

# Base Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    verified: bool = False
    followers: int = 0
    created_at: datetime
    updated_at: datetime

class PerformanceMetrics(BaseModel):
    win_rate: float = Field(..., ge=0, le=1)
    profit_factor: float = Field(..., gt=0)
    total_trades: int = Field(..., ge=0)
    avg_return: float
    max_drawdown: float
    sharpe_ratio: float
    sortino_ratio: Optional[float] = None
    calmar_ratio: Optional[float] = None

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

# Strategy Definition Models
class IndicatorType(str, Enum):
    RSI = "RSI"
    MACD = "MACD"
    SMA = "SMA"
    EMA = "EMA"
    BOLLINGER_BANDS = "Bollinger_Bands"
    VOLUME = "Volume"
    ADX = "ADX"
    STOCHASTIC = "Stochastic"
    ATR = "ATR"
    SUPPORT_RESISTANCE = "Support_Resistance"

class ConditionType(str, Enum):
    ABOVE = "above"
    BELOW = "below"
    CROSSOVER = "crossover"
    CROSSUNDER = "crossunder"
    PRICE_ABOVE = "price_above"
    PRICE_BELOW = "price_below"
    PRICE_AT_UPPER = "price_at_upper"
    PRICE_AT_LOWER = "price_at_lower"
    BREAK_ABOVE = "break_above"
    BREAK_BELOW = "break_below"
    ABOVE_AVERAGE = "above_average"
    BELOW_AVERAGE = "below_average"

class LogicOperator(str, Enum):
    AND = "AND"
    OR = "OR"
    NOT = "NOT"

class IndicatorConfig(BaseModel):
    type: IndicatorType
    parameters: Dict[str, Any] = Field(default_factory=dict)
    name: Optional[str] = None

class Condition(BaseModel):
    type: str = Field(..., description="'indicator' or 'price' or 'volume'")
    indicator: Optional[str] = None
    condition: ConditionType
    value: Any
    operator: LogicOperator = LogicOperator.AND

class StrategyCondition(BaseModel):
    conditions: List[Condition]
    operator: LogicOperator = LogicOperator.AND

class StrategyTemplate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    indicators: List[IndicatorConfig]
    entry_conditions: StrategyCondition
    exit_conditions: StrategyCondition
    risk_management: Dict[str, Any] = Field(default_factory=dict)

class StrategyDefinition(BaseModel):
    name: str
    description: str
    timeframe: Timeframe
    assets: List[str]
    template_id: Optional[str] = None
    custom_indicators: List[IndicatorConfig] = Field(default_factory=list)
    entry_conditions: StrategyCondition
    exit_conditions: StrategyCondition
    risk_management: Dict[str, Any] = Field(default_factory=dict)
    code_snippet: Optional[str] = None

# Signal Models
class Signal(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    timeframe: Timeframe
    assets: List[str]
    strategy_definition: StrategyDefinition
    status: Status = Status.ACTIVE
    performance: PerformanceMetrics
    chart_data: ChartData
    created_at: datetime
    updated_at: datetime
    likes: int = 0
    comments: int = 0
    shares: int = 0

# Backtest Models
class Backtest(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    timeframe: Timeframe
    assets: List[str]
    period: str  # e.g., "6 months", "1 year"
    initial_capital: float
    final_capital: float
    status: Status = Status.ACTIVE
    performance: PerformanceMetrics
    chart_data: ChartData
    created_at: datetime
    updated_at: datetime
    likes: int = 0
    comments: int = 0
    shares: int = 0

# API Request/Response Models
class CreateSignalRequest(BaseModel):
    name: str
    description: str
    timeframe: Timeframe
    assets: List[str]
    strategy_definition: StrategyDefinition
    confidence: int = Field(..., ge=0, le=100)

class CreateBacktestRequest(BaseModel):
    name: str
    description: str
    timeframe: Timeframe
    assets: List[str]
    period: str
    initial_capital: float
    strategy_definition: StrategyDefinition

class UpdateSignalRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    strategy_definition: Optional[StrategyDefinition] = None
    confidence: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[Status] = None

class UpdateBacktestRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None

class FeedItemResponse(BaseModel):
    id: str
    type: ItemType
    user: User
    signal: Optional[Signal] = None
    backtest: Optional[Backtest] = None
    performance: PerformanceMetrics
    chart_data: ChartData
    timestamp: str
    likes: int
    comments: int
    shares: int

class FeedResponse(BaseModel):
    items: List[FeedItemResponse]
    total_items: int
    current_page: int
    total_pages: int
    has_next_page: bool
    page_size: int

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)
    type: Optional[ItemType] = None
    timeframe: Optional[Timeframe] = None
    user_id: Optional[str] = None

# Database Models (for DynamoDB)
class DynamoDBUser(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    verified: bool = False
    followers: int = 0
    created_at: str  # ISO format
    updated_at: str  # ISO format

class DynamoDBSignal(BaseModel):
    signal_id: str
    user_id: str
    name: str
    description: str
    timeframe: str
    assets: List[str]
    entry: str
    target: str
    stop_loss: str
    confidence: int
    status: str
    performance: Dict[str, Any]
    chart_data: Dict[str, Any]
    created_at: str  # ISO format
    updated_at: str  # ISO format
    likes: int = 0
    comments: int = 0
    shares: int = 0

class DynamoDBBacktest(BaseModel):
    backtest_id: str
    user_id: str
    name: str
    description: str
    timeframe: str
    assets: List[str]
    period: str
    initial_capital: float
    final_capital: float
    status: str
    performance: Dict[str, Any]
    chart_data: Dict[str, Any]
    strategy_config: Dict[str, Any]
    created_at: str  # ISO format
    updated_at: str  # ISO format
    likes: int = 0
    comments: int = 0
    shares: int = 0

# Backtest Generation Models
class BacktestGenerationRequest(BaseModel):
    strategy_name: str
    strategy_description: str
    timeframe: Timeframe
    assets: List[str]
    period: str
    initial_capital: float
    strategy_definition: StrategyDefinition
    user_id: str

class BacktestGenerationResponse(BaseModel):
    backtest_id: str
    status: str
    message: str
    estimated_completion_time: Optional[str] = None

# Backtest Job Models
class BacktestJobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class BacktestJobPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class BacktestJobRequest(BaseModel):
    user_id: str
    strategy_name: str
    strategy_description: str
    timeframe: Timeframe
    assets: List[str]
    period: str  # e.g., "6 months", "1 year"
    initial_capital: float
    strategy_definition: StrategyDefinition
    priority: BacktestJobPriority = BacktestJobPriority.NORMAL
    estimated_duration: Optional[int] = None  # in seconds

class BacktestJob(BaseModel):
    job_id: str
    user_id: str
    status: BacktestJobStatus
    priority: BacktestJobPriority
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    strategy_name: str
    strategy_description: str
    timeframe: Timeframe
    assets: List[str]
    period: str
    initial_capital: float
    strategy_definition: StrategyDefinition
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    error_message: Optional[str] = None
    progress: float = Field(0.0, ge=0.0, le=100.0)
    result_backtest_id: Optional[str] = None

class BacktestJobUpdate(BaseModel):
    status: Optional[BacktestJobStatus] = None
    progress: Optional[float] = Field(None, ge=0.0, le=100.0)
    error_message: Optional[str] = None
    result_backtest_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    actual_duration: Optional[int] = None

# Database Models (for DynamoDB)
class DynamoDBBacktestJob(BaseModel):
    job_id: str
    user_id: str
    status: str
    priority: str
    created_at: str  # ISO format
    started_at: Optional[str] = None  # ISO format
    completed_at: Optional[str] = None  # ISO format
    strategy_name: str
    strategy_description: str
    timeframe: str
    assets: List[str]
    period: str
    initial_capital: float
    strategy_definition: Dict[str, Any]
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    error_message: Optional[str] = None
    progress: float = 0.0
    result_backtest_id: Optional[str] = None
