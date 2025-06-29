# Backtest Job System Implementation

## Overview

We've successfully implemented a comprehensive asynchronous backtest job system that allows users to submit backtest requests and have them processed in the background. This system includes:

1. **DynamoDB Backtest Jobs Table** - Stores job metadata and status
2. **Backtest Worker** - Asynchronous job processor
3. **API Endpoints** - For job management
4. **Frontend Components** - For job status monitoring
5. **Enhanced Signal Creation** - Template-based strategy builder

## Architecture

### Database Schema

#### Backtest Jobs Table

```sql
Table: backtest_jobs
Primary Key: job_id (String)
GSI: StatusIndex (status, created_at)
GSI: UserIndex (user_id, created_at)

Fields:
- job_id: String (Primary Key)
- user_id: String
- status: String (pending, running, completed, failed, cancelled)
- priority: String (low, normal, high, urgent)
- created_at: String (ISO format)
- started_at: String (ISO format, optional)
- completed_at: String (ISO format, optional)
- strategy_name: String
- strategy_description: String
- timeframe: String
- assets: List[String]
- period: String
- initial_capital: Number
- strategy_definition: Map (JSON)
- estimated_duration: Number (optional)
- actual_duration: Number (optional)
- error_message: String (optional)
- progress: Number (0-100)
- result_backtest_id: String (optional)
```

### Backend Components

#### 1. Backtest Worker (`backtest_worker.py`)

- **Purpose**: Processes backtest jobs asynchronously
- **Features**:
  - Polls for pending jobs every 5 seconds
  - Processes up to 3 concurrent jobs
  - Updates job progress and status
  - Handles job completion and error states
  - Adds completed backtests to the feed table

#### 2. Database Manager (`database.py`)

- **New Methods**:
  - `create_backtest_job()` - Creates new job
  - `get_backtest_job()` - Retrieves job by ID
  - `get_pending_backtest_jobs()` - Gets jobs ready for processing
  - `get_user_backtest_jobs()` - Gets user's job history
  - `update_backtest_job()` - Updates job status and progress
  - `delete_backtest_job()` - Removes job

#### 3. API Routes (`api_routes.py`)

- **New Endpoints**:
  - `POST /api/backtest-jobs` - Create new job
  - `GET /api/backtest-jobs/{job_id}` - Get job status
  - `GET /api/backtest-jobs/user/{user_id}` - Get user's jobs
  - `DELETE /api/backtest-jobs/{job_id}` - Cancel job
  - Updated `POST /api/backtests/generate` - Now creates jobs instead of running immediately

### Frontend Components

#### 1. BacktestJobStatus Component (`BacktestJobStatus.jsx`)

- **Features**:
  - Real-time job status polling (every 2 seconds)
  - Progress bar visualization
  - Status indicators with colors and icons
  - Error message display
  - Timing information
  - Link to results when completed

#### 2. Enhanced SignalCreation Component

- **New Features**:
  - Template-based strategy selection
  - Visual strategy builder (placeholder)
  - Code editor (placeholder)
  - Integration with backtest job system
  - Real-time job status monitoring

#### 3. API Service Updates (`api.js`)

- **New Methods**:
  - `createBacktestJob()` - Submit new job
  - `getBacktestJob()` - Get job status
  - `getUserBacktestJobs()` - Get user's jobs
  - `cancelBacktestJob()` - Cancel job

## Workflow

### 1. Job Creation

```
User submits strategy → API creates job → Job stored in DynamoDB → Returns job_id
```

### 2. Job Processing

```
Worker polls for pending jobs → Picks up job → Updates status to "running" →
Executes backtest → Updates progress → Stores results → Updates status to "completed"
```

### 3. Job Monitoring

```
Frontend polls job status → Displays progress → Shows completion → Links to results
```

## Strategy Definition System

### Template-Based Approach

```javascript
const STRATEGY_TEMPLATES = {
  momentum: {
    name: 'Momentum Strategy',
    description: 'Uses RSI and MACD to identify momentum shifts',
    indicators: ['RSI', 'MACD', 'Volume'],
    entryConditions: [...],
    exitConditions: [...]
  },
  // ... more templates
};
```

### Strategy Definition Model

```python
class StrategyDefinition(BaseModel):
    name: str
    description: str
    timeframe: Timeframe
    assets: List[str]
    template_id: Optional[str]
    custom_indicators: List[IndicatorConfig]
    entry_conditions: StrategyCondition
    exit_conditions: StrategyCondition
    risk_management: Dict[str, Any]
    code_snippet: Optional[str]
```

## Usage Examples

### Creating a Backtest Job

```javascript
const jobData = {
  user_id: user.id,
  strategy_name: "My RSI Strategy",
  strategy_description: "Simple RSI-based momentum strategy",
  timeframe: "1h",
  assets: ["BTC/USD"],
  period: "6 months",
  initial_capital: 10000,
  strategy_definition: {
    template_id: "momentum",
    risk_management: {
      stop_loss_pct: 2.0,
      take_profit_pct: 6.0,
      position_size_pct: 10.0,
    },
  },
  priority: "normal",
};

const response = await apiService.createBacktestJob(jobData);
const jobId = response.job_id;
```

### Monitoring Job Status

```jsx
<BacktestJobStatus
  jobId={jobId}
  onComplete={(jobData) => {
    console.log("Job completed:", jobData);
    // Handle completion
  }}
/>
```

## Testing

### Test Script

Run the test script to verify the system:

```bash
cd callback-server
python test_backtest_jobs.py
```

This will:

1. Create a test user
2. Create a test strategy definition
3. Submit a backtest job
4. Start the worker
5. Monitor job progress
6. Verify completion

## Benefits

### 1. Scalability

- Asynchronous processing allows handling multiple requests
- Worker can be scaled horizontally
- Database indexes optimize job queries

### 2. User Experience

- Immediate job submission feedback
- Real-time progress monitoring
- Non-blocking UI during backtest execution

### 3. Reliability

- Job status tracking
- Error handling and reporting
- Job cancellation support
- Progress persistence

### 4. Flexibility

- Template-based strategy creation
- Multiple strategy definition modes
- Configurable job priorities
- Extensible worker system

## Future Enhancements

### 1. Advanced Features

- Job scheduling
- Batch job processing
- Job dependencies
- Resource allocation

### 2. Monitoring & Analytics

- Job performance metrics
- Worker health monitoring
- Queue analytics
- Cost tracking

### 3. User Interface

- Visual strategy builder
- Code editor with syntax highlighting
- Strategy library
- Results comparison

### 4. Options Trading

- Options strategy templates
- Greeks calculation
- Risk management for options
- Options-specific backtesting

## Deployment

### Local Development

```bash
# Start LocalStack
./callback-server/dev.sh local

# Start the server (includes worker)
./callback-server/dev.sh start

# Test the system
python callback-server/test_backtest_jobs.py
```

### Production

- Deploy worker as separate service
- Use AWS SQS for job queuing
- Implement auto-scaling
- Add monitoring and alerting

## Security Considerations

1. **Job Isolation**: Each user's jobs are isolated
2. **Input Validation**: All job parameters are validated
3. **Resource Limits**: Jobs have time and memory limits
4. **Error Handling**: Failed jobs are logged and reported
5. **Access Control**: Users can only access their own jobs

This implementation provides a solid foundation for a scalable, user-friendly backtest submission system that can grow with your platform's needs.
