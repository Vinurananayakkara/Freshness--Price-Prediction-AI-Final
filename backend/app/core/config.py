"""
Central app configuration, loaded from environment variables (.env).
"""

import os
import warnings
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # -------------------------
    # JWT
    # -------------------------

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "dev-secret-change-me"
    )

    JWT_ALGORITHM: str = "HS256"

    JWT_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_EXPIRE_MINUTES", "1440")
    )

    # -------------------------
    # Database
    # -------------------------

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./app_users.db"
    )

    # -------------------------
    # Frontend / CORS
    # -------------------------

    FRONTEND_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS",
            "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]

    # -------------------------
    # Brevo Email API
    # -------------------------

    BREVO_API_KEY: str = os.getenv(
        "BREVO_API_KEY",
        ""
    )

    EMAIL_FROM: str = os.getenv(
        "EMAIL_FROM",
        ""
    )

    EMAIL_FROM_NAME: str = os.getenv(
        "EMAIL_FROM_NAME",
        "Produce Ledger"
    )

    # -------------------------
    # OTP
    # -------------------------

    OTP_EXPIRE_MINUTES: int = int(
        os.getenv("OTP_EXPIRE_MINUTES", "10")
    )

    OTP_MAX_ATTEMPTS: int = int(
        os.getenv("OTP_MAX_ATTEMPTS", "5")
    )


settings = Settings()


if settings.JWT_SECRET_KEY == "dev-secret-change-me":
    warnings.warn(
        "JWT_SECRET_KEY is using the insecure default. "
        "Set a real secret in backend/.env before deploying.",
        stacklevel=2,
    )