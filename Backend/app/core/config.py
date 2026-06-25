from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Football Analytics Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-development-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Settings
    USE_SQLITE: bool = True
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "football_analytics")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @property
    def get_db_url(self) -> str:
        if self.USE_SQLITE:
            return "sqlite:///./football_analytics.db"
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # File Uploads
    UPLOAD_DIR: str = "uploads"
    RAW_VIDEO_DIR: str = os.path.join(UPLOAD_DIR, "raw")
    PROCESSED_VIDEO_DIR: str = os.path.join(UPLOAD_DIR, "processed")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.RAW_VIDEO_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_VIDEO_DIR, exist_ok=True)
