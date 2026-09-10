import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmritiNER Cognitive Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'smriti_ner.db'))}"
    )
    CORS_ORIGINS: list = ["*"]
    DISCLAIMER: str = (
        "RESEARCH PROTOTYPE: For cognitive wellness, memory training, and performance-based adaptation "
        "for citizens of all ages across the region."
    )

    class Config:
        case_sensitive = True

settings = Settings()
