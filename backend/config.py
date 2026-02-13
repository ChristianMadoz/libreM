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
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # PostgreSQL Details
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "insforge")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")

    # Validation in Settings class removed to allow either Mongo or Postgres
    
    # OAuth (optional)
    OAUTH_CLIENT_ID: str = os.getenv("OAUTH_CLIENT_ID", "")
    OAUTH_CLIENT_SECRET: str = os.getenv("OAUTH_CLIENT_SECRET", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is required")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://libre-m.vercel.app")
    
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
        if self.IS_PRODUCTION:
            # Production: Only allow specific domains
            return [self.FRONTEND_URL]
        else:
            # Development: Allow localhost
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                self.FRONTEND_URL
            ]
    
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
    """Validar que al menos una base de datos esté configurada"""
    if not settings.MONGODB_URI and not settings.DATABASE_URL:
        raise ValueError(
            "Se requiere al menos MONGODB_URI o DATABASE_URL.\n"
            "Por favor revise su archivo .env."
        )
    
    if not settings.SECRET_KEY:
        raise ValueError("SECRET_KEY es requerido.")

# Run validation
validate_settings()
