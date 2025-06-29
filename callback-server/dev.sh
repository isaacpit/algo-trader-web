#!/bin/bash

# AlgoTraders Development Script
# Easy switching between LocalStack (local) and AWS (production) modes

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
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local     - Start LocalStack development environment"
    echo "  aws       - Switch to AWS production environment"
    echo "  start     - Start the callback server"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show logs for all services"
    echo "  logs [service] - Show logs for specific service (e.g., localstack, dynamodb-admin)"
    echo "  status    - Show service status"
    echo "  populate  - Populate database with sample data"
    echo "  populate debug - Populate database with debug output"
    echo "  tables    - List database tables and their contents"
    echo "  tables debug - List tables with detailed debug output"
    echo "  clean     - Clean up all data and containers"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local     # Start LocalStack environment"
    echo "  $0 start     # Start callback server"
    echo "  $0 aws       # Switch to AWS mode"
    echo "  $0 populate  # Populate database"
    echo "  $0 populate debug  # Populate database with debug output"
    echo "  $0 tables    # List tables and contents"
    echo "  $0 tables debug  # List tables with detailed output"
    echo "  $0 logs      # Show all service logs"
    echo "  $0 logs localstack  # Show LocalStack logs only"
    echo "  $0 logs dynamodb-admin  # Show DynamoDB Admin logs only"
    echo ""
    echo "LocalStack Debug Logging:"
    echo "  Enhanced logging is enabled for LocalStack with DynamoDB request bodies."
    echo "  Use the dedicated log viewer for better filtering:"
    echo "  ./view_localstack_logs.sh -f -d  # Follow DynamoDB requests in real-time"
    echo "  ./view_localstack_logs.sh -d     # Show DynamoDB requests only"
    echo "  ./view_localstack_logs.sh -r     # Show request bodies only"
    echo "  ./view_localstack_logs.sh info   # Show log information"
    echo ""
    echo "Bash Completion:"
    echo "  Enable tab completion for commands and flags:"
    echo "  source dev_completion.sh         # Enable for current session"
    echo "  ./dev_completion.sh install      # Install permanently"
}

# Function to check if LocalStack is running
check_localstack() {
    if curl -s "http://localhost:4566/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start LocalStack environment
start_local() {
    print_status "Starting LocalStack development environment..."

    # Stop any existing services
    docker compose down -v 2>/dev/null || true

    # Start LocalStack services
    docker compose up -d

    # Wait for LocalStack to be ready
    print_status "Waiting for LocalStack to be ready..."
    max_attempts=30
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if check_localstack; then
            print_success "LocalStack is ready"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_error "LocalStack failed to start within $max_attempts attempts"
            exit 1
        fi

        print_status "Waiting for LocalStack... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    # Set environment variables
    export USE_LOCALSTACK=true
    export LOCALSTACK_ENDPOINT=http://localhost:4566
    export AWS_ACCESS_KEY_ID=test
    export AWS_SECRET_ACCESS_KEY=test
    export AWS_DEFAULT_REGION=us-east-1

    print_success "LocalStack development environment started"
    print_status "LocalStack: http://localhost:4566"
    print_status "DynamoDB Admin: http://localhost:8001"
    print_status "Callback Server: http://localhost:3000"
}

# Function to switch to AWS mode
switch_to_aws() {
    print_status "Switching to AWS production environment..."

    # Stop LocalStack if running
    if check_localstack; then
        print_status "Stopping LocalStack services..."
        docker compose down
    fi

    # Unset LocalStack environment variables
    unset USE_LOCALSTACK
    unset LOCALSTACK_ENDPOINT
    unset AWS_ACCESS_KEY_ID
    unset AWS_SECRET_ACCESS_KEY
    unset AWS_DEFAULT_REGION

    print_success "Switched to AWS mode"
    print_warning "Make sure you have AWS credentials configured"
    print_status "Run 'aws configure' if needed"
}

# Function to start callback server
start_server() {
    print_status "Starting callback server..."

    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        print_error "Virtual environment not found. Run setup.sh first."
        exit 1
    fi

    # Activate virtual environment
    source .venv/bin/activate

    # Check if LocalStack is running
    if check_localstack; then
        print_status "LocalStack detected - using local development mode"
        export USE_LOCALSTACK=true
        export LOCALSTACK_ENDPOINT=http://localhost:4566
        export AWS_ACCESS_KEY_ID=test
        export AWS_SECRET_ACCESS_KEY=test
        export AWS_DEFAULT_REGION=us-east-1
    else
        print_status "LocalStack not detected - using AWS mode"
        print_warning "Make sure AWS credentials are configured"
    fi

    # Start the server
    python callback_server.py
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker compose down
    print_success "All services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker compose restart
    print_success "Services restarted"
}

# Function to show logs
show_logs() {
    local service_name="$2"

    if [ -n "$service_name" ]; then
        print_status "Showing logs for service: $service_name"
        docker compose logs -f "$service_name"
    else
        print_status "Showing logs for all services..."
        docker compose logs -f
    fi
}

# Function to show status
show_status() {
    print_status "Service Status:"
    echo ""

    # Check LocalStack
    if check_localstack; then
        print_success "LocalStack: Running (http://localhost:4566)"
    else
        print_warning "LocalStack: Not running"
    fi

    # Check DynamoDB Admin
    if curl -s "http://localhost:8001" > /dev/null 2>&1; then
        print_success "DynamoDB Admin: Running (http://localhost:8001)"
    else
        print_warning "DynamoDB Admin: Not running"
    fi

    # Check Callback Server
    if curl -s "http://localhost:3000/health" > /dev/null 2>&1; then
        print_success "Callback Server: Running (http://localhost:3000)"
    else
        print_warning "Callback Server: Not running"
    fi

    echo ""
    print_status "Environment:"
    if [ "$USE_LOCALSTACK" = "true" ]; then
        print_success "Mode: LocalStack (Development)"
        echo "  LocalStack Endpoint: $LOCALSTACK_ENDPOINT"
    else
        print_status "Mode: AWS (Production)"
        echo "  AWS Region: ${AWS_REGION:-us-east-1}"
    fi
}

# Function to populate database
populate_db() {
    print_status "Populating database with sample data..."

    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        print_error "Virtual environment not found. Run setup.sh first."
        exit 1
    fi

    # Activate virtual environment
    source .venv/bin/activate

    # Set environment based on current mode
    if check_localstack; then
        print_status "Using LocalStack mode"
        export USE_LOCALSTACK=true
        export LOCALSTACK_ENDPOINT=http://localhost:4566
        export AWS_ACCESS_KEY_ID=test
        export AWS_SECRET_ACCESS_KEY=test
        export AWS_DEFAULT_REGION=us-east-1
    else
        print_status "Using AWS mode"
        print_warning "Make sure AWS credentials are configured"
    fi

    # Check if debug mode is requested
    if [ "$2" = "debug" ]; then
        print_status "Running in DEBUG mode - will output generated data"
        export DEBUG=true
    else
        export DEBUG=false
    fi

    # Run population script
    if python populate_db.py; then
        print_success "Database populated successfully"
    else
        print_error "Failed to populate database"
        exit 1
    fi
}

# Function to list tables and their contents
list_tables() {
    print_status "Listing database tables and contents..."

    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        print_error "Virtual environment not found. Run setup.sh first."
        exit 1
    fi

    # Activate virtual environment
    source .venv/bin/activate

    # Set environment based on current mode
    if check_localstack; then
        print_status "Using LocalStack mode"
        export USE_LOCALSTACK=true
        export LOCALSTACK_ENDPOINT=http://localhost:4566
        export AWS_ACCESS_KEY_ID=test
        export AWS_SECRET_ACCESS_KEY=test
        export AWS_DEFAULT_REGION=us-east-1
    else
        print_status "Using AWS mode"
        print_warning "Make sure AWS credentials are configured"
    fi

    # Check if debug mode is requested
    if [ "$2" = "debug" ]; then
        print_status "Running in DEBUG mode - will output detailed data"
        export DEBUG=true
    else
        export DEBUG=false
    fi

    # Run table listing script
    if DEBUG="$DEBUG" python list_tables.py; then
        print_success "Table listing completed successfully"
    else
        print_error "Failed to list tables"
        exit 1
    fi
}

# Function to clean up
clean_up() {
    print_warning "This will remove all data and containers. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up all data and containers..."
        docker compose down -v
#        docker system prune -f
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main script logic
case "${1:-help}" in
    "local")
        start_local
        ;;
    "aws")
        switch_to_aws
        ;;
    "start")
        start_server
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs "$@"
        ;;
    "status")
        show_status
        ;;
    "populate")
        populate_db
        ;;
    "tables")
        list_tables
        ;;
    "clean")
        clean_up
        ;;
    "help"|*)
        show_usage
        ;;
esac
