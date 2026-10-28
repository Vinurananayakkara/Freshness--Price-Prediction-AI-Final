from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey, UniqueConstraint

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

     # NEW: User's selected district
    district = Column(String(100), nullable=True)

    # Email verification
    email_verified = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), index=True, nullable=False)

    # "registration" or "password_reset"
    purpose = Column(String(30), nullable=False)

    # We will store a hash, not the actual OTP.
    otp_hash = Column(String(255), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    attempts = Column(Integer, default=0, nullable=False)

    used = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

class Favorite(Base):
    __tablename__ = "favorites"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "item",
            name="uq_favorite_user_item",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
            Integer,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
    )

    item = Column(String(50), nullable=False)