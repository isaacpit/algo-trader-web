#!/bin/bash

# Elastic IP Setup Script for AlgoTraders Callback Server
# This script helps allocate and manage Elastic IP addresses

set -exo pipefail

echo "🌐 Setting up Elastic IP for AlgoTraders Callback Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    print_status "Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured"
    print_status "Run: aws configure"
    exit 1
fi

# Get current instance ID
print_status "Getting current instance ID..."
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`

INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id -H "X-aws-ec2-metadata-token: $TOKEN")
if [ -z "$INSTANCE_ID" ]; then
    print_error "Could not get instance ID"
    exit 1
fi

print_status "Current instance ID: $INSTANCE_ID"

# Check if instance already has an Elastic IP
print_status "Checking for existing Elastic IP..."
EXISTING_EIP=$(aws ec2 describe-addresses --filters "Name=instance-id,Values=$INSTANCE_ID" --query 'Addresses[0].AllocationId' --output text)

if [ "$EXISTING_EIP" != "None" ] && [ -n "$EXISTING_EIP" ]; then
    print_status "Instance already has Elastic IP: $EXISTING_EIP"
    EIP_ADDRESS=$(aws ec2 describe-addresses --allocation-ids $EXISTING_EIP --query 'Addresses[0].PublicIp' --output text)
    print_status "Elastic IP address: $EIP_ADDRESS"
else
    print_status "No Elastic IP found, allocating new one..."
    
    # Allocate new Elastic IP
    ALLOCATION_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
    if [ -z "$ALLOCATION_ID" ]; then
        print_error "Failed to allocate Elastic IP"
        exit 1
    fi
    
    print_status "Allocated Elastic IP: $ALLOCATION_ID"
    
    # Associate with current instance
    print_status "Associating Elastic IP with instance..."
    ASSOCIATION_ID=$(aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOCATION_ID --query 'AssociationId' --output text)
    
    if [ -z "$ASSOCIATION_ID" ]; then
        print_error "Failed to associate Elastic IP"
        exit 1
    fi
    
    print_status "Associated Elastic IP: $ASSOCIATION_ID"
    
    # Get the IP address
    EIP_ADDRESS=$(aws ec2 describe-addresses --allocation-ids $ALLOCATION_ID --query 'Addresses[0].PublicIp' --output text)
    print_status "Elastic IP address: $EIP_ADDRESS"
fi

# Display current IP information
print_status "Current IP Information:"
echo "   Instance ID: $INSTANCE_ID"
echo "   Elastic IP: $EIP_ADDRESS"
echo "   Allocation ID: $EXISTING_EIP"

# Check DNS resolution
print_status "Checking DNS resolution..."
if nslookup api.algotraders.dev > /dev/null 2>&1; then
    RESOLVED_IP=$(nslookup api.algotraders.dev | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    print_status "api.algotraders.dev resolves to: $RESOLVED_IP"
    
    if [ "$RESOLVED_IP" != "$EIP_ADDRESS" ]; then
        print_warning "DNS resolution doesn't match Elastic IP"
        print_warning "Expected: $EIP_ADDRESS, Got: $RESOLVED_IP"
        print_warning "Please update Cloudflare DNS records"
    else
        print_status "✅ DNS resolution is correct!"
    fi
else
    print_warning "Could not resolve api.algotraders.dev"
fi

# Show Cloudflare configuration
echo
print_status "Cloudflare DNS Configuration:"
echo "   Type: A"
echo "   Name: api"
echo "   Content: $EIP_ADDRESS"
echo "   Proxy: Enabled (orange cloud)"
echo "   TTL: Auto"

# Show cost information
echo
print_status "Elastic IP Cost Information:"
echo "   ✅ FREE when attached to running instance"
echo "   ⚠️  $0.005/hour when not attached (only if you stop/detach)"
echo "   ✅ No charge for data transfer"
echo "   ✅ No charge for DNS queries"

# Show management commands
echo
print_status "Elastic IP Management Commands:"
echo "   View all EIPs: aws ec2 describe-addresses"
echo "   Disassociate: aws ec2 disassociate-address --association-id $ASSOCIATION_ID"
echo "   Release EIP: aws ec2 release-address --allocation-id $EXISTING_EIP"
echo "   Reassociate: aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $EXISTING_EIP"

# Show next steps
echo
print_status "Next Steps:"
echo "1. Update Cloudflare DNS with IP: $EIP_ADDRESS"
echo "2. Run deployment script: ./deploy.sh"
echo "3. Test connectivity: curl https://api.algotraders.dev/health"
echo "4. Update frontend to use: https://api.algotraders.dev"

print_status "Elastic IP setup completed successfully!" 