import os
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import requests
from pydantic import BaseModel, Field
import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv(verbose=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('callback_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Environment configuration
class Config:
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "3000"))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://algotraders.dev").split(",")
    TRUSTED_HOSTS = os.getenv("TRUSTED_HOSTS", "*").split(",")
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Database (for future use)
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour

config = Config()

# Pydantic models
class CallbackRequest(BaseModel):
    access_token: str = Field(..., description="Google OAuth access token")
    state: Optional[str] = Field(None, description="OAuth state parameter")

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    access_token: str
    token_received_at: str
    expires_at: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: str

# Rate limiting storage (in production, use Redis)
rate_limit_storage = {}

def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting implementation"""
    current_time = time.time()
    if client_ip not in rate_limit_storage:
        rate_limit_storage[client_ip] = []
    
    # Remove old requests outside the window
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip]
        if current_time - req_time < config.RATE_LIMIT_WINDOW
    ]
    
    # Check if limit exceeded
    if len(rate_limit_storage[client_ip]) >= config.RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    return True

async def get_client_ip(request: Request) -> str:
    """Extract client IP address"""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host

async def verify_google_token(access_token: str) -> Dict[str, Any]:
    """Verify Google OAuth token and get user info"""
    try:
        # Verify token with Google
        google_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        
        if google_response.status_code != 200:
            logger.error(f"Google token verification failed: {google_response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )
        
        user_info = google_response.json()
        logger.info(f"Verified Google token for user: {user_info.get('email')}")
        return user_info
        
    except requests.RequestException as e:
        logger.error(f"Error verifying Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify token with Google"
        )

def create_jwt_token(user_data: Dict[str, Any]) -> str:
    """Create JWT token for user session"""
    payload = {
        "user_id": user_data["id"],
        "email": user_data["email"],
        "exp": datetime.utcnow() + timedelta(hours=24),  # 24 hour expiry
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, config.SECRET_KEY, algorithm="HS256")

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting callback server...")
    logger.info(f"Environment: {'DEBUG' if config.DEBUG else 'PRODUCTION'}")
    logger.info(f"Allowed origins: {config.ALLOWED_ORIGINS}")
    logger.info(f"Trusted hosts: {config.TRUSTED_HOSTS}")
    
    # Validate required environment variables
    if not config.GOOGLE_CLIENT_ID:
        logger.warning("GOOGLE_CLIENT_ID not set - OAuth verification may not work properly")
    
    yield
    
    # Shutdown
    logger.info("Shutting down callback server...")

# Create FastAPI app
app = FastAPI(
    title="AlgoTraders Callback Server",
    description="OAuth callback server for AlgoTraders application",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=config.TRUSTED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

@app.post("/api/auth/callback", response_model=UserResponse)
async def handle_callback(
    request: Request,
    callback_data: CallbackRequest
):
    """Handle OAuth callback from Google"""
    try:
        # Rate limiting
        client_ip = await get_client_ip(request)
        if not check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Validate access token
        if not callback_data.access_token:
            logger.error("No access token received")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Access token is required"
            )
        
        # Verify token with Google
        google_user_info = await verify_google_token(callback_data.access_token)
        
        # Create user response
        user_data = {
            "id": google_user_info.get("id", "unknown"),
            "email": google_user_info.get("email", ""),
            "name": google_user_info.get("name", ""),
            "picture": google_user_info.get("picture"),
            "access_token": callback_data.access_token,
            "token_received_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat()
        }
        
        # Create JWT token for session
        jwt_token = create_jwt_token(user_data)
        user_data["session_token"] = jwt_token
        
        logger.info(f"Successfully processed callback for user: {user_data['email']}")
        return UserResponse(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": "production" if not config.DEBUG else "development"
    }

@app.get("/api/auth/verify")
async def verify_session(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT session token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
        
        return {
            "valid": True,
            "user_id": payload["user_id"],
            "email": payload["email"],
            "expires_at": datetime.fromtimestamp(payload["exp"]).isoformat()
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AlgoTraders Callback Server",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            message=str(exc.detail),
            timestamp=datetime.utcnow().isoformat()
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            message="An unexpected error occurred",
            timestamp=datetime.utcnow().isoformat()
        ).dict()
    )

if __name__ == "__main__":
    logger.info(f"Starting server on {config.HOST}:{config.PORT}")
    uvicorn.run(
        "callback_server:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level="info" if not config.DEBUG else "debug"
    ) 