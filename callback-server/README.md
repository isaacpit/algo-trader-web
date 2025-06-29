# AlgoTraders Callback Server

A FastAPI-based callback server for handling OAuth authentication and providing API endpoints for the AlgoTraders application. Supports both LocalStack (local development) and AWS DynamoDB (production).

## Features

- **OAuth Authentication**: Google OAuth callback handling
- **Database Integration**: DynamoDB with LocalStack support for local development
- **API Endpoints**: Feed, backtests, signals, and user management
- **Rate Limiting**: Built-in rate limiting for API protection
- **CORS Support**: Configurable CORS for frontend integration
- **Health Monitoring**: Health check endpoints and monitoring

## Quick Start

### Prerequisites

- Python 3.8+
- Docker and Docker Compose
- Google OAuth credentials (for production)

### Local Development with LocalStack

1. **Clone and setup**:

```bash
cd callback-server
cp env.example .env
# Edit .env with your configuration
```

2. **Start LocalStack and services**:

```bash
docker-compose up -d
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

4. **Populate database with sample data**:

```bash
# Set environment for LocalStack
export USE_LOCALSTACK=true
export LOCALSTACK_ENDPOINT=http://localhost:4566

# Run population script
python populate_db.py
```

5. **Start the server**:

```bash
python callback_server.py
```

The server will be available at `http://localhost:3000`

### Production Setup

1. **Configure environment**:

```bash
cp env.example .env
# Edit .env with production settings
# Set USE_LOCALSTACK=false
# Configure AWS credentials and DynamoDB table
```

2. **Deploy with Docker**:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Configuration

### Environment Variables

| Variable               | Description                    | Default                 | Required |
| ---------------------- | ------------------------------ | ----------------------- | -------- |
| `HOST`                 | Server host                    | `0.0.0.0`               | No       |
| `PORT`                 | Server port                    | `3000`                  | No       |
| `DEBUG`                | Debug mode                     | `false`                 | No       |
| `SECRET_KEY`           | JWT secret key                 | -                       | Yes      |
| `ALLOWED_ORIGINS`      | CORS allowed origins           | -                       | Yes      |
| `TRUSTED_HOSTS`        | Trusted hosts                  | -                       | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID         | -                       | Yes      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret     | -                       | Yes      |
| `AWS_REGION`           | AWS region                     | `us-east-1`             | No       |
| `DYNAMODB_TABLE_NAME`  | DynamoDB table name            | -                       | Yes      |
| `USE_LOCALSTACK`       | Use LocalStack for local dev   | `false`                 | No       |
| `LOCALSTACK_ENDPOINT`  | LocalStack endpoint            | `http://localhost:4566` | No       |
| `RATE_LIMIT_REQUESTS`  | Rate limit requests per window | `1000`                  | No       |
| `RATE_LIMIT_WINDOW`    | Rate limit window in seconds   | `3600`                  | No       |

### LocalStack vs AWS DynamoDB

**LocalStack (Development)**:

- Set `USE_LOCALSTACK=true`
- Uses local DynamoDB instance
- No AWS credentials required
- Faster development iteration
- Data persists in Docker volumes

**AWS DynamoDB (Production)**:

- Set `USE_LOCALSTACK=false`
- Uses real AWS DynamoDB
- Requires AWS credentials
- Production-ready scalability
- Data persists in AWS

## API Endpoints

### Authentication

- `POST /callback` - OAuth callback handler
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/tokens/{user_id}` - Get user tokens
- `DELETE /api/auth/tokens/{user_id}` - Delete expired tokens

### Feed and Content

- `GET /api/feed` - Get paginated feed items
- `GET /api/signals` - Get signals
- `GET /api/signals/{signal_id}` - Get specific signal
- `POST /api/signals` - Create new signal
- `GET /api/backtests` - Get backtests
- `GET /api/backtests/{backtest_id}` - Get specific backtest
- `POST /api/backtests` - Generate new backtest

### Health and Monitoring

- `GET /health` - Health check
- `GET /` - Root endpoint with server info

## Database Schema

### Users Table

```json
{
  "user_id": "string",
  "email": "string",
  "name": "string",
  "picture": "string",
  "verified": "boolean",
  "followers": "number",
  "created_at": "string",
  "updated_at": "string"
}
```

### Signals Table

```json
{
  "signal_id": "string",
  "user_id": "string",
  "name": "string",
  "description": "string",
  "timeframe": "string",
  "assets": ["string"],
  "entry": "string",
  "target": "string",
  "stop_loss": "string",
  "confidence": "number",
  "status": "string",
  "performance": "object",
  "chart_data": "object",
  "created_at": "string",
  "updated_at": "string",
  "likes": "number",
  "comments": "number",
  "shares": "number"
}
```

### Backtests Table

```json
{
  "backtest_id": "string",
  "user_id": "string",
  "name": "string",
  "description": "string",
  "timeframe": "string",
  "assets": ["string"],
  "period": "string",
  "initial_capital": "number",
  "final_capital": "number",
  "status": "string",
  "performance": "object",
  "chart_data": "object",
  "strategy_config": "object",
  "created_at": "string",
  "updated_at": "string",
  "likes": "number",
  "comments": "number",
  "shares": "number"
}
```

## Development Tools

### LocalStack Access

When running with LocalStack, you can access:

- **LocalStack Health**: http://localhost:4566/health
- **DynamoDB Admin UI**: http://localhost:8001
- **AWS CLI with LocalStack**:
  ```bash
  aws --endpoint-url=http://localhost:4566 dynamodb list-tables
  ```

### Database Management

**Populate with sample data**:

```bash
python populate_db.py
```

**Clear database**:

```bash
# For LocalStack
docker-compose down -v
docker-compose up -d
```

**View database contents**:

```bash
# Using AWS CLI with LocalStack
aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name Algo-Trader-User-Token-Table
```

### Backtest Generation

The server includes a backtest generator that can create realistic trading strategy backtests:

```python
from backtest_generator import BacktestGenerator

generator = BacktestGenerator()
backtest = await generator.generate_backtest({
    "strategy_name": "RSI Momentum",
    "timeframe": "1h",
    "assets": ["BTC/USD"],
    "initial_capital": 10000,
    "strategy_config": {"type": "momentum"}
})
```

## Docker Services

### LocalStack

- **Port**: 4566
- **Purpose**: Local AWS services emulation
- **Services**: DynamoDB, SNS, SQS, Lambda, CloudWatch

### Callback Server

- **Port**: 3000
- **Purpose**: Main application server
- **Dependencies**: LocalStack

### DynamoDB Admin

- **Port**: 8001
- **Purpose**: Web UI for DynamoDB management
- **Dependencies**: LocalStack

## Monitoring and Logging

### Health Checks

```bash
# Server health
curl http://localhost:3000/health

# LocalStack health
curl http://localhost:4566/health
```

### Logs

```bash
# View server logs
docker-compose logs callback-server

# View LocalStack logs
docker-compose logs localstack
```

## Troubleshooting

### Common Issues

1. **LocalStack not starting**:

   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. **Database connection issues**:

   - Check if LocalStack is running: `curl http://localhost:4566/health`
   - Verify environment variables: `USE_LOCALSTACK=true`
   - Check table exists: `aws --endpoint-url=http://localhost:4566 dynamodb list-tables`

3. **CORS issues**:

   - Verify `ALLOWED_ORIGINS` includes your frontend URL
   - Check browser console for CORS errors

4. **Rate limiting**:
   - Increase `RATE_LIMIT_REQUESTS` for development
   - Check rate limit storage in memory

### Performance Optimization

- Use LocalStack for development to avoid AWS costs
- Implement Redis for rate limiting in production
- Add database connection pooling for high traffic
- Use CloudWatch for monitoring in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
