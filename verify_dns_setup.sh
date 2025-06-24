#!/bin/bash

# DNS Verification Script for AlgoTraders
# Verifies both GitHub Pages (frontend) and EC2 (backend) DNS configuration

#set -exo pipefail
set -e

echo "🔍 Verifying DNS setup for AlgoTraders..."

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

# GitHub Pages IP addresses (these may change, but these are common ones)
GITHUB_PAGES_IPS=(
    "185.199.108.153"
    "185.199.109.153"
    "185.199.110.153"
    "185.199.111.153"
)

# Function to check DNS resolution
check_dns() {
    local domain=$1
    local expected_ip=$2
    local service=$3
    
    echo
    print_status "Checking $service ($domain)..."
    
    if nslookup $domain > /dev/null 2>&1; then
        resolved_ip=$(nslookup $domain | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        print_status "Resolved to: $resolved_ip"
        
        if [ "$expected_ip" = "github" ]; then
            # Check if it's a GitHub Pages IP
            if [[ " ${GITHUB_PAGES_IPS[@]} " =~ " ${resolved_ip} " ]]; then
                print_status "✅ $domain correctly points to GitHub Pages"
            else
                print_warning "⚠️  $domain doesn't point to GitHub Pages IP"
                print_warning "Expected one of: ${GITHUB_PAGES_IPS[*]}"
            fi
        elif [ "$resolved_ip" = "$expected_ip" ]; then
            print_status "✅ $domain correctly points to $expected_ip"
        else
            print_warning "⚠️  $domain points to $resolved_ip, expected $expected_ip"
        fi
    else
        print_error "❌ Could not resolve $domain"
    fi
}

# Function to test HTTPS connection
test_https() {
    local domain=$1
    local service=$2
    
    echo
    print_status "Testing HTTPS for $service ($domain)..."
    
    if curl -f -I https://$domain > /dev/null 2>&1; then
        print_status "✅ HTTPS connection successful"
    else
        print_warning "⚠️  HTTPS connection failed"
    fi
}

# Get EC2 Elastic IP (if running on EC2)
if curl -s http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    print_status "Running on EC2, getting Elastic IP..."
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
    EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 -H "X-aws-ec2-metadata-token: $TOKEN")
    print_status "EC2 IP: $EC2_IP"
else
    print_warning "Not running on EC2, please provide your EC2 Elastic IP"
    read -p "Enter your EC2 Elastic IP: \n" EC2_IP
fi

# Check DNS resolution
check_dns "algotraders.dev" "github" "Frontend (GitHub Pages)"
check_dns "www.algotraders.dev" "github" "WWW Redirect"
check_dns "api.algotraders.dev" "$EC2_IP" "Backend (EC2)"

# Test HTTPS connections
test_https "algotraders.dev" "Frontend"
test_https "api.algotraders.dev" "Backend"

# Show expected DNS configuration
echo
print_status "Expected DNS Configuration:"
echo "┌─────────────────────┬─────────────┬─────────────────────┬─────────────┐"
echo "│ Domain              │ Type        │ Content             │ Service     │"
echo "├─────────────────────┼─────────────┼─────────────────────┼─────────────┤"
echo "│ algotraders.dev     │ A           │ 185.199.108.153     │ GitHub Pages│"
echo "│ www.algotraders.dev │ CNAME       │ algotraders.dev     │ Redirect    │"
echo "│ api.algotraders.dev │ A           │ $EC2_IP             │ EC2 Backend │"
echo "└─────────────────────┴─────────────┴─────────────────────┴─────────────┘"

# Show Cloudflare settings
echo
print_status "Cloudflare Configuration Checklist:"
echo "   ✅ DNS Records configured"
echo "   ✅ Proxy status: Enabled (orange cloud)"
echo "   ✅ SSL/TLS Mode: Full (strict)"
echo "   ✅ Always Use HTTPS: Enabled"
echo "   ✅ Minimum TLS: 1.2"

# Show GitHub Pages settings
echo
print_status "GitHub Pages Configuration Checklist:"
echo "   ✅ Custom domain: algotraders.dev"
echo "   ✅ Enforce HTTPS: Enabled"
echo "   ✅ CNAME file: public/CNAME contains 'algotraders.dev'"
echo "   ✅ Source: Deploy from gh-pages branch"

# Show next steps
echo
print_status "Next Steps:"
echo "1. If DNS is not resolving correctly, update Cloudflare DNS records"
echo "2. If HTTPS is failing, check SSL certificate setup"
echo "3. Test OAuth flow: https://algotraders.dev"
echo "4. Test API health: https://api.algotraders.dev/health"

print_status "DNS verification completed!" 