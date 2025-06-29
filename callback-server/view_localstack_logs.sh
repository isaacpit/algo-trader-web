#!/bin/bash

# LocalStack Log Viewer Script
# Provides easy access to LocalStack debug logs with filtering options

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -f, --follow     Follow logs in real-time"
    echo "  -d, --dynamodb   Filter for DynamoDB requests only"
    echo "  -r, --requests   Filter for request bodies only"
    echo "  -a, --all        Show all logs (default)"
    echo "  -c, --clear      Clear log files"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show all logs"
    echo "  $0 -f                 # Follow all logs in real-time"
    echo "  $0 -d                 # Show DynamoDB requests only"
    echo "  $0 -f -d              # Follow DynamoDB requests in real-time"
    echo "  $0 -r                 # Show request bodies only"
    echo "  $0 -c                 # Clear log files"
    echo ""
    echo "Filter Examples:"
    echo "  $0 -d | grep 'CreateTable'    # Show DynamoDB table creation"
    echo "  $0 -d | grep 'PutItem'        # Show DynamoDB item creation"
    echo "  $0 -d | grep 'Query'          # Show DynamoDB queries"
    echo "  $0 -d | grep 'Scan'           # Show DynamoDB scans"
}

# Function to check if LocalStack is running
check_localstack() {
    if docker ps --format "table {{.Names}}" | grep -q "algotraders-localstack"; then
        return 0
    else
        return 1
    fi
}

# Function to view logs
view_logs() {
    local follow=false
    local dynamodb_only=false
    local requests_only=false
    local clear_logs=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow)
                follow=true
                shift
                ;;
            -d|--dynamodb)
                dynamodb_only=true
                shift
                ;;
            -r|--requests)
                requests_only=true
                shift
                ;;
            -a|--all)
                # Default behavior, no special filtering
                shift
                ;;
            -c|--clear)
                clear_logs=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Check if LocalStack is running
    if ! check_localstack; then
        print_error "LocalStack is not running. Start it with: ./dev.sh local"
        exit 1
    fi

    # Clear logs if requested
    if [ "$clear_logs" = true ]; then
        print_status "Clearing LocalStack logs..."
        docker exec algotraders-localstack rm -rf /tmp/localstack/logs/*
        print_success "Logs cleared"
        return 0
    fi

    # Build docker compose logs command
    local log_cmd="docker compose logs"

    if [ "$follow" = true ]; then
        log_cmd="$log_cmd -f"
    fi

    log_cmd="$log_cmd localstack"

    # Apply filters
    if [ "$dynamodb_only" = true ]; then
        print_status "Showing DynamoDB requests only..."
        if [ "$follow" = true ]; then
            print_status "Following DynamoDB logs in real-time..."
        fi
        eval "$log_cmd" | grep -i "dynamodb\|dynamo\|aws"
    elif [ "$requests_only" = true ]; then
        print_status "Showing request bodies only..."
        if [ "$follow" = true ]; then
            print_status "Following request logs in real-time..."
        fi
        eval "$log_cmd" | grep -i "request\|body\|payload"
    else
        print_status "Showing all LocalStack logs..."
        if [ "$follow" = true ]; then
            print_status "Following all logs in real-time..."
        fi
        eval "$log_cmd"
    fi
}

# Function to show log file locations
show_log_info() {
    print_status "LocalStack Log Information:"
    echo ""
    echo "Container Logs:"
    echo "  - Docker logs: docker compose logs localstack"
    echo "  - Follow logs: docker compose logs -f localstack"
    echo ""
    echo "File Logs (if enabled):"
    echo "  - Local directory: ./localstack_logs/"
    echo "  - Container path: /tmp/localstack/logs/"
    echo ""
    echo "Useful Commands:"
    echo "  - View all logs: $0"
    echo "  - Follow all logs: $0 -f"
    echo "  - DynamoDB only: $0 -d"
    echo "  - Follow DynamoDB: $0 -f -d"
    echo "  - Request bodies: $0 -r"
    echo "  - Clear logs: $0 -c"
}

# Main script logic
if [ $# -eq 0 ]; then
    # No arguments provided, show all logs
    view_logs
else
    case "$1" in
        "info")
            show_log_info
            ;;
        *)
            view_logs "$@"
            ;;
    esac
fi
