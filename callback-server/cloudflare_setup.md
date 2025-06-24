# Cloudflare + EC2 HTTPS Setup for api.algotraders.dev

## Step 1: Cloudflare DNS Configuration

### 1.1 Add DNS Records
1. Log into your Cloudflare dashboard
2. Select your domain `algotraders.dev`
3. Go to **DNS** → **Records**
4. Add these records:

#### A Record for API Subdomain
```
Type: A
Name: api
Content: YOUR_EC2_PUBLIC_IP
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

#### CNAME Record for www (if needed)
```
Type: CNAME
Name: www
Content: algotraders.dev
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

### 1.2 SSL/TLS Configuration
1. Go to **SSL/TLS** → **Overview**
2. Set SSL/TLS encryption mode to: **Full (strict)**
3. Go to **SSL/TLS** → **Edge Certificates**
4. Enable:
   - ✅ Always Use HTTPS
   - ✅ Minimum TLS Version: TLS 1.2
   - ✅ Opportunistic Encryption
   - ✅ TLS 1.3
   - ✅ Automatic HTTPS Rewrites

### 1.3 Page Rules (Optional)
Create a page rule for the API subdomain:
```
URL: api.algotraders.dev/*
Settings:
- SSL: Full (strict)
- Always Use HTTPS: On
- Security Level: Medium
```

## Step 2: EC2 Security Group Configuration

### 2.1 Configure Security Group
1. Go to EC2 Console → Security Groups
2. Select your instance's security group
3. Add these inbound rules:

```
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0
Description: HTTP from Cloudflare

Type: HTTPS
Protocol: TCP
Port: 443
Source: 0.0.0.0/0
Description: HTTPS from Cloudflare

Type: Custom TCP
Protocol: TCP
Port: 3000
Source: 0.0.0.0/0
Description: Direct API access (optional)
```

## Step 3: EC2 Instance Configuration

### 3.1 Update Nginx Configuration
The deployment script will create this automatically, but here's what it should look like:

```nginx
server {
    listen 80;
    server_name api.algotraders.dev;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name api.algotraders.dev;

    # SSL Configuration (will be added by Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/api.algotraders.dev/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.algotraders.dev/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy to callback server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
```

## Step 4: SSL Certificate Setup

### 4.1 Option A: Let's Encrypt (Recommended)
Run the deployment script and answer 'y' to SSL setup:
```bash
./deploy.sh
# When prompted: "Do you want to set up SSL certificate with Let's Encrypt? (y/n): y"
```

### 4.2 Option B: Cloudflare Origin Certificate
1. Go to Cloudflare → SSL/TLS → Origin Server
2. Click "Create Certificate"
3. Choose "15 years" validity
4. Include hostnames: `api.algotraders.dev`
5. Download the certificate files
6. Upload to EC2 and configure Nginx

## Step 5: Testing and Verification

### 5.1 Test DNS Resolution
```bash
# From your local machine
nslookup api.algotraders.dev
dig api.algotraders.dev

# Should resolve to your EC2 public IP
```

### 5.2 Test HTTPS Connection
```bash
# Test from EC2
curl -v https://api.algotraders.dev/health

# Test from local machine
curl -v https://api.algotraders.dev/health
```

### 5.3 Test OAuth Callback
```bash
# Test the callback endpoint
curl -X POST https://api.algotraders.dev/api/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"access_token":"test"}'
```

## Step 6: Monitoring and Maintenance

### 6.1 SSL Certificate Renewal
Let's Encrypt certificates auto-renew, but verify:
```bash
# Check certificate expiry
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

### 6.2 Log Monitoring
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo journalctl -u algotraders-callback -f
```

## Troubleshooting

### Common Issues:

1. **DNS Not Resolving**
   - Check Cloudflare DNS records
   - Verify proxy status is enabled (orange cloud)
   - Wait for DNS propagation (up to 24 hours)

2. **SSL Certificate Issues**
   - Ensure port 80 is open for Let's Encrypt verification
   - Check Nginx configuration syntax
   - Verify domain ownership

3. **Connection Timeouts**
   - Check EC2 security group rules
   - Verify callback server is running
   - Check Cloudflare proxy settings

4. **CORS Issues**
   - Ensure CORS headers are properly configured
   - Check allowed origins in callback server
   - Verify Cloudflare isn't stripping headers

### Useful Commands:
```bash
# Check service status
sudo systemctl status algotraders-callback
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Check SSL certificate
openssl s_client -connect api.algotraders.dev:443 -servername api.algotraders.dev

# Monitor real-time logs
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
``` 