# AlgoTraders Callback Server

A production-ready OAuth callback server for the AlgoTraders application, built with FastAPI and designed for deployment on EC2 instances.

## Features

- 🔐 **Google OAuth Integration** - Secure token verification and user authentication
- 🚀 **Production Ready** - Gunicorn, Nginx, systemd service management
- 🛡️ **Security** - Rate limiting, CORS, trusted hosts, JWT tokens
- 📊 **Monitoring** - Health checks, logging, metrics
- 🐳 **Docker Support** - Containerized deployment
- 🔄 **Auto-restart** - Systemd service with automatic restarts
- 📝 **Comprehensive Logging** - File and console logging with rotation

## Quick Start

### Local Development

1. **Clone and setup**:
   ```bash
   cd callback-server
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your Google OAuth credentials
   ```

3. **Run the server**:
   ```bash
   python callback_server.py
   ```

### Docker Deployment

1. **Build and run**:
   ```bash
   docker-compose up -d
   ```

2. **Or build manually**:
   ```bash
   docker build -t algotraders-callback .
   docker run -p 3000:3000 --env-file .env algotraders-callback
   ```

### EC2 Deployment

1. **Upload files to EC2**:
   ```bash
   scp -r callback-server/ ec2-user@your-ec2-instance:/home/ec2-user/
   ```

2. **Run deployment script**:
   ```bash
   ssh ec2-user@your-ec2-instance
   cd callback-server
   ./deploy.sh
   ```

3. **Configure environment**:
   ```bash
   sudo nano /opt/algotraders-callback/.env
   sudo systemctl restart algotraders-callback
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `3000` |
| `DEBUG` | Debug mode | `false` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-change-in-production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,https://algotraders.dev` |
| `TRUSTED_HOSTS` | Trusted host headers | `*,localhost,algotraders.dev` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Required |
| `DATABASE_URL` | Database connection string | Optional |
| `RATE_LIMIT_REQUESTS` | Rate limit requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window in seconds | `3600` |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set **Authorized redirect URIs**:
   - Development: `http://localhost:5173/oauth/callback`
   - Production: `https://algotraders.dev/oauth/callback`
6. Copy the Client ID and Secret to your `.env` file

## API Endpoints

### POST `/api/auth/callback`
Handle OAuth callback from Google.

**Request Body**:
```json
{
  "access_token": "google_oauth_access_token",
  "state": "optional_oauth_state"
}
```

**Response**:
```json
{
  "id": "google_user_id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://profile_picture_url",
  "access_token": "google_access_token",
  "token_received_at": "2024-01-01T12:00:00Z",
  "expires_at": "2024-01-01T13:00:00Z",
  "session_token": "jwt_session_token"
}
```

### GET `/api/auth/verify`
Verify JWT session token.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "valid": true,
  "user_id": "google_user_id",
  "email": "user@example.com",
  "expires_at": "2024-01-01T12:00:00Z"
}
```

### GET `/health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## Service Management

### Systemd Commands
```bash
# Start service
sudo systemctl start algotraders-callback

# Stop service
sudo systemctl stop algotraders-callback

# Restart service
sudo systemctl restart algotraders-callback

# Check status
sudo systemctl status algotraders-callback

# View logs
sudo journalctl -u algotraders-callback -f

# Enable auto-start
sudo systemctl enable algotraders-callback
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx
```

## Monitoring

### Health Checks
The server includes built-in health checks:
- Docker health check: `curl -f http://localhost:3000/health`
- Systemd service monitoring
- Nginx proxy health endpoint

### Logging
- Application logs: `/opt/algotraders-callback/logs/`
- System logs: `sudo journalctl -u algotraders-callback`
- Nginx logs: `/var/log/nginx/`

### Monitoring Script
A monitoring script is created at `/opt/algotraders-callback/monitor.sh` that:
- Checks service status
- Restarts failed services
- Performs health checks
- Logs monitoring activities

## Security Features

- **Rate Limiting**: Configurable request limits per IP
- **CORS Protection**: Configurable allowed origins
- **Trusted Hosts**: Protection against host header attacks
- **JWT Tokens**: Secure session management
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Comprehensive error responses
- **Logging**: Security event logging

## SSL/HTTPS Setup

### Let's Encrypt (Automatic)
The deployment script can automatically set up SSL certificates:
```bash
# During deployment, answer 'y' to SSL setup
# Or manually run:
sudo certbot --nginx -d api.algotraders.dev
```

### Manual SSL Setup
1. Obtain SSL certificate
2. Update Nginx configuration
3. Restart Nginx

## Troubleshooting

### Common Issues

1. **Service won't start**:
   ```bash
   sudo systemctl status algotraders-callback
   sudo journalctl -u algotraders-callback -n 50
   ```

2. **OAuth not working**:
   - Check Google OAuth credentials in `.env`
   - Verify redirect URIs in Google Console
   - Check CORS settings

3. **Nginx errors**:
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Port conflicts**:
   ```bash
   sudo netstat -tlnp | grep :3000
   sudo lsof -i :3000
   ```

### Debug Mode
Enable debug mode for detailed logging:
```bash
# Edit .env file
DEBUG=true

# Restart service
sudo systemctl restart algotraders-callback
```

## Performance Tuning

### Gunicorn Configuration
The `gunicorn.conf.py` file is optimized for production:
- Worker processes: `(CPU cores * 2) + 1`
- Worker connections: 1000
- Request limits: 1000 requests per worker
- Timeouts: 30 seconds

### Nginx Configuration
- Proxy buffering enabled
- Connection timeouts configured
- Health check endpoint optimized

## Backup and Recovery

### Backup Strategy
1. **Configuration**: Backup `/opt/algotraders-callback/.env`
2. **Logs**: Backup `/opt/algotraders-callback/logs/`
3. **Nginx config**: Backup `/etc/nginx/sites-available/algotraders-callback`

### Recovery
1. Restore configuration files
2. Restart services
3. Verify health checks

## Support

For issues and questions:
1. Check the logs: `sudo journalctl -u algotraders-callback -f`
2. Verify configuration: `sudo systemctl status algotraders-callback`
3. Test endpoints: `curl http://localhost:3000/health`
