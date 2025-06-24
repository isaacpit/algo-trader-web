#!/bin/bash

# Setup HTTPS with Let's Encrypt for the callback server
# Run this script AFTER the initial deployment is complete

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_status "Setting up HTTPS with Let's Encrypt for api.algotraders.dev"

# Detect package manager
if command -v yum &> /dev/null; then
    PACKAGE_MANAGER="yum"
elif command -v apt-get &> /dev/null; then
    PACKAGE_MANAGER="apt-get"
else
    print_error "Unsupported package manager. Please install certbot manually."
    exit 1
fi

# Install certbot
print_status "Installing certbot..."
if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    # For Amazon Linux 2 / CentOS / RHEL
    sudo yum install -y epel-release
    sudo yum install -y certbot python3-certbot-nginx
elif [[ "$PACKAGE_MANAGER" == "apt-get" ]]; then
    # For Ubuntu / Debian
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Create webroot directory for Let's Encrypt challenge
print_status "Creating webroot directory..."
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R nginx:nginx /var/www/html

# Stop Nginx temporarily for certbot
print_status "Stopping Nginx for certificate generation..."
sudo systemctl stop nginx

# Generate SSL certificate
print_status "Generating SSL certificate with Let's Encrypt..."
sudo certbot certonly --standalone \
    --email admin@algotraders.dev \
    --agree-tos \
    --no-eff-email \
    -d api.algotraders.dev

# Update Nginx configuration with SSL
print_status "Updating Nginx configuration with SSL..."
if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    # For yum systems, use conf.d directory
    sudo tee /etc/nginx/conf.d/algotraders-callback.conf > /dev/null <<EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name api.algotraders.dev;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.algotraders.dev;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.algotraders.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.algotraders.dev/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to callback server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
}
EOF
else
    # For apt-get systems, use sites-available/sites-enabled
    sudo tee /etc/nginx/sites-available/algotraders-callback > /dev/null <<EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name api.algotraders.dev;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.algotraders.dev;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.algotraders.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.algotraders.dev/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to callback server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
}
EOF
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
print_status "Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup automatic certificate renewal
print_status "Setting up automatic certificate renewal..."
sudo tee /etc/cron.d/certbot-renew > /dev/null <<EOF
# Renew Let's Encrypt certificates twice daily
0 12 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

# Test HTTPS
print_status "Testing HTTPS connection..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://api.algotraders.dev/health | grep -q "200"; then
    print_success "HTTPS is working correctly!"
else
    print_warning "HTTPS test failed. Please check the configuration manually."
fi

print_success "HTTPS setup complete!"
print_status "Your callback server is now available at: https://api.algotraders.dev"
print_status "Certificates will be automatically renewed twice daily." 