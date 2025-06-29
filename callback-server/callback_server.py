import os
import json
import logging
import time
import traceback
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
import asyncio

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
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Import our modules
from models import CallbackRequest, UserResponse, ErrorResponse
from database import initialize_database, get_database
from api_routes import api_router
from backtest_worker import start_backtest_worker, stop_backtest_worker, SlowdownConfig

# Load environment variables
load_dotenv(verbose=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/callback_server.log'),
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

    # AWS Configuration
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    USER_TABLE_NAME = os.getenv("USER_TABLE_NAME", "Algo-Trader-User-Token-Table")
    FEED_TABLE_NAME = os.getenv("FEED_TABLE_NAME", "Algo-Trader-Feed-Table")
    BACKTEST_JOBS_TABLE_NAME = os.getenv("BACKTEST_JOBS_TABLE_NAME", "Algo-Trader-Backtest-Jobs-Table")

    # LocalStack Configuration
    USE_LOCALSTACK = os.getenv("USE_LOCALSTACK", "true").lower() == "true"
    LOCALSTACK_ENDPOINT = os.getenv("LOCALSTACK_ENDPOINT", "http://localhost:4566")

    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour

    # Artificial job processing slowdown configuration (for testing/development)
    ENABLE_JOB_PROCESSING_SLOWDOWN = os.getenv("ENABLE_JOB_PROCESSING_SLOWDOWN", "false").lower() == "true"
    JOB_PROCESSING_SLOWDOWN_MIN_SECONDS = int(os.getenv("JOB_PROCESSING_SLOWDOWN_MIN_SECONDS", "5"))
    JOB_PROCESSING_SLOWDOWN_MAX_SECONDS = int(os.getenv("JOB_PROCESSING_SLOWDOWN_MAX_SECONDS", "5"))

config = Config()

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
        logger.error(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to verify token with Google: {str(e)}"
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

    # Log artificial job processing slowdown configuration with prominent warnings
    if config.ENABLE_JOB_PROCESSING_SLOWDOWN:
        logger.warning("=" * 80)
        logger.warning("🐌 ARTIFICIAL JOB PROCESSING SLOWDOWN IS ENABLED! 🐌")
        logger.warning("=" * 80)
        logger.warning("⚠️  This is an intentional development/testing feature!")
        logger.warning(f"⚠️  Backtest jobs will be artificially slowed by {config.JOB_PROCESSING_SLOWDOWN_MIN_SECONDS}-{config.JOB_PROCESSING_SLOWDOWN_MAX_SECONDS} seconds per step")
        logger.warning("⚠️  Jobs will remain in 'pending'/'running' state much longer!")
        logger.warning("⚠️  To disable: Set ENABLE_JOB_PROCESSING_SLOWDOWN=false in environment")
        logger.warning("=" * 80)
    else:
        logger.info("✅ Job processing slowdown: DISABLED (normal performance)")
        logger.info("   To enable for testing: Set ENABLE_JOB_PROCESSING_SLOWDOWN=true")

    # Initialize database
    logger.info("Initializing database connection...")
    if config.USE_LOCALSTACK:
        logger.info(f"Using LocalStack for local development at: {config.LOCALSTACK_ENDPOINT}")
        db_manager = initialize_database(
            config.USER_TABLE_NAME,
            config.FEED_TABLE_NAME,
            config.BACKTEST_JOBS_TABLE_NAME,
            config.AWS_REGION,
            use_localstack=True,
            localstack_endpoint=config.LOCALSTACK_ENDPOINT
        )
    else:
        logger.info("Using AWS DynamoDB for production")
        db_manager = initialize_database(
            config.USER_TABLE_NAME,
            config.FEED_TABLE_NAME,
            config.BACKTEST_JOBS_TABLE_NAME,
            config.AWS_REGION,
            use_localstack=False
        )

    if db_manager and db_manager.is_connected():
        logger.info("Database connection established successfully")
    else:
        logger.warning("Database connection failed - some features may not work")

    # Validate required environment variables
    if not config.GOOGLE_CLIENT_ID:
        logger.warning("GOOGLE_CLIENT_ID not set - OAuth verification may not work properly")

    # Start backtest worker with slowdown configuration
    slowdown_config = SlowdownConfig(
        enabled=config.ENABLE_JOB_PROCESSING_SLOWDOWN,
        min_seconds=config.JOB_PROCESSING_SLOWDOWN_MIN_SECONDS,
        max_seconds=config.JOB_PROCESSING_SLOWDOWN_MAX_SECONDS
    )
    asyncio.create_task(start_backtest_worker(slowdown_config))
    logger.info("Backtest worker started")

    yield

    # Shutdown
    logger.info("Shutting down callback server...")

    # Stop backtest worker
    await stop_backtest_worker()
    logger.info("Backtest worker stopped")

# Create FastAPI app
app = FastAPI(
    title="AlgoTraders Callback Server",
    description="OAuth callback server and API for AlgoTraders application",
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
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include API routes
app.include_router(api_router)

# OAuth callback endpoint
@app.post("/api/auth/callback")
async def handle_callback(
    request: Request,
    callback_data: CallbackRequest
):
    """Handle OAuth callback from Google"""
    client_ip = await get_client_ip(request)

    # Rate limiting
    if not check_rate_limit(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=ErrorResponse(
                error="rate_limit_exceeded",
                message="Too many requests. Please try again later.",
                timestamp=datetime.utcnow().isoformat()
            ).model_dump()
        )

    try:
        logger.info(f"Processing OAuth callback for IP: {client_ip}")

        # Verify Google token
        user_info = await verify_google_token(callback_data.access_token)

        # Create JWT token
        jwt_token = create_jwt_token(user_info)

        # Store user token in DynamoDB
        db = get_database()
        if db and db.is_connected():
            # Check if user exists, create if not
            existing_user = await db.get_user(user_info["id"])
            if not existing_user:
                await db.create_user(user_info)
                logger.info(f"Created new user: {user_info['email']}")
            else:
                logger.info(f"User already exists: {user_info['email']}")

        # Prepare response
        user_response = UserResponse(
            id=user_info["id"],
            email=user_info["email"],
            name=user_info["name"],
            picture=user_info.get("picture"),
            access_token=jwt_token,
            token_received_at=datetime.utcnow().isoformat(),
            expires_at=(datetime.utcnow() + timedelta(hours=24)).isoformat()
        )

        logger.info(f"Successfully processed OAuth callback for user: {user_info['email']}")
        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing OAuth callback: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(
                error="internal_error",
                message="An internal error occurred while processing the callback.",
                timestamp=datetime.utcnow().isoformat()
            ).model_dump()
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "connected" if get_database() and get_database().is_connected() else "disconnected"
    localstack_status = "enabled" if config.USE_LOCALSTACK else "disabled"

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "localstack": localstack_status,
        "version": "1.0.0"
    }

# Session verification endpoint
@app.get("/api/auth/verify")
async def verify_session(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    try:
        # Decode JWT token
        payload = jwt.decode(credentials.credentials, config.SECRET_KEY, algorithms=["HS256"])

        # Get user from database
        db = get_database()
        if db and db.is_connected():
            user_data = await db.get_user(payload["user_id"])
            if user_data:
                return {
                    "valid": True,
                    "user": user_data,
                    "expires_at": payload["exp"]
                }

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

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
    except Exception as e:
        logger.error(f"Error verifying session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying session"
        )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AlgoTraders Callback Server",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "localstack": config.USE_LOCALSTACK
    }

# Token management endpoints
@app.get("/api/auth/tokens/{user_id}")
async def get_user_tokens_endpoint(user_id: str):
    """Get user tokens from DynamoDB"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        user_data = await db.get_user(user_id)
        return {"user_id": user_id, "user_data": user_data}

    except Exception as e:
        logger.error(f"Error getting user data for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user data")

@app.delete("/api/auth/tokens/{user_id}")
async def delete_user_tokens(user_id: str):
    """Delete user from DynamoDB"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Note: This would need to be implemented in DatabaseManager if needed
        return {"message": "User deletion not implemented yet"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete user")

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=f"http_{exc.status_code}",
            message=exc.detail,
            timestamp=datetime.utcnow().isoformat()
        ).model_dump()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"General exception: {str(exc)}")
    logger.error(f"Request URL: {request.url}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Stack trace: {traceback.format_exc()}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="internal_error",
            message=f"An internal server error occurred: {str(exc)}",
            timestamp=datetime.utcnow().isoformat()
        ).model_dump()
    )

# Database utility functions (keeping for backward compatibility)
async def store_user_token(user_id: str, access_token: str, user_data: Dict[str, Any]) -> bool:
    """Store user token in DynamoDB"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            return False

        # Store user data in the user table
        user_record = {
            "id": user_id,
            "email": user_data.get("email", ""),
            "name": user_data.get("name", ""),
            "picture": user_data.get("picture"),
            "verified": user_data.get("verified_email", False),
            "followers": 0
        }

        success = await db.create_user(user_record)
        if success:
            logger.info(f"Stored user data for: {user_id}")
        return success

    except Exception as e:
        logger.error(f"Failed to store user data: {str(e)}")
        return False

async def get_user_tokens(user_id: str) -> Dict[str, Any]:
    """Get user data from DynamoDB"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            return {}

        user_data = await db.get_user(user_id)
        if user_data:
            logger.info(f"Retrieved user data for: {user_id}")
            return user_data
        return {}

    except Exception as e:
        logger.error(f"Failed to get user data: {str(e)}")
        return {}

async def delete_expired_tokens(user_id: str) -> bool:
    """Delete user from DynamoDB (placeholder)"""
    try:
        # This would need to be implemented if user deletion is required
        logger.info(f"User deletion requested for: {user_id} (not implemented)")
        return True

    except Exception as e:
        logger.error(f"Failed to delete user: {str(e)}")
        return False

# Run the server
if __name__ == "__main__":
    uvicorn.run(
        "callback_server:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level="info" if config.DEBUG else "warning"
    )
