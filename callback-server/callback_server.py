from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/callback")
async def handle_callback(request: Request):
    try:
        # Get the request body
        data = await request.json()
        access_token = data.get("access_token")
        
        if not access_token:
            logger.error("No access token received")
            return {"error": "No access token provided"}
        
        # Log the token (in production, you would validate and process it)
        logger.info(f"Received access token: {access_token[:10]}...")
        
        # Here you would typically:
        # 1. Validate the token with Google
        # 2. Get user information
        # 3. Create/update user in your database
        # 4. Create a session
        
        # For now, we'll just return a mock user
        mock_user = {
            "id": "123",
            "email": "user@example.com",
            "name": "Test User",
            "access_token": access_token,
            "token_received_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Returning mock user data for token: {access_token[:10]}...")
        return {"user": mock_user}
        
    except Exception as e:
        logger.error(f"Error processing callback: {str(e)}")
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    logger.info("Starting callback server...")
    uvicorn.run(app, host="0.0.0.0", port=3000) 