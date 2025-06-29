# LocalStack Enhanced Logging

This document describes the enhanced logging configuration for LocalStack that provides detailed visibility into DynamoDB requests and responses.

## Overview

The LocalStack configuration has been enhanced with comprehensive logging options to help debug DynamoDB operations and other AWS service interactions during development.

## Configuration

### Environment Variables Added

The following environment variables have been added to the LocalStack service in `docker-compose.yml`:

```yaml
# Enhanced logging configuration
- LS_LOG=debug
- LOG_LEVEL=debug
- ENABLE_DEBUG_LOGGING=1
- DEBUG_PERSISTENCE=1
- PERSISTENCE=1
- LS_LOG_LEVEL=debug
- LOCALSTACK_API_KEY=test
- ENABLE_LEGACY_PORTS=1

# DynamoDB specific logging
- DYNAMODB_DEBUG=1
- DYNAMODB_LOG_LEVEL=debug

# Request/Response logging
- ENABLE_REQUEST_LOGGING=1
- ENABLE_RESPONSE_LOGGING=1
- LOG_REQUEST_BODY=1
- LOG_RESPONSE_BODY=1
```

### Volume Mounts

Added a volume mount to persist logs:

```yaml
volumes:
  - "./localstack_logs:/tmp/localstack/logs"
```

## Usage

### 1. Start LocalStack with Enhanced Logging

```bash
cd callback-server
./dev.sh local
```

### 2. View Logs Using the Dedicated Script

The `view_localstack_logs.sh` script provides easy access to filtered logs:

```bash
# Show all LocalStack logs
./view_localstack_logs.sh

# Follow logs in real-time
./view_localstack_logs.sh -f

# Show DynamoDB requests only
./view_localstack_logs.sh -d

# Follow DynamoDB requests in real-time
./view_localstack_logs.sh -f -d

# Show request bodies only
./view_localstack_logs.sh -r

# Clear log files
./view_localstack_logs.sh -c

# Show log information
./view_localstack_logs.sh info
```

### 3. Using Standard Docker Compose Commands

```bash
# View all LocalStack logs
docker compose logs localstack

# Follow LocalStack logs
docker compose logs -f localstack

# View logs for all services
docker compose logs

# Follow all service logs
docker compose logs -f
```

### 4. Test the Enhanced Logging

Run the test script to generate sample DynamoDB operations:

```bash
# Install boto3 if not already installed
pip install boto3

# Run the test script
python test_localstack_logging.py
```

## What You'll See in the Logs

### DynamoDB Operations

The enhanced logging will show detailed information for:

- **CreateTable**: Table schema, indexes, and configuration
- **PutItem**: Item data and attributes
- **GetItem**: Key values and returned data
- **Query**: Query expressions, filters, and results
- **Scan**: Scan parameters and results
- **UpdateItem**: Update expressions and attribute values
- **DeleteItem**: Key values and deletion confirmation
- **DescribeTable**: Table metadata and statistics

### Request/Response Bodies

You'll see the actual JSON payloads for:

- Request bodies sent to LocalStack
- Response bodies returned from LocalStack
- Error messages and stack traces
- Performance metrics and timing information

### Example Log Output

```
2024-01-15T10:30:00.123Z | DEBUG | dynamodb | Request: CreateTable
{
  "TableName": "test_table",
  "KeySchema": [
    {"AttributeName": "id", "KeyType": "HASH"}
  ],
  "AttributeDefinitions": [
    {"AttributeName": "id", "AttributeType": "S"}
  ],
  "BillingMode": "PAY_PER_REQUEST"
}

2024-01-15T10:30:01.456Z | DEBUG | dynamodb | Response: CreateTable
{
  "TableDescription": {
    "TableName": "test_table",
    "TableStatus": "CREATING",
    "ItemCount": 0,
    ...
  }
}
```

## Filtering Examples

### View Only DynamoDB Table Creation

```bash
./view_localstack_logs.sh -d | grep "CreateTable"
```

### View Only Item Operations

```bash
./view_localstack_logs.sh -d | grep -E "(PutItem|GetItem|UpdateItem|DeleteItem)"
```

### View Only Queries and Scans

```bash
./view_localstack_logs.sh -d | grep -E "(Query|Scan)"
```

### View Error Messages

```bash
./view_localstack_logs.sh | grep -i "error\|exception\|failed"
```

## Troubleshooting

### Logs Not Appearing

1. **Check if LocalStack is running**:

   ```bash
   ./dev.sh status
   ```

2. **Restart LocalStack with fresh configuration**:

   ```bash
   ./dev.sh stop
   ./dev.sh local
   ```

3. **Check log file permissions**:
   ```bash
   ls -la localstack_logs/
   ```

### Performance Impact

The enhanced logging may impact performance slightly. For production-like testing, you can temporarily disable some logging by commenting out the relevant environment variables in `docker-compose.yml`.

### Log File Size

Log files can grow large over time. Use the clear command periodically:

```bash
./view_localstack_logs.sh -c
```

## Integration with Development Workflow

### During Development

1. Start LocalStack with enhanced logging
2. Run your application
3. Monitor logs in real-time: `./view_localstack_logs.sh -f -d`
4. Debug DynamoDB operations as they happen

### During Testing

1. Run test scripts
2. Check logs for expected operations
3. Verify request/response payloads
4. Debug any unexpected behavior

### During Debugging

1. Reproduce the issue
2. Check logs for error messages
3. Examine request bodies for malformed data
4. Verify response bodies for unexpected results

## Best Practices

1. **Use filters**: Don't view all logs unless necessary
2. **Follow in real-time**: Use `-f` flag for active debugging
3. **Clear logs periodically**: Prevent log file bloat
4. **Test with sample data**: Use the test script to verify logging works
5. **Monitor performance**: Be aware of logging overhead in performance tests

## Related Files

- `docker-compose.yml` - LocalStack configuration
- `view_localstack_logs.sh` - Log viewing script
- `test_localstack_logging.py` - Test script for logging
- `dev.sh` - Development script with logging commands
