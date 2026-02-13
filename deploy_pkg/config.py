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
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is required")
    
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
    """Validate that all required settings are present"""
    required = {
        "MONGODB_URI": settings.MONGODB_URI,
        "SECRET_KEY": settings.SECRET_KEY,
    }
    
    missing = [key for key, value in required.items() if not value]
    
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please check your .env file. See .env.example for reference."
        )

# Run validation
# validate_settings()
