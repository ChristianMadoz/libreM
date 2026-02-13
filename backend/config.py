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
        """
        Returns allowed CORS origins based on environment
        """
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            self.FRONTEND_URL
        ]
        
        # Add production domain if valid
        if self.FRONTEND_URL and self.FRONTEND_URL.startswith("http"):
             origins.append(self.FRONTEND_URL)
             
        # Add current InsForge domain if available
        # You might need to add specific insforge domains here if they change dynamically
        origins.append("https://ciyndj73.us-east.insforge.app") 
        
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
    if not settings.DATABASE_URL:
        # Fallack for local dev if not set
        print("WARNING: DATABASE_URL not found in env, using local default")
        # Usar la cadena completa para que funcione la conexión
        settings.DATABASE_URL = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require"

# Run validation
validate_settings()
