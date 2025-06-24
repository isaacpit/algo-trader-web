#!/bin/bash

# AlgoTraders Callback Server Deployment Script
# This script sets up the callback server on an EC2 instance (Amazon Linux/RHEL/CentOS)

set -exo -pipefail

echo "🚀 Starting AlgoTraders Callback Server deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
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

# Detect package manager
if command -v yum &> /dev/null; then
    PACKAGE_MANAGER="yum"
    print_status "Detected yum package manager (Amazon Linux/RHEL/CentOS)"
elif command -v apt-get &> /dev/null; then
    PACKAGE_MANAGER="apt-get"
    print_status "Detected apt-get package manager (Ubuntu/Debian)"
else
    print_error "No supported package manager found (yum or apt-get)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    sudo yum update -y
    # Install EPEL repository for additional packages
#    sudo yum install -y epel-release
#    sudo amazon-linux-extras install epel -y

else
    sudo apt-get update
    sudo apt-get upgrade -y
fi

# Install required packages
print_status "Installing required packages..."
if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    sudo yum install -y \
        python3 \
        python3-pip \
        python3-devel \
        nginx \
        git \
        certbot \
        python3-certbot-nginx
    # [REMOVED] supervisor \
#            curl \
else
    sudo apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        nginx \
        curl \
        git \
        supervisor \
        certbot \
        python3-certbot-nginx
fi

# Create application directory
APP_DIR="/opt/algotraders-callback"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or copy application files

print_status "Copying hardcoded files... [TODO] REPLACE WITH GIT"
if true; then
#if [ -d ".git" ]; then
    print_status "Copying application files..."
    cp -r . $APP_DIR/
else
    print_status "Cloning application from repository..."
    # Replace with your actual repository URL
#    git clone https://github.com/yourusername/algotraders-callback.git $APP_DIR
    cp -r . $APP_DIR/
fi

cd $APP_DIR

# Create virtual environment
print_status "Setting up Python virtual environment..."
if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    # On yum systems, python3-venv might not be available, use virtualenv
    pip3 install virtualenv
    virtualenv venv
else
    python3 -m venv venv
fi
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your actual configuration values"
fi

# Create systemd service file
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/algotraders-callback.service > /dev/null <<EOF
[Unit]
Description=AlgoTraders Callback Server
After=network.target

[Service]
Type=exec
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
Environment=PATH=$APP_DIR/venv/bin
ExecStart=$APP_DIR/venv/bin/gunicorn --config gunicorn.conf.py callback_server:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
print_status "Creating Nginx configuration..."
if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
    # For yum systems, use conf.d directory
    sudo tee /etc/nginx/conf.d/algotraders-callback.conf > /dev/null <<EOF
# HTTP server - will redirect to HTTPS after SSL setup
server {
    listen 80;
    server_name api.algotraders.dev;

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

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF
    # Remove default nginx configuration
    sudo rm -f /etc/nginx/conf.d/default.conf
else
    # For apt-get systems, use sites-available/sites-enabled
    sudo tee /etc/nginx/sites-available/algotraders-callback > /dev/null <<EOF
# HTTP server - will redirect to HTTPS after SSL setup
server {
    listen 80;
    server_name api.algotraders.dev;

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

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF
    # Enable Nginx site
    sudo ln -sf /etc/nginx/sites-available/algotraders-callback /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start and enable services
print_status "Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable algotraders-callback
sudo systemctl start algotraders-callback
sudo systemctl restart nginx

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet algotraders-callback; then
    print_status "Callback server is running successfully!"
else
    print_error "Failed to start callback server"
    sudo systemctl status algotraders-callback
    exit 1
fi

# Setup SSL certificate (optional)
read -p "Do you want to set up SSL certificate with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setting up SSL certificate..."
    sudo certbot --nginx -d api.algotraders.dev --non-interactive --agree-tos --email isaacpitblado@gmail.com
fi

# Create monitoring script
print_status "Creating monitoring script..."
tee $APP_DIR/monitor.sh > /dev/null <<EOF
#!/bin/bash
# Simple monitoring script for the callback server

SERVICE="algotraders-callback"
LOG_FILE="$APP_DIR/logs/monitor.log"

echo "\$(date): Checking $SERVICE status..." >> \$LOG_FILE

if ! sudo systemctl is-active --quiet \$SERVICE; then
    echo "\$(date): \$SERVICE is down, restarting..." >> \$LOG_FILE
    sudo systemctl restart \$SERVICE
    echo "\$(date): \$SERVICE restarted" >> \$LOG_FILE
fi

# Check health endpoint
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "\$(date): Health check failed, restarting \$SERVICE..." >> \$LOG_FILE
    sudo systemctl restart \$SERVICE
fi
EOF

chmod +x $APP_DIR/monitor.sh

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/algotraders-callback > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload algotraders-callback
    endscript
}
EOF

print_status "Deployment completed successfully!"
echo
print_status "Next steps:"
echo "1. Edit $APP_DIR/.env with your actual configuration"
echo "2. Restart the service: sudo systemctl restart algotraders-callback"
echo "3. Check logs: sudo journalctl -u algotraders-callback -f"
echo
print_status "Service management commands:"
echo "  Start:   sudo systemctl start algotraders-callback"
echo "  Stop:    sudo systemctl stop algotraders-callback"
echo "  Restart: sudo systemctl restart algotraders-callback"
echo "  Status:  sudo systemctl status algotraders-callback"
echo "  Logs:    sudo journalctl -u algotraders-callback -f" 