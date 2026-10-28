from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.db.models import EmailOTP, User
from app.schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResendOTPRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserOut,
    VerifyPasswordResetOTPRequest,
    VerifyRegistrationRequest,
)
from app.services.email_service import send_otp_email
from app.services.otp_service import (
    generate_otp,
    get_otp_expiry,
    hash_otp,
    verify_otp,
)

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise credentials_error

    email = decode_access_token(credentials.credentials)

    if not email:
        raise credentials_error

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise credentials_error

    return user


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    existing = db.query(User).filter(User.email == email).first()

    if existing and existing.email_verified:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    try:
        # Existing but unverified account
        if existing:
            existing.name = data.name.strip()
            existing.password_hash = hash_password(data.password)
            user = existing

        # New account
        else:
            user = User(
                name=data.name.strip(),
                email=email,
                password_hash=hash_password(data.password),
                email_verified=False,
            )

            db.add(user)

        # Invalidate previous registration OTPs
        db.query(EmailOTP).filter(
            EmailOTP.email == email,
            EmailOTP.purpose == "registration",
            EmailOTP.used.is_(False),
        ).update(
            {"used": True},
            synchronize_session=False,
        )

        otp = generate_otp()

        otp_record = EmailOTP(
            email=email,
            purpose="registration",
            otp_hash=hash_otp(otp),
            expires_at=get_otp_expiry(),
            attempts=0,
            used=False,
        )

        db.add(otp_record)
        db.commit()

    except Exception as e:
        db.rollback()

        print(
            "DATABASE ERROR:",
            type(e).__name__,
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create registration request.",
        )

    # Send OTP after database record has been created
    try:
        send_otp_email(
            email=email,
            otp=otp,
            purpose="registration",
        )

    except Exception as e:

        print("\n================ EMAIL ERROR ================")
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", repr(e))
        print("=============================================\n")

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email. Please try again.",
        )

    return MessageResponse(
        message="Verification code sent to your email."
    )


# =========================================================
# VERIFY REGISTRATION OTP
# =========================================================

@router.post(
    "/verify-registration",
    response_model=MessageResponse,
)
def verify_registration(
    data: VerifyRegistrationRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification request.",
        )

    if user.email_verified:
        return MessageResponse(
            message="Email is already verified. You can log in."
        )

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.purpose == "registration",
            EmailOTP.used.is_(False),
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No active verification code found.",
        )

    now = datetime.now(timezone.utc)

    expires_at = otp_record.expires_at

    # SQLite may return datetime without timezone information
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    # Check expiry
    if now > expires_at:

        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please request a new code.",
        )

    # Check maximum attempts
    if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:

        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=429,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    # Check OTP
    if not verify_otp(
        data.otp,
        otp_record.otp_hash,
    ):

        otp_record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Incorrect verification code.",
        )

    # Verification successful
    otp_record.used = True
    user.email_verified = True

    db.commit()

    return MessageResponse(
        message="Email verified successfully."
    )


# =========================================================
# RESEND REGISTRATION OTP
# =========================================================

@router.post(
    "/resend-registration-otp",
    response_model=MessageResponse,
)
def resend_registration_otp(
    data: ResendOTPRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification request.",
        )

    if user.email_verified:
        return MessageResponse(
            message="Email is already verified. You can log in."
        )

    # Invalidate previous OTPs
    db.query(EmailOTP).filter(
        EmailOTP.email == email,
        EmailOTP.purpose == "registration",
        EmailOTP.used.is_(False),
    ).update(
        {"used": True},
        synchronize_session=False,
    )

    otp = generate_otp()

    otp_record = EmailOTP(
        email=email,
        purpose="registration",
        otp_hash=hash_otp(otp),
        expires_at=get_otp_expiry(),
        attempts=0,
        used=False,
    )

    db.add(otp_record)
    db.commit()

    try:
        send_otp_email(
            email=email,
            otp=otp,
            purpose="registration",
        )

    except Exception as e:

        print("\n================ EMAIL ERROR ================")
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", repr(e))
        print("=============================================\n")

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email. Please try again.",
        )

    return MessageResponse(
        message="A new verification code has been sent."
    )


# =========================================================
# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()

    # Do not reveal whether the email exists
    if not user:
        return MessageResponse(
            message="If an account exists for this email, a verification code has been sent."
        )

    # Invalidate previous password reset OTPs
    db.query(EmailOTP).filter(
        EmailOTP.email == email,
        EmailOTP.purpose == "password_reset",
        EmailOTP.used.is_(False),
    ).update(
        {"used": True},
        synchronize_session=False,
    )

    otp = generate_otp()

    otp_record = EmailOTP(
        email=email,
        purpose="password_reset",
        otp_hash=hash_otp(otp),
        expires_at=get_otp_expiry(),
        attempts=0,
        used=False,
    )

    db.add(otp_record)
    db.commit()

    try:
        send_otp_email(
            email=email,
            otp=otp,
            purpose="password_reset",
        )

    except Exception as e:
        print("\n================ EMAIL ERROR ================")
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", repr(e))
        print("=============================================\n")

        raise HTTPException(
            status_code=500,
            detail="Unable to send password reset email. Please try again.",
        )

    return MessageResponse(
        message="If an account exists for this email, a verification code has been sent."
    )

# =========================================================
# VERIFY PASSWORD RESET OTP
# =========================================================

@router.post(
    "/verify-password-reset-otp",
    response_model=MessageResponse,
)
def verify_password_reset_otp(
    data: VerifyPasswordResetOTPRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid password reset request.",
        )

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.purpose == "password_reset",
            EmailOTP.used.is_(False),
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No active password reset code found.",
        )

    now = datetime.now(timezone.utc)
    expires_at = otp_record.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    # Check expiry
    if now > expires_at:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please request a new code.",
        )

    # Check maximum attempts
    if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=429,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    # Check OTP
    if not verify_otp(
        data.otp,
        otp_record.otp_hash,
    ):
        otp_record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Incorrect verification code.",
        )

    return MessageResponse(
        message="Verification code confirmed."
    )

# =========================================================
# RESET PASSWORD
# =========================================================

@router.post(
    "/reset-password",
    response_model=MessageResponse,
)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid password reset request.",
        )

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.purpose == "password_reset",
            EmailOTP.used.is_(False),
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No active password reset code found.",
        )

    now = datetime.now(timezone.utc)
    expires_at = otp_record.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if now > expires_at:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please request a new code.",
        )

    if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=429,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    # Verify OTP again before changing password
    if not verify_otp(
        data.otp,
        otp_record.otp_hash,
    ):
        otp_record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Incorrect verification code.",
        )

    # Change password
    user.password_hash = hash_password(
        data.new_password
    )

    # OTP cannot be reused
    otp_record.used = True

    db.commit()

    return MessageResponse(
        message="Password reset successfully. You can now log in with your new password."
    )

# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in.",
        )

    token = create_access_token(
        subject=user.email
    )

    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


# =========================================================
# CURRENT USER DETAILS
# =========================================================

@router.get(
    "/me",
    response_model=UserOut,
)
def me(
    current_user: User = Depends(get_current_user),
):
    return UserOut.model_validate(current_user)