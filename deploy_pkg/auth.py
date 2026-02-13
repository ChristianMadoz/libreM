from fastapi import Request, HTTPException, Depends
from datetime import datetime, timezone
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from db_models import DbUser, DbUserSession

async def get_session_user(request: Request, db: AsyncSession):
    """
    Authenticator helper - checks session_token from cookies first,
    then Authorization header as fallback.
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
    result = await db.execute(select(DbUserSession).where(DbUserSession.session_token == session_token))
    session_obj = result.scalar_one_or_none()
    
    if not session_obj:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check if session is expired
    expires_at = session_obj.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Delete expired session
        await db.execute(delete(DbUserSession).where(DbUserSession.session_token == session_token))
        await db.commit()
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user data
    result = await db.execute(select(DbUser).where(DbUser.user_id == session_obj.user_id))
    user_obj = result.scalar_one_or_none()
    
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert SQLAlchemy object to dict for consistency
    return {
        "user_id": user_obj.user_id,
        "email": user_obj.email,
        "name": user_obj.name,
        "picture": user_obj.picture,
        "favorites": user_obj.favorites
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