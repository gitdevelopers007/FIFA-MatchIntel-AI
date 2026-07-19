import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "FIFA MatchIntel AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fifa_matchintel.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: str = os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    
    class Config:
        case_sensitive = True

settings = Settings()
