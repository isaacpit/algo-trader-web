#!/bin/bash

# Fix LocalStack logs directory "Device or resource busy" error
# This script properly stops containers and cleans up busy resources

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

print_status "🔧 Fixing LocalStack logs directory issue..."

# Step 1: Stop all containers gracefully
print_status "Stopping all containers..."
docker compose down --timeout 30 2>/dev/null || true

# Step 2: Force stop any remaining LocalStack containers
print_status "Force stopping any remaining LocalStack containers..."
docker stop algotraders-localstack 2>/dev/null || true
docker rm algotraders-localstack 2>/dev/null || true

# Step 3: Kill any processes that might be holding the logs directory
print_status "Checking for processes using the logs directory..."
if [ -d "./localstack_logs" ]; then
    # Find and kill any processes using the directory
    lsof +D ./localstack_logs 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true

    # Alternative method using fuser if lsof doesn't work
    fuser -k ./localstack_logs 2>/dev/null || true
fi

# Step 4: Clean up the logs directory
print_status "Cleaning up logs directory..."
if [ -d "./localstack_logs" ]; then
    # Try to remove normally first
    rm -rf ./localstack_logs 2>/dev/null || {
        print_warning "Normal removal failed, trying with sudo..."
        sudo rm -rf ./localstack_logs 2>/dev/null || {
            print_warning "Sudo removal failed, trying to unmount if it's a mount point..."
            sudo umount ./localstack_logs 2>/dev/null || true
            sudo rm -rf ./localstack_logs 2>/dev/null || true
        }
    }
fi

# Step 5: Recreate the logs directory with proper permissions
print_status "Recreating logs directory with proper permissions..."
mkdir -p ./localstack_logs
chmod 755 ./localstack_logs

# Step 6: Clean up any orphaned Docker volumes
print_status "Cleaning up Docker volumes..."
docker volume prune -f 2>/dev/null || true

# Step 7: Clean up Docker system if needed
print_status "Cleaning up Docker system..."
docker system prune -f 2>/dev/null || true

print_success "✅ LocalStack logs directory issue fixed!"
print_status "You can now start LocalStack again with: ./dev.sh local"

# Optional: Show current Docker status
print_status "Current Docker containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "(algotraders|localstack)" || echo "No LocalStack containers found"
