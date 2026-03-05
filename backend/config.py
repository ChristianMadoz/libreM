"""
Configuration management with environment variables
All secrets and credentials loaded from environment - NEVER hardcoded
"""
import os
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file
load_dotenv()

class Settings:
    """
    Application settings loaded from environment variables
    """
    
    # Database Connections
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # PostgreSQL Details (fallback construction)
    if not DATABASE_URL:
        POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
        POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
        POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
        POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")
        POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
        
        if POSTGRES_HOST and POSTGRES_USER:
             DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

    # OAuth (optional)
    OAUTH_CLIENT_ID: str = os.getenv("OAUTH_CLIENT_ID", "")
    OAUTH_CLIENT_SECRET: str = os.getenv("OAUTH_CLIENT_SECRET", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_change_me")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    IS_PRODUCTION: bool = ENVIRONMENT == "production"
    
    # Session
    SESSION_EXPIRY_DAYS: int = int(os.getenv("SESSION_EXPIRY_DAYS", "7"))
    
    # CORS Origins
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """
        Returns allowed CORS origins based on environment
        """
        origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
        
        # Add configured frontend URL
        if self.FRONTEND_URL and self.FRONTEND_URL.startswith("http"):
            origins.append(self.FRONTEND_URL)
        
        # Add Vercel preview URLs
        vercel_url = os.getenv("VERCEL_URL", "")
        if vercel_url:
            origins.append(f"https://{vercel_url}")
        
        return list(set(origins))
    
    # Cookie settings
    @property
    def COOKIE_SECURE(self) -> bool:
        """Cookies should be secure in production"""
        return self.IS_PRODUCTION
    
    @property
    def COOKIE_SAMESITE(self) -> str:
        """SameSite setting based on environment"""
        return "none" if self.IS_PRODUCTION else "lax"

# Create singleton instance
settings = Settings()

# Validate critical settings on import
def validate_settings():
    """Validate database configuration"""
    if not settings.DATABASE_URL:
        print("WARNING: DATABASE_URL not found in environment variables. Database operations will fail.")

# Run validation
validate_settings()

if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
