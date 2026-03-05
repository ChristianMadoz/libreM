from fastapi import Request, HTTPException
from datetime import datetime, timezone
import httpx
from sqlalchemy.orm import Session
from config import settings
import db_models

async def get_session_user(request: Request, db: Session):
    """
    Authenticator helper - checks session_token from cookies first,
    then Authorization header as fallback.
    WARNING: Don't use FastAPI's HTTPAuthorizationCredentials - it breaks cookie auth.
    """
    # Try to get token from cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session = db.query(db_models.UserSession).filter(
        db_models.UserSession.session_token == session_token
    ).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check if session is expired
    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Delete expired session
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user data
    user = db.query(db_models.User).filter(
        db_models.User.user_id == session.user_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return user data as dict
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "favorites": user.favorites or [],
        "google_id": user.google_id,
        "created_at": user.created_at
    }

async def exchange_session_id(session_id: str) -> dict:
    """
    Exchange session_id for user data and session_token from Emergent Auth
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to exchange session ID"
                )
            
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to auth service: {str(e)}"
            )