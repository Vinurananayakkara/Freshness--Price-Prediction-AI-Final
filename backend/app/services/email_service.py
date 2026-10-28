import requests

from app.core.config import settings


BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_otp_email(
    email: str,
    otp: str,
    purpose: str,
) -> None:

    # -------------------------
    # Validate configuration
    # -------------------------

    if not settings.BREVO_API_KEY:
        raise RuntimeError(
            "Brevo API is not configured. "
            "Set BREVO_API_KEY in the backend .env file."
        )

    if not settings.EMAIL_FROM:
        raise RuntimeError(
            "Sender email is not configured. "
            "Set EMAIL_FROM in the backend .env file."
        )

    # -------------------------
    # Email content
    # -------------------------

    if purpose == "registration":
        subject = "Verify your Produce Ledger account"
        heading = "Welcome to Produce Ledger"
        description = (
            "Use this verification code to complete "
            "your registration."
        )

    elif purpose == "password_reset":
        subject = "Reset your Produce Ledger password"
        heading = "Produce Ledger Password Reset"
        description = (
            "Use this verification code to reset "
            "your password."
        )

    else:
        raise ValueError(
            f"Unsupported OTP purpose: {purpose}"
        )

    # -------------------------
    # HTML email
    # -------------------------

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
        color: #1f2937;
    ">

        <div style="
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 32px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        ">

            <h2 style="margin-top: 0;">
                {heading}
            </h2>

            <p>
                {description}
            </p>

            <div style="
                margin: 28px 0;
                padding: 18px;
                text-align: center;
                background-color: #f3f4f6;
                border-radius: 8px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
            ">
                {otp}
            </div>

            <p>
                This verification code will expire in
                <strong>
                    {settings.OTP_EXPIRE_MINUTES} minutes
                </strong>.
            </p>

            <p style="
                color: #6b7280;
                font-size: 14px;
            ">
                If you did not request this code,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 28px 0;
            ">

            <p style="
                margin-bottom: 0;
                color: #6b7280;
                font-size: 13px;
            ">
                Produce Ledger
            </p>

        </div>

    </body>
    </html>
    """

    # -------------------------
    # Brevo request
    # -------------------------

    payload = {
        "sender": {
            "name": settings.EMAIL_FROM_NAME,
            "email": settings.EMAIL_FROM,
        },
        "to": [
            {
                "email": email,
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    try:
        response = requests.post(
            BREVO_API_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )

    except requests.RequestException as e:
        raise RuntimeError(
            f"Unable to connect to Brevo API: {e}"
        ) from e

    # -------------------------
    # Check Brevo response
    # -------------------------

    if response.status_code not in (200, 201, 202):
        raise RuntimeError(
            f"Brevo email failed. "
            f"Status: {response.status_code}, "
            f"Response: {response.text}"
        )