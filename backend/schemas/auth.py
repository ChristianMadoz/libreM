from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class User(UserBase):
    user_id: str
    google_id: Optional[str] = None
    favorites: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(UserLogin):
    name: str

class GoogleAuthRequest(BaseModel):
    session_id: str

class Token(BaseModel):
    token: str
    user: User
