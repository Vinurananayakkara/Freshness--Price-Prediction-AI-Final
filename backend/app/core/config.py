"""
Central app configuration, loaded from environment variables (.env).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app_users.db")

    FRONTEND_ORIGINS: list[str] = [
        o.strip() for o in os.getenv(
            "FRONTEND_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).split(",") if o.strip()
    ]


settings = Settings()

if settings.JWT_SECRET_KEY == "dev-secret-change-me":
    import warnings
    warnings.warn(
        "JWT_SECRET_KEY is using the insecure default. "
        "Set a real secret in backend/.env before deploying.",
        stacklevel=2,
    )
