# Mock API Configuration Guide

This guide explains how to switch between using mock data and the real backend API in the AlgoTraders frontend application.

## Quick Toggle

To switch between mock data and real API, simply set the `VITE_USE_MOCK_API` environment variable:

### Use Mock Data (for development/testing)

```bash
# In your .env file
VITE_USE_MOCK_API=true
```

### Use Real API (for production/backend testing)

```bash
# In your .env file
VITE_USE_MOCK_API=false
```

## Configuration Details

### Environment Variables

| Variable            | Description          | Default                 | Example                       |
| ------------------- | -------------------- | ----------------------- | ----------------------------- |
| `VITE_USE_MOCK_API` | Toggle mock API mode | `false`                 | `true` or `false`             |
| `VITE_API_BASE_URL` | Real API base URL    | `http://localhost:3000` | `https://api.algotraders.dev` |

### Mock Data Features

When `VITE_USE_MOCK_API=true`:

- ✅ **500 generated feed items** with realistic data
- ✅ **Signals and backtests** with proper performance metrics
- ✅ **Chart data** with realistic trading patterns
- ✅ **Pagination support** (10, 20, 50 items per page)
- ✅ **Filtering by type** (signal/backtest) and timeframe
- ✅ **Simulated API delays** for realistic testing
- ✅ **Performance tracking** and error simulation

### Real API Features

When `VITE_USE_MOCK_API=false`:

- 🔗 **Live backend connection** to your callback server
- 🔗 **Real database data** from DynamoDB
- 🔗 **Authentication required** for protected endpoints
- 🔗 **Real-time updates** and data persistence

## Usage Examples

### Development Workflow

1. **Start with mock data** for UI development:

   ```bash
   echo "VITE_USE_MOCK_API=true" >> .env
   npm run dev
   ```

2. **Switch to real API** for backend integration:
   ```bash
   echo "VITE_USE_MOCK_API=false" >> .env
   # Make sure your backend is running
   cd callback-server && ./dev.sh start
   ```

### Testing Different Scenarios

#### Test with Large Dataset

```bash
# Mock API provides 500 items for pagination testing
VITE_USE_MOCK_API=true
```

#### Test Backend Integration

```bash
# Real API uses your actual database
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

#### Test Production Environment

```bash
# Real API pointing to production
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.algotraders.dev
```

## Console Logging

The application provides detailed console logging to show which mode is active:

### Mock Mode

```
🔧 Environment Configuration:
   USE_MOCK_API: 🎭 MOCK MODE

🎭 MOCK API MODE ENABLED:
   Using mock feed data from src/data/mockFeedData.js
   To switch to real API, set VITE_USE_MOCK_API=false in .env

[API SERVICE] Configuration:
   USE_MOCK_API: 🎭 MOCK MODE

[FEED API] Using MOCK data provider
[MOCK SERVER] Generated 500 mock feed items
```

### Real API Mode

```
🔧 Environment Configuration:
   USE_MOCK_API: 🔗 REAL API

🔗 REAL API MODE:
   Connecting to backend at: http://localhost:3000
   To use mock data, set VITE_USE_MOCK_API=true in .env

[API SERVICE] Configuration:
   USE_MOCK_API: 🔗 REAL API

[FEED API] Using REAL API provider
```

## Data Structure Normalization

The API service automatically normalizes data between mock and real API formats:

- **Mock data** uses `camelCase` (e.g., `chartData`, `winRate`)
- **Real API** uses `snake_case` (e.g., `chart_data`, `win_rate`)
- **Frontend** receives consistent `snake_case` format regardless of source

## Troubleshooting

### Mock API Not Working

1. Check that `VITE_USE_MOCK_API=true` in your `.env` file
2. Restart the development server: `npm run dev`
3. Check browser console for mock API logs

### Real API Connection Issues

1. Ensure backend server is running: `cd callback-server && ./dev.sh status`
2. Check `VITE_API_BASE_URL` matches your backend URL
3. Verify network connectivity and CORS settings

### Environment Variables Not Loading

1. Make sure `.env` file is in the project root
2. Restart the development server after changing `.env`
3. Check that variable names start with `VITE_`

## Performance Comparison

| Feature           | Mock API              | Real API                   |
| ----------------- | --------------------- | -------------------------- |
| Response Time     | 200-800ms (simulated) | Varies (network dependent) |
| Data Volume       | 500 items             | Database dependent         |
| Offline Support   | ✅ Yes                | ❌ No                      |
| Real-time Updates | ❌ No                 | ✅ Yes                     |
| Authentication    | ❌ Simulated          | ✅ Required                |

## Best Practices

1. **Use mock data** during initial UI development
2. **Switch to real API** for integration testing
3. **Use environment variables** instead of hard-coding
4. **Monitor console logs** to verify correct mode
5. **Test both modes** before deploying

---

**Note**: Remember to restart your development server after changing environment variables!
