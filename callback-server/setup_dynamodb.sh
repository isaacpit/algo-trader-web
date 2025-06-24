#!/bin/bash

# Setup DynamoDB and IAM permissions for AlgoTraders Callback Server
# This script helps set up the required AWS infrastructure using existing CloudFormation resources

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

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first:"
        echo "  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI is installed"
}

# Check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run:"
        echo "  aws configure"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    print_success "AWS credentials configured"
    print_status "Account ID: $ACCOUNT_ID"
    print_status "User ARN: $USER_ARN"
}

# Check if DynamoDB table exists (created by CloudFormation)
check_dynamodb_table() {
    print_status "Checking DynamoDB table..."
    
    TABLE_NAME="Algo-Trader-User-Token-Table"
    REGION=${AWS_REGION:-us-east-1}
    
    if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &> /dev/null; then
        print_success "DynamoDB table $TABLE_NAME exists"
        return 0
    else
        print_error "DynamoDB table $TABLE_NAME does not exist"
        print_status "Please deploy the CloudFormation stack first:"
        echo "  aws cloudformation deploy --template-file infra/templates/dynamodb.yaml --stack-name algotraders-dynamodb --region $REGION"
        exit 1
    fi
}

# Check if IAM role exists (created by CloudFormation)
check_iam_role() {
    print_status "Checking IAM role..."
    
    ROLE_NAME="AlgoTraderEC2Role"
    
    if aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
        print_success "IAM role $ROLE_NAME exists"
        return 0
    else
        print_error "IAM role $ROLE_NAME does not exist"
        print_status "Please deploy the CloudFormation stack first:"
        echo "  aws cloudformation deploy --template-file infra/templates/ec2-iam.yaml --stack-name algotraders-ec2-iam --region $REGION"
        exit 1
    fi
}

# Check if instance profile exists (created by CloudFormation)
check_instance_profile() {
    print_status "Checking instance profile..."
    
    PROFILE_NAME="AlgoTraderEC2InstanceProfile"
    
    if aws iam get-instance-profile --instance-profile-name "$PROFILE_NAME" &> /dev/null; then
        print_success "Instance profile $PROFILE_NAME exists"
        return 0
    else
        print_error "Instance profile $PROFILE_NAME does not exist"
        print_status "Please deploy the CloudFormation stack first:"
        echo "  aws cloudformation deploy --template-file infra/templates/ec2-iam.yaml --stack-name algotraders-ec2-iam --region $REGION"
        exit 1
    fi
}

# Deploy CloudFormation stacks if needed
deploy_cloudformation_stacks() {
    print_status "Checking CloudFormation stacks..."
    
    REGION=${AWS_REGION:-us-east-1}
    DYNAMODB_STACK="algotrader-user-token-dynamodb"
    EC2_IAM_STACK="algotrader-ec2-iam"
    
    # Check if DynamoDB stack exists
    if ! aws cloudformation describe-stacks --stack-name "$DYNAMODB_STACK" --region "$REGION" &> /dev/null; then
        print_status "Deploying DynamoDB CloudFormation stack..."
        aws cloudformation deploy \
            --template-file infra/templates/dynamodb.yaml \
            --stack-name "$DYNAMODB_STACK" \
            --region "$REGION" \
            --capabilities CAPABILITY_IAM
        print_success "DynamoDB stack deployed successfully"
    else
        print_success "DynamoDB stack already exists"
    fi
    
    # Check if EC2 IAM stack exists
    if ! aws cloudformation describe-stacks --stack-name "$EC2_IAM_STACK" --region "$REGION" &> /dev/null; then
        print_status "Deploying EC2 IAM CloudFormation stack..."
        aws cloudformation deploy \
            --template-file infra/templates/ec2-iam.yaml \
            --stack-name "$EC2_IAM_STACK" \
            --region "$REGION" \
            --capabilities CAPABILITY_IAM
        print_success "EC2 IAM stack deployed successfully"
    else
        print_success "EC2 IAM stack already exists"
    fi
}

# Test DynamoDB connection
test_dynamodb_connection() {
    print_status "Testing DynamoDB connection..."
    
    TABLE_NAME="Algo-Trader-User-Token-Table"
    REGION=${AWS_REGION:-us-east-1}
    
    # Test table access
    if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &> /dev/null; then
        print_success "DynamoDB connection test successful"
        
        # Test basic operations
        aws dynamodb put-item \
            --table-name "$TABLE_NAME" \
            --item '{"USER_ID":{"S":"test-user"},"TIMESTAMP":{"S":"2024-01-01T00:00:00"},"email":{"S":"test@example.com"}}' \
            --region "$REGION" &> /dev/null
        
        aws dynamodb delete-item \
            --table-name "$TABLE_NAME" \
            --key '{"USER_ID":{"S":"test-user"},"TIMESTAMP":{"S":"2024-01-01T00:00:00"}}' \
            --region "$REGION" &> /dev/null
        
        print_success "DynamoDB read/write test successful"
    else
        print_error "DynamoDB connection test failed"
        exit 1
    fi
}

# Get instance profile ARN
get_instance_profile_arn() {
    PROFILE_NAME="AlgoTraderEC2InstanceProfile"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=${AWS_REGION:-us-east-1}
    
    echo "arn:aws:iam::$ACCOUNT_ID:instance-profile/$PROFILE_NAME"
}

# Main execution
main() {
    echo "🔧 Setting up DynamoDB and IAM for AlgoTraders Callback Server"
    echo "=============================================================="
    echo "Using CloudFormation-defined resources"
    echo
    
    # Check prerequisites
    check_aws_cli
    check_aws_credentials
    
    echo
    
    # Deploy CloudFormation stacks if needed
    deploy_cloudformation_stacks
    
    echo
    
    # Verify resources exist
    check_dynamodb_table
    check_iam_role
    check_instance_profile
    
    echo
    
    # Test connection
    test_dynamodb_connection
    
    echo
    
    print_success "Setup complete!"
    print_status "Next steps:"
    echo "1. Attach the IAM role to your EC2 instance:"
    echo "   - Go to EC2 Console → Instances → Select your instance"
    echo "   - Actions → Security → Modify IAM role"
    echo "   - Select: AlgoTraderEC2InstanceProfile"
    echo ""
    echo "2. Update your environment variables:"
    echo "   AWS_REGION=us-east-1"
    echo "   DYNAMODB_TABLE_NAME=Algo-Trader-User-Token-Table"
    echo ""
    echo "3. Restart your callback server:"
    echo "   sudo systemctl restart algotraders-callback"
    echo ""
    echo "4. Test the integration:"
    echo "   curl https://api.algotraders.dev/health"
    echo "   aws dynamodb scan --table-name Algo-Trader-User-Token-Table --region us-east-1 --limit 5"
}

# Run main function
main "$@" 