#!/bin/bash

# AlgoTraders Service Health Check Script
# This script checks the health of all services in the Docker Compose setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔍 AlgoTraders Service Health Check"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker compose > /dev/null 2>&1; then
    print_error "Docker Compose is not available"
    exit 1
fi

print_status "Checking service status..."

# Check if services are running
if ! docker compose ps > /dev/null 2>&1; then
    print_error "Docker Compose services are not running"
    print_status "Run 'docker compose up -d' to start services"
    exit 1
fi

echo ""
print_status "Service Status:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_status "Health Endpoint Checks:"

# Check callback server health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Callback Server: Healthy (http://localhost:3000)"
else
    print_error "Callback Server: Unhealthy or not responding"
fi

# Check LocalStack health
if curl -f http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    print_success "LocalStack: Healthy (http://localhost:4566)"
else
    print_error "LocalStack: Unhealthy or not responding"
fi

# Check DynamoDB Admin
if curl -f http://localhost:8001 > /dev/null 2>&1; then
    print_success "DynamoDB Admin: Running (http://localhost:8001)"
else
    print_error "DynamoDB Admin: Not responding"
fi

echo ""
print_status "Database Connection Test:"

# Test database connection
if docker compose exec -T callback-server python -c "
import boto3
try:
    dynamodb = boto3.resource('dynamodb',
                             endpoint_url='http://localstack:4566',
                             region_name='us-east-1',
                             aws_access_key_id='test',
                             aws_secret_access_key='test')
    tables = list(dynamodb.tables.all())
    print('Available tables:', [t.name for t in tables])
    print('Database connection: SUCCESS')
except Exception as e:
    print('Database connection: FAILED -', str(e))
    exit(1)
" 2>/dev/null; then
    print_success "Database connection: Working"
else
    print_error "Database connection: Failed"
fi

echo ""
print_status "Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
print_status "Recent Logs (last 5 lines per service):"
echo ""

# Show recent logs for each service
for service in callback-server localstack dynamodb-admin; do
    echo "📋 $service logs:"
    docker compose logs --tail=5 $service 2>/dev/null || print_warning "No logs available for $service"
    echo ""
done

echo "✅ Health check completed!"
echo ""
print_status "Quick Commands:"
echo "  View logs: docker compose logs -f [service-name]"
echo "  Restart:   docker compose restart [service-name]"
echo "  Rebuild:   docker compose up -d --build"
echo "  Stop all:  docker compose down"
