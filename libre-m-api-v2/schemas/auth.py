from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class User(UserBase):
    user_id: str = Field(..., alias="id")
    google_id: Optional[str] = Field(None, alias="googleId")
    favorites: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

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
