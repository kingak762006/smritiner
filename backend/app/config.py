import os
import json
from typing import Any, List
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmritiNER Cognitive Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'smriti_ner.db'))}"
    )
    CORS_ORIGINS: Any = ["*"]
    DISCLAIMER: str = (
        "RESEARCH PROTOTYPE: For cognitive wellness, memory training, and performance-based adaptation "
        "for citizens of all ages across the region."
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list:
        if isinstance(v, str):
            v = v.strip()
            if not v or v == "*":
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
