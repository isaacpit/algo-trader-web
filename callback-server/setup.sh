#!/bin/bash

# AlgoTraders Callback Server Setup Script
# Supports both LocalStack (local development) and AWS DynamoDB (production)

set -e

echo "🚀 AlgoTraders Callback Server Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running in LocalStack mode
USE_LOCALSTACK=${USE_LOCALSTACK:-false}
if [ "$USE_LOCALSTACK" = "true" ]; then
    print_status "Running in LocalStack mode (local development)"
    LOCALSTACK_ENDPOINT=${LOCALSTACK_ENDPOINT:-"http://localhost:4566"}
else
    print_status "Running in AWS mode (production)"
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi
print_success "Python 3 found: $(python3 --version)"

# Check pip
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is required but not installed"
    exit 1
fi
print_success "pip3 found: $(pip3 --version)"

# Check Docker (for LocalStack)
if [ "$USE_LOCALSTACK" = "true" ]; then
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required for LocalStack but not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"

    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is required for LocalStack but not available"
        exit 1
    fi
    print_success "Docker Compose found: $(docker compose version)"
fi

# Check AWS CLI (for production)
if [ "$USE_LOCALSTACK" = "false" ]; then
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI not found - you may need it for DynamoDB operations"
    else
        print_success "AWS CLI found: $(aws --version)"
    fi
fi

# Create virtual environment
print_status "Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_success "Dependencies installed"

# Setup environment file
print_status "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp env.example .env
    print_success "Environment file created from template"
    print_warning "Please edit .env file with your configuration"
else
    print_status "Environment file already exists"
fi

# Start LocalStack if in local mode
if [ "$USE_LOCALSTACK" = "true" ]; then
    print_status "Starting LocalStack services..."

    # Stop any existing containers
    docker compose down -v 2>/dev/null || true

    # Start services
    docker compose up -d

    # Wait for LocalStack to be ready
    print_status "Waiting for LocalStack to be ready..."
    max_attempts=30
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$LOCALSTACK_ENDPOINT/health" > /dev/null 2>&1; then
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

    # Set environment variables for LocalStack
    export USE_LOCALSTACK=true
    export LOCALSTACK_ENDPOINT=$LOCALSTACK_ENDPOINT
    export AWS_ACCESS_KEY_ID=test
    export AWS_SECRET_ACCESS_KEY=test
    export AWS_DEFAULT_REGION=us-east-1

    print_success "LocalStack services started"
    print_status "LocalStack endpoint: $LOCALSTACK_ENDPOINT"
    print_status "DynamoDB Admin UI: http://localhost:8001"

else
    # Production setup
    print_status "Setting up AWS DynamoDB..."

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_warning "AWS credentials not configured"
        print_warning "Please configure AWS credentials using:"
        print_warning "  aws configure"
        print_warning "  or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
    else
        print_success "AWS credentials configured"
    fi

    # Create DynamoDB table if it doesn't exist
    TABLE_NAME=${DYNAMODB_TABLE_NAME:-"Algo-Trader-User-Token-Table"}
    REGION=${AWS_REGION:-"us-east-1"}

    print_status "Checking DynamoDB table: $TABLE_NAME"

    if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &> /dev/null; then
        print_success "DynamoDB table already exists"
    else
        print_status "Creating DynamoDB table..."
        aws dynamodb create-table \
            --table-name "$TABLE_NAME" \
            --attribute-definitions AttributeName=user_id,AttributeType=S \
            --key-schema AttributeName=user_id,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST \
            --region "$REGION"

        print_status "Waiting for table to be active..."
        aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
        print_success "DynamoDB table created and active"
    fi
fi

# Populate database with sample data
print_status "Populating database with sample data..."
if python populate_db.py; then
    print_success "Database populated successfully"
else
    print_warning "Failed to populate database - you can run it manually later"
fi

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Set up health check
print_status "Testing server health..."
if [ "$USE_LOCALSTACK" = "true" ]; then
    # Test LocalStack health
    if curl -s "$LOCALSTACK_ENDPOINT/health" > /dev/null; then
        print_success "LocalStack health check passed"
    else
        print_error "LocalStack health check failed"
        exit 1
    fi
fi

# Final setup summary
echo ""
echo "🎉 Setup completed successfully!"
echo "================================"

if [ "$USE_LOCALSTACK" = "true" ]; then
    echo "📋 LocalStack Development Setup:"
    echo "   • LocalStack: $LOCALSTACK_ENDPOINT"
    echo "   • DynamoDB Admin: http://localhost:8001"
    echo "   • Callback Server: http://localhost:3000"
    echo ""
    echo "🚀 To start the server:"
    echo "   source venv/bin/activate"
    echo "   python callback_server.py"
    echo ""
    echo "🔧 Useful commands:"
    echo "   • View logs: docker compose logs -f"
    echo "   • Stop services: docker compose down"
    echo "   • Restart: docker compose restart"
    echo "   • Clear data: docker compose down -v && docker compose up -d"
else
    echo "📋 AWS Production Setup:"
    echo "   • DynamoDB Table: $TABLE_NAME"
    echo "   • AWS Region: $REGION"
    echo "   • Callback Server: http://localhost:3000"
    echo ""
    echo "🚀 To start the server:"
    echo "   source venv/bin/activate"
    echo "   python callback_server.py"
    echo ""
    echo "🔧 Useful commands:"
    echo "   • Check table: aws dynamodb describe-table --table-name $TABLE_NAME"
    echo "   • View items: aws dynamodb scan --table-name $TABLE_NAME"
    echo "   • Health check: curl http://localhost:3000/health"
fi

echo ""
echo "📚 Documentation: README.md"
echo "🔗 API Documentation: http://localhost:3000/docs (when server is running)"
echo ""
print_success "Setup complete! Happy coding! 🚀"
