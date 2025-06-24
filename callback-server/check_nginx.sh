#!/bin/bash

# Nginx Configuration and Status Checker
# This script provides a comprehensive overview of your Nginx setup

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

echo "🔍 Nginx Configuration and Status Checker"
echo "=========================================="

# Check if Nginx is installed
print_status "Checking Nginx installation..."
if command -v nginx &> /dev/null; then
    print_success "Nginx is installed"
    nginx -v
else
    print_error "Nginx is not installed"
    exit 1
fi

echo

# Check Nginx service status
print_status "Checking Nginx service status..."
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx service is running"
    sudo systemctl status nginx --no-pager -l
else
    print_error "Nginx service is not running"
    print_status "Attempting to start Nginx..."
    sudo systemctl start nginx
    if sudo systemctl is-active --quiet nginx; then
        print_success "Nginx started successfully"
    else
        print_error "Failed to start Nginx"
    fi
fi

echo

# Test configuration syntax
print_status "Testing Nginx configuration syntax..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
    exit 1
fi

echo

# Check listening ports
print_status "Checking listening ports..."
echo "Ports Nginx is listening on:"
sudo netstat -tlnp | grep nginx || print_warning "No Nginx processes found listening"

echo

# Check configuration files
print_status "Checking Nginx configuration files..."

# Detect package manager
if command -v yum &> /dev/null; then
    PACKAGE_MANAGER="yum"
elif command -v apt-get &> /dev/null; then
    PACKAGE_MANAGER="apt-get"
else
    PACKAGE_MANAGER="unknown"
fi

echo "Package manager detected: $PACKAGE_MANAGER"

if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    echo "Configuration files in /etc/nginx/conf.d/:"
    sudo ls -la /etc/nginx/conf.d/
    
    if [ -f "/etc/nginx/conf.d/algotraders-callback.conf" ]; then
        echo
        print_status "AlgoTraders callback configuration:"
        sudo cat /etc/nginx/conf.d/algotraders-callback.conf
    else
        print_warning "AlgoTraders callback configuration not found"
    fi
elif [[ "$PACKAGE_MANAGER" == "apt-get" ]]; then
    echo "Enabled sites in /etc/nginx/sites-enabled/:"
    sudo ls -la /etc/nginx/sites-enabled/
    
    if [ -f "/etc/nginx/sites-available/algotraders-callback" ]; then
        echo
        print_status "AlgoTraders callback configuration:"
        sudo cat /etc/nginx/sites-available/algotraders-callback
    else
        print_warning "AlgoTraders callback configuration not found"
    fi
fi

echo

# Check SSL certificates
print_status "Checking SSL certificates..."
if [ -d "/etc/letsencrypt/live/api.algotraders.dev" ]; then
    print_success "SSL certificates found for api.algotraders.dev"
    echo "Certificate files:"
    sudo ls -la /etc/letsencrypt/live/api.algotraders.dev/
    
    echo
    print_status "Certificate expiry information:"
    sudo certbot certificates
else
    print_warning "SSL certificates not found for api.algotraders.dev"
    print_status "You may need to run: ./setup_https.sh"
fi

echo

# Check Nginx logs
print_status "Checking Nginx logs..."
if [ -f "/var/log/nginx/error.log" ]; then
    echo "Recent error log entries (last 10 lines):"
    sudo tail -10 /var/log/nginx/error.log
else
    print_warning "Nginx error log not found"
fi

echo

# Test connectivity
print_status "Testing connectivity..."
echo "Testing HTTP connection to api.algotraders.dev..."
if curl -s -o /dev/null -w "%{http_code}" http://api.algotraders.dev/health | grep -q "200\|301\|302"; then
    print_success "HTTP connection successful"
else
    print_warning "HTTP connection failed"
fi

echo "Testing HTTPS connection to api.algotraders.dev..."
if curl -s -o /dev/null -w "%{http_code}" https://api.algotraders.dev/health | grep -q "200"; then
    print_success "HTTPS connection successful"
else
    print_warning "HTTPS connection failed"
fi

echo

# Check system resources
print_status "Checking system resources..."
echo "Nginx processes:"
sudo ps aux | grep nginx | grep -v grep

echo
echo "Memory usage:"
free -h

echo
echo "Disk usage:"
df -h /

echo

print_success "Nginx configuration check complete!"
print_status "If you see any warnings or errors above, please address them before proceeding." 