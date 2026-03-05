from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import uuid
import hashlib
import re
from database import get_db
from auth import get_session_user, exchange_session_id
from config import settings
import db_models
from schemas.auth import GoogleAuthRequest, UserRegister, Token, User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/google", response_model=Token)
async def google_auth(auth_req: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    """
    Exchange session_id from Google OAuth for user data and session_token
    """
    session_id = auth_req.session_id
    
    # Exchange session_id for user data
    auth_data = await exchange_session_id(session_id)
    
    # Check if user exists
    existing_user = db.query(db_models.User).filter(
        db_models.User.email == auth_data["email"]
    ).first()
    
    if existing_user:
        user_id = existing_user.user_id
        # Update user data if changed
        existing_user.name = auth_data["name"]
        existing_user.picture = auth_data.get("picture")
        existing_user.google_id = auth_data["id"]
        db.commit()
        favorites = existing_user.favorites or []
    else:
        # Create new user with custom user_id
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = db_models.User(
            user_id=user_id,
            google_id=auth_data["id"],
            email=auth_data["email"],
            name=auth_data["name"],
            picture=auth_data.get("picture"),
            favorites=[],
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        favorites = []
    
    # Store session in database
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)
    
    # Delete old sessions for this user
    db.query(db_models.UserSession).filter(
        db_models.UserSession.user_id == user_id
    ).delete()
    
    # Create new session
    new_session = db_models.UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    
    # Set secure httponly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )
    
    return {
        "user": {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "favorites": favorites
        },
        "token": session_token
    }

@router.post("/register", response_model=Token)
async def register(reg_data: UserRegister, response: Response, db: Session = Depends(get_db)):
    """
    Register a new user with email and password
    """
    import logging
    logger = logging.getLogger(__name__)
    
    email = reg_data.email
    password = reg_data.password
    name = reg_data.name
    
    logger.info(f"Attempting to register user: {email}")
    
    # Validate email format
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_pattern, email):
        logger.warning(f"Invalid email format: {email}")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if user already exists
    existing_user = db.query(db_models.User).filter(
        db_models.User.email == email
    ).first()
    
    if existing_user:
        logger.warning(f"Registration failed: Email {email} already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = db_models.User(
            user_id=user_id,
            email=email,
            name=name,
            password_hash=password_hash,
            picture=None,
            favorites=[],
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User created successfully: {user_id}")
        
        # Create session
        session_token = uuid.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)
        
        new_session = db_models.UserSession(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_session)
        db.commit()
        
        logger.info(f"Session created for user: {user_id}")
        
        # Set secure httponly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.SESSION_EXPIRY_DAYS * 24 * 60 * 60
        )
        
        return {
            "user": new_user,
            "token": session_token
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/me", response_model=User)
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user
    """
    user = await get_session_user(request, db)
    return user

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Logout user by deleting session
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        db.query(db_models.UserSession).filter(
            db_models.UserSession.session_token == session_token
        ).delete()
        db.commit()
        response.delete_cookie(key="session_token", path="/")
    
    return {"success": True}
