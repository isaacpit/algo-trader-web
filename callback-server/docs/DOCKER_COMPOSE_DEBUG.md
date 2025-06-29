# Docker Compose Debugging Guide

This guide provides helpful Docker Compose commands for debugging and managing the AlgoTraders callback server services.

## Quick Start

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and start services
docker compose up -d --build

# View service status
./dev.sh status
```

## Service Status & Health Checks

### Check Service Status

```bash
# View all running containers and their status
docker compose ps

# Check if services are healthy
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Quick health check using the dev script
./dev.sh status
```

### Health Endpoints

```bash
# Test callback server health
curl -f http://localhost:3000/health

# Test LocalStack health
curl -f http://localhost:4566/health

# Test DynamoDB Admin
curl -f http://localhost:8001
```

## Logs & Debugging

### View Service Logs

```bash
# View logs for all services
docker compose logs

# View logs for specific service
docker compose logs callback-server
docker compose logs localstack
docker compose logs dynamodb-admin

# Follow logs in real-time
docker compose logs -f
docker compose logs -f callback-server

# View last N lines
docker compose logs --tail=50 callback-server
docker compose logs --tail=100

# View logs since specific time
docker compose logs --since="2024-01-01T00:00:00" callback-server
```

### Debug Startup Issues

```bash
# Start services in foreground to see startup logs
docker compose up

# Start specific service in foreground
docker compose up callback-server

# Check container startup logs
docker compose logs callback-server | grep -E "(ERROR|WARN|Failed|Exception)"

# Check for common startup issues
docker compose logs callback-server | grep -E "(port|bind|address|connection)"
```

## Build & Image Issues

### Debug Build Problems

```bash
# Rebuild without cache
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache callback-server

# Check image details
docker images | grep callback-server

# Inspect image layers
docker history callback-server-callback-server

# Check Dockerfile syntax
docker build --dry-run -f Dockerfile .
```

### Container Inspection

```bash
# Inspect running container
docker compose exec callback-server ls -la /app

# Check container environment variables
docker compose exec callback-server env

# Check container processes
docker compose exec callback-server ps aux

# Check container network
docker compose exec callback-server netstat -tlnp || echo "netstat not available"

# Check container filesystem
docker compose exec callback-server df -h
```

## Network & Connectivity

### Debug Network Issues

```bash
# Check network connectivity between containers
docker compose exec callback-server ping localstack
docker compose exec callback-server ping dynamodb-admin

# Check port bindings
docker compose port callback-server 3000
docker compose port localstack 4566

# Inspect network configuration
docker network ls
docker network inspect callback-server_algotraders-network

# Test service connectivity
docker compose exec callback-server curl -f http://localstack:4566/health
```

### Port Conflicts

```bash
# Check what's using specific ports
lsof -i :3000
lsof -i :4566
lsof -i :8001

# Check all Docker port mappings
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

## Database & LocalStack Issues

### Debug LocalStack

```bash
# Check LocalStack services
curl -s http://localhost:4566/health | jq .

# List LocalStack services
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# Check DynamoDB table
aws --endpoint-url=http://localhost:4566 dynamodb describe-table --table-name Algo-Trader-User-Token-Table

# Test DynamoDB operations
aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name Algo-Trader-User-Token-Table
```

### Debug Database Connection

```bash
# Check database connection from callback server
docker compose exec callback-server python -c "
import boto3
dynamodb = boto3.resource('dynamodb', endpoint_url='http://localstack:4566',
                         aws_access_key_id='test', aws_secret_access_key='test')
tables = list(dynamodb.tables.all())
print(f'Available tables: {[t.name for t in tables]}')
"
```

## Performance & Resource Issues

### Check Resource Usage

```bash
# Check container resource usage
docker stats

# Check specific container resources
docker stats callback-server localstack dynamodb-admin

# Check disk usage
docker system df

# Check image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Memory & CPU Issues

```bash
# Check container memory usage
docker compose exec callback-server cat /proc/meminfo

# Check container CPU info
docker compose exec callback-server cat /proc/cpuinfo

# Monitor resource usage in real-time
watch -n 1 'docker stats --no-stream'
```

## Common Issues & Solutions

### Service Won't Start

```bash
# Check if ports are already in use
lsof -i :3000 :4566 :8001

# Kill processes using ports
sudo lsof -ti:3000 | xargs kill -9

# Restart Docker daemon (if needed)
sudo systemctl restart docker
```

### Container Exits Immediately

```bash
# Check container exit code
docker compose ps -a

# View container logs for exited container
docker compose logs callback-server

# Check container configuration
docker compose config
```

### Build Fails

```bash
# Check Dockerfile syntax
docker build --dry-run -f Dockerfile .

# Check for missing files
ls -la Dockerfile requirements.txt

# Check Python dependencies
cat requirements.txt

# Try building with verbose output
docker compose build --progress=plain callback-server
```

### Database Connection Issues

```bash
# Check if LocalStack is ready
curl -f http://localhost:4566/health

# Wait for LocalStack to be ready
timeout 60 bash -c 'until curl -f http://localhost:4566/health; do sleep 2; done'

# Check table creation
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
```

## Advanced Debugging

### Interactive Debugging

```bash
# Start container with interactive shell
docker compose run --rm callback-server bash

# Debug Python application
docker compose exec callback-server python -c "
import sys
print('Python version:', sys.version)
import boto3
print('Boto3 version:', boto3.__version__)
"
```

### Environment Variables

```bash
# Check environment variables
docker compose exec callback-server env | grep -E "(AWS|DYNAMODB|LOCALSTACK)"

# Set environment variables for debugging
AWS_DEBUG=true docker compose up callback-server
```

### Volume Issues

```bash
# Check volume mounts
docker compose exec callback-server ls -la /app/logs
docker compose exec callback-server ls -la /app/data

# Check volume permissions
docker compose exec callback-server ls -la /app
```

## Cleanup Commands

### Clean Up Resources

```bash
# Stop and remove containers
docker compose down

# Remove volumes (WARNING: This deletes data)
docker compose down -v

# Remove images
docker compose down --rmi all

# Clean up unused resources
docker system prune -f

# Clean up everything (WARNING: This removes all unused Docker resources)
docker system prune -a -f --volumes
```

### Reset Everything

```bash
# Complete reset (WARNING: This removes all data)
docker compose down -v
docker system prune -a -f --volumes
docker compose up -d --build
```

## Monitoring & Alerts

### Set Up Monitoring

```bash
# Monitor logs for errors
docker compose logs -f callback-server | grep -E "(ERROR|WARN|Exception)"

# Monitor health endpoints
watch -n 30 'curl -s http://localhost:3000/health | jq .'

# Monitor resource usage
watch -n 10 'docker stats --no-stream'
```

### Health Check Script

```bash
#!/bin/bash
# health_check.sh
echo "Checking service health..."

# Check callback server
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Callback server is healthy"
else
    echo "❌ Callback server is down"
fi

# Check LocalStack
if curl -f http://localhost:4566/health > /dev/null 2>&1; then
    echo "✅ LocalStack is healthy"
else
    echo "❌ LocalStack is down"
fi

# Check DynamoDB Admin
if curl -f http://localhost:8001 > /dev/null 2>&1; then
    echo "✅ DynamoDB Admin is healthy"
else
    echo "❌ DynamoDB Admin is down"
fi
```

## Troubleshooting Checklist

When debugging issues, follow this checklist:

1. **Check service status**: `docker compose ps`
2. **View logs**: `docker compose logs [service-name]`
3. **Check health endpoints**: `curl -f http://localhost:3000/health`
4. **Verify network**: `docker network inspect callback-server_algotraders-network`
5. **Check resource usage**: `docker stats`
6. **Verify environment**: `docker compose exec callback-server env`
7. **Test connectivity**: `docker compose exec callback-server ping localstack`
8. **Check build**: `docker compose build --no-cache`
9. **Restart services**: `docker compose restart`
10. **Clean rebuild**: `docker compose down && docker compose up -d --build`

## Getting Help

If you're still having issues:

1. Check the logs for specific error messages
2. Verify all required environment variables are set
3. Ensure ports are not already in use
4. Check Docker and Docker Compose versions
5. Try a complete reset with `docker compose down -v && docker system prune -a -f --volumes`

For more detailed debugging, use the interactive debugging commands above to inspect the running containers.
