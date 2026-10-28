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
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyEmail() {
  const {
    verifyRegistration,
    resendRegistrationOTP,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

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

  const [submitting, setSubmitting] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/register", {
        replace: true,
      });
    }
  }, [email, navigate]);

  function handleChange(index, value) {
    const cleanValue = value.replace(/\D/g, "");

    const updated = [...digits];

    if (!cleanValue) {
      updated[index] = "";
      setDigits(updated);
      return;
    }

    updated[index] = cleanValue.slice(-1);
    setDigits(updated);

    if (index < 5) {
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

    pasted.split("").forEach(
      (digit, index) => {
        updated[index] = digit;
      }
    );

    setDigits(updated);

    inputRefs.current[
      Math.min(pasted.length, 5)
    ]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const otp = digits.join("");

    if (otp.length !== 6) {
      setError(
        "Please enter the complete 6-digit code."
      );
      return;
    }

    setSubmitting(true);

    try {
      await verifyRegistration(email, otp);

      navigate("/welcome", {
        replace: true,
        state: {
          email,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await resendRegistrationOTP(email);

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

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend verification code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl">

        <Logo />

        <h1 className="mt-7 text-2xl font-semibold text-ledger-paper">
          Verify your email
        </h1>

        <p className="mt-2 text-sm text-ledger-paper/60">
          We sent a 6-digit verification code to
        </p>

        <p className="mt-1 text-sm text-ledger-gold break-all">
          {email}
        </p>

        {error && (
          <div className="mt-5 text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded px-3 py-2">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 text-sm text-ledger-paper border border-ledger-gold/40 bg-ledger-gold/10 rounded px-3 py-2">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <div
            className="flex justify-between gap-2"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
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
                className="field-input w-11 h-12 sm:w-12 sm:h-14 rounded text-center text-xl font-semibold"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold-primary mt-7 w-full disabled:opacity-60"
          >
            {submitting
              ? "Verifying…"
              : "Verify email"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-ledger-paper/60">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-1 text-sm text-ledger-gold hover:underline disabled:opacity-60"
          >
            {resending
              ? "Sending…"
              : "Resend verification code"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            to="/register"
            className="text-ledger-paper/60 hover:text-ledger-paper"
          >
            ← Back to registration
          </Link>
        </p>

      </div>
    </div>
  );
}