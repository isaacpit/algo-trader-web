#!/bin/bash

# Check CloudFormation infrastructure status for AlgoTraders
# This script verifies that all required AWS resources are properly deployed

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

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        return 1
    fi
    print_success "AWS CLI is installed"
    return 0
}

# Check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        return 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    print_success "AWS credentials configured"
    print_status "Account ID: $ACCOUNT_ID"
    print_status "User ARN: $USER_ARN"
    return 0
}

# Check CloudFormation stack status
check_stack_status() {
    local stack_name=$1
    local region=${AWS_REGION:-us-east-1}
    
    if aws cloudformation describe-stacks --stack-name "$stack_name" --region "$region" &> /dev/null; then
        STATUS=$(aws cloudformation describe-stacks --stack-name "$stack_name" --region "$region" --query 'Stacks[0].StackStatus' --output text)
        if [[ "$STATUS" == "CREATE_COMPLETE" || "$STATUS" == "UPDATE_COMPLETE" ]]; then
            print_success "Stack $stack_name: $STATUS"
            return 0
        else
            print_warning "Stack $stack_name: $STATUS"
            return 1
        fi
    else
        print_error "Stack $stack_name does not exist"
        return 1
    fi
}

# Check DynamoDB table
check_dynamodb_table() {
    local table_name="Algo-Trader-User-Token-Table"
    local region=${AWS_REGION:-us-east-1}
    
    if aws dynamodb describe-table --table-name "$table_name" --region "$region" &> /dev/null; then
        STATUS=$(aws dynamodb describe-table --table-name "$table_name" --region "$region" --query 'Table.TableStatus' --output text)
        if [[ "$STATUS" == "ACTIVE" ]]; then
            print_success "DynamoDB table $table_name: $STATUS"
            return 0
        else
            print_warning "DynamoDB table $table_name: $STATUS"
            return 1
        fi
    else
        print_error "DynamoDB table $table_name does not exist"
        return 1
    fi
}

# Check IAM role
check_iam_role() {
    local role_name="AlgoTraderEC2Role"
    
    if aws iam get-role --role-name "$role_name" &> /dev/null; then
        print_success "IAM role $role_name exists"
        return 0
    else
        print_error "IAM role $role_name does not exist"
        return 1
    fi
}

# Check instance profile
check_instance_profile() {
    local profile_name="AlgoTraderEC2InstanceProfile"
    
    if aws iam get-instance-profile --instance-profile-name "$profile_name" &> /dev/null; then
        print_success "Instance profile $profile_name exists"
        return 0
    else
        print_error "Instance profile $profile_name does not exist"
        return 1
    fi
}

# Test DynamoDB operations
test_dynamodb_operations() {
    local table_name="Algo-Trader-User-Token-Table"
    local region=${AWS_REGION:-us-east-1}
    
    print_status "Testing DynamoDB operations..."
    
    # Test write operation
    if aws dynamodb put-item \
        --table-name "$table_name" \
        --item '{"USER_ID":{"S":"test-check"},"TIMESTAMP":{"S":"2024-01-01T00:00:00"},"email":{"S":"test@example.com"}}' \
        --region "$region" &> /dev/null; then
        print_success "DynamoDB write test passed"
        
        # Test read operation
        if aws dynamodb get-item \
            --table-name "$table_name" \
            --key '{"USER_ID":{"S":"test-check"},"TIMESTAMP":{"S":"2024-01-01T00:00:00"}}' \
            --region "$region" &> /dev/null; then
            print_success "DynamoDB read test passed"
            
            # Clean up test data
            aws dynamodb delete-item \
                --table-name "$table_name" \
                --key '{"USER_ID":{"S":"test-check"},"TIMESTAMP":{"S":"2024-01-01T00:00:00"}}' \
                --region "$region" &> /dev/null
            
            print_success "DynamoDB operations test completed successfully"
            return 0
        else
            print_error "DynamoDB read test failed"
            return 1
        fi
    else
        print_error "DynamoDB write test failed"
        return 1
    fi
}

# Main execution
main() {
    echo "🔍 Checking AlgoTraders Infrastructure Status"
    echo "============================================="
    
    local all_good=true
    
    # Check prerequisites
    if ! check_aws_cli; then
        all_good=false
    fi
    
    if ! check_aws_credentials; then
        all_good=false
    fi
    
    echo
    
    # Check CloudFormation stacks
    print_status "Checking CloudFormation stacks..."
    if ! check_stack_status "algotrader-user-token-dynamodb"; then
        all_good=false
    fi
    
    if ! check_stack_status "algotrader-ec2-iam"; then
        all_good=false
    fi
    
    echo
    
    # Check individual resources
    print_status "Checking individual resources..."
    if ! check_dynamodb_table; then
        all_good=false
    fi
    
    if ! check_iam_role; then
        all_good=false
    fi
    
    if ! check_instance_profile; then
        all_good=false
    fi
    
    echo
    
    # Test operations
    if $all_good; then
        if test_dynamodb_operations; then
            print_success "All infrastructure checks passed!"
        else
            all_good=false
        fi
    fi
    
    echo
    
    if $all_good; then
        print_success "Infrastructure is ready for deployment!"
        print_status "Next steps:"
        echo "1. Attach IAM role to EC2: AlgoTraderEC2InstanceProfile"
        echo "2. Deploy callback server: ./deploy.sh"
        echo "3. Set up HTTPS: ./setup_https.sh"
    else
        print_error "Infrastructure issues detected!"
        print_status "Please run: ./setup_dynamodb.sh"
    fi
}

# Run main function
main "$@" 