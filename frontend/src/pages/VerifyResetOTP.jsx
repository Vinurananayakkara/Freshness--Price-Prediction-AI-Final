import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Logo from "../components/Logo.jsx";
import { apiPost } from "../api/client.js";

export default function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [digits, setDigits] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", {
        replace: true,
      });
    }
  }, [email, navigate]);

  function handleChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updated = [...digits];
    updated[index] = digit;

    setDigits(updated);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (
      e.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updated = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setDigits(updated);

    const focusIndex = Math.min(
      pasted.length,
      6
    ) - 1;

    inputRefs.current[focusIndex]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();

    const otp = digits.join("");

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError(
        "Please enter the complete 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      await apiPost(
        "/auth/verify-password-reset-otp",
        {
          email,
          otp,
        }
      );

      navigate("/reset-password", {
        state: {
          email,
          otp,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      await apiPost("/auth/forgot-password", {
        email,
      });

      setDigits([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setMessage(
        "A new verification code has been sent."
      );

      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl">

        <Logo />

        <div className="mt-7">
          <h1 className="font-serif text-2xl text-ledger-paper">
            Verify your email
          </h1>

          <p className="text-ledger-paper/55 text-sm mt-2">
            Enter the 6-digit verification code
            sent to
          </p>

          <p className="text-ledger-gold text-sm mt-1 break-all">
            {email}
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="mt-6"
        >
          <div
            className="flex justify-between gap-2"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] =
                    element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                className="field-input w-full min-w-0 aspect-square rounded text-center text-xl font-semibold"
                aria-label={`OTP digit ${
                  index + 1
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm text-ledger-gold">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Verifying..."
              : "Verify code"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <span className="text-ledger-paper/55">
            Didn't receive the code?{" "}
          </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-ledger-gold hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        </div>

        <p className="mt-5 text-sm text-center">
          <Link
            to="/login"
            className="text-ledger-paper/55 hover:text-ledger-gold transition"
          >
            Back to sign in
          </Link>
        </p>

      </div>
    </div>
  );
}