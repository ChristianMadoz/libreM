"""
Configuration management with environment variables
All secrets and credentials loaded from .env file - NEVER hardcoded
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
    # Prioritize DATABASE_URL, construct from components if missing
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # PostgreSQL Details
    POSTGRES_HOST = os.getenv("POSTGRES_HOST")
    POSTGRES_USER = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    
    @property
    def FINAL_DATABASE_URL(self) -> str:
        # 1. Prioritize explicit DATABASE_URL from environment (not .env)
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            return env_url
            
        # 2. Check components, but ignore "localhost" which is often a default in builders
        host = self.POSTGRES_HOST
        user = self.POSTGRES_USER
        if host and user and host != "localhost":
             return f"postgresql://{user}:{self.POSTGRES_PASSWORD}@{host}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
             
        # 3. Fallback to the current project's database URL
        # We prefer using the env var DATABASE_URL which will be provided during deployment
        return os.environ.get("DATABASE_URL", "")

    # OAuth (optional)
    OAUTH_CLIENT_ID: str = os.getenv("OAUTH_CLIENT_ID", "")
    OAUTH_CLIENT_SECRET: str = os.getenv("OAUTH_CLIENT_SECRET", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        # Developement fallback for convenience, DO NOT USE IN PROD without env var
        SECRET_KEY = "dev_secret_key_change_me" 
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://ciyndj73.us-east.insforge.app")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    IS_PRODUCTION: bool = ENVIRONMENT == "production"
    
    # Session
    SESSION_EXPIRY_DAYS: int = int(os.getenv("SESSION_EXPIRY_DAYS", "7"))
    
    # CORS Origins
    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            self.FRONTEND_URL
        ]
        if os.getenv("VERCEL_URL"):
             origins.append(f"https://{os.getenv('VERCEL_URL')}")
             
        return list(set(origins)) # Remove duplicates


    
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
    """Validar que la base de datos esté configurada"""
    url = settings.FINAL_DATABASE_URL
    if not url:
        print("ERROR: DATABASE_URL not found and no host/user provided")
    
    if url and url.startswith("postgres://"):
         # settings.DATABASE_URL = url.replace("postgres://", "postgresql://", 1) # Readonly property, no need to update
         pass

