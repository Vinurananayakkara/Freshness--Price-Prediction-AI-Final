import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import hash_password, verify_password


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """Never store the real OTP in the database."""
    return hash_password(otp)


def verify_otp(otp: str, otp_hash: str) -> bool:
    return verify_password(otp, otp_hash)


def get_otp_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )