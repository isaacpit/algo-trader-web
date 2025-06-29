#!/bin/bash

# Billing Alerts Deployment Script
# This script deploys CloudFormation stack for billing alerts and spending controls

set -e

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

# Default values
STACK_NAME="algotraders-billing-alerts"
TEMPLATE_FILE="infra/billing-alerts.yaml"
REGION="us-east-1"
MONTHLY_BUDGET="2.00"
ALERT_THRESHOLD="80"

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -s, --stack-name NAME     CloudFormation stack name (default: $STACK_NAME)"
    echo "  -e, --email EMAIL         Email address for billing alerts (required)"
    echo "  -b, --budget AMOUNT       Monthly budget in USD (default: $MONTHLY_BUDGET)"
    echo "  -t, --threshold PERCENT   Alert threshold percentage (default: $ALERT_THRESHOLD)"
    echo "  -r, --region REGION       AWS region (default: $REGION)"
    echo "  -d, --delete              Delete the stack instead of creating it"
    echo "  -h, --help                Show this help message"
    echo
    echo "Examples:"
    echo "  $0 -e your-email@example.com"
    echo "  $0 -e your-email@example.com -b 5.00 -t 90"
    echo "  $0 -d -s algotraders-billing-alerts"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stack-name)
            STACK_NAME="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL_ADDRESS="$2"
            shift 2
            ;;
        -b|--budget)
            MONTHLY_BUDGET="$2"
            shift 2
            ;;
        -t|--threshold)
            ALERT_THRESHOLD="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -d|--delete)
            DELETE_STACK=true
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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    print_error "Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Function to delete stack
delete_stack() {
    print_status "Deleting CloudFormation stack: $STACK_NAME"

    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"

        print_status "Waiting for stack deletion to complete..."
        aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$REGION"

        print_success "Stack deleted successfully: $STACK_NAME"
    else
        print_warning "Stack does not exist: $STACK_NAME"
    fi
}

# Function to create/update stack
deploy_stack() {
    # Validate required parameters
    if [ -z "$EMAIL_ADDRESS" ]; then
        print_error "Email address is required. Use -e or --email option."
        show_usage
        exit 1
    fi

    # Validate email format (basic check)
    if [[ ! "$EMAIL_ADDRESS" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        print_error "Invalid email format: $EMAIL_ADDRESS"
        exit 1
    fi

    # Validate budget amount
    if ! [[ "$MONTHLY_BUDGET" =~ ^[0-9]+\.?[0-9]*$ ]] || (( $(echo "$MONTHLY_BUDGET <= 0" | bc -l) )); then
        print_error "Invalid budget amount: $MONTHLY_BUDGET"
        exit 1
    fi

    # Validate threshold percentage
    if ! [[ "$ALERT_THRESHOLD" =~ ^[0-9]+$ ]] || [ "$ALERT_THRESHOLD" -lt 1 ] || [ "$ALERT_THRESHOLD" -gt 100 ]; then
        print_error "Invalid threshold percentage: $ALERT_THRESHOLD (must be 1-100)"
        exit 1
    fi

    print_status "Deploying billing alerts stack..."
    print_status "Stack Name: $STACK_NAME"
    print_status "Email: $EMAIL_ADDRESS"
    print_status "Monthly Budget: \$$MONTHLY_BUDGET"
    print_status "Alert Threshold: ${ALERT_THRESHOLD}%"
    print_status "Region: $REGION"

    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        print_status "Stack exists, updating..."
        OPERATION="update-stack"
    else
        print_status "Stack does not exist, creating..."
        OPERATION="create-stack"
    fi

    # Deploy the stack
    aws cloudformation $OPERATION \
        --stack-name "$STACK_NAME" \
        --template-body "file://$TEMPLATE_FILE" \
        --parameters \
            ParameterKey=EmailAddress,ParameterValue="$EMAIL_ADDRESS" \
            ParameterKey=MonthlyBudget,ParameterValue="$MONTHLY_BUDGET" \
            ParameterKey=AlertThreshold,ParameterValue="$ALERT_THRESHOLD" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$REGION" \
        --tags \
            Key=Project,Value=AlgoTraders \
            Key=Purpose,Value=BillingAlerts \
            Key=Environment,Value=Production

    # Wait for stack operation to complete
    if [ "$OPERATION" = "create-stack" ]; then
        print_status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
        print_success "Stack created successfully: $STACK_NAME"
    else
        print_status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
        print_success "Stack updated successfully: $STACK_NAME"
    fi

    # Get stack outputs
    print_status "Getting stack outputs..."
    OUTPUTS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs' --output json)

    # Display outputs
    echo
    print_success "Deployment completed successfully!"
    echo
    echo "Stack Outputs:"
    echo "=============="

    # Parse and display outputs
    echo "$OUTPUTS" | jq -r '.[] | "\(.OutputKey): \(.OutputValue)"' 2>/dev/null || {
        echo "Billing Alerts Topic ARN: $(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`BillingAlertsTopicArn`].OutputValue' --output text)"
        echo "Billing Control Lambda ARN: $(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`BillingControlLambdaArn`].OutputValue' --output text)"
        echo "Dashboard URL: $(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' --output text)"
    }

    echo
    print_status "Next steps:"
    echo "1. Check your email ($EMAIL_ADDRESS) for SNS subscription confirmation"
    echo "2. Confirm the subscription to start receiving alerts"
    echo "3. Monitor the CloudWatch dashboard for billing metrics"
    echo "4. Test the alerts by checking the Lambda function logs"

    # Show dashboard URL
    DASHBOARD_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' --output text 2>/dev/null || echo "https://$REGION.console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=$STACK_NAME-billing-dashboard")
    echo
    echo "CloudWatch Dashboard: $DASHBOARD_URL"
}

# Main execution
if [ "$DELETE_STACK" = true ]; then
    delete_stack
else
    deploy_stack
fi

print_success "Script completed successfully!"
