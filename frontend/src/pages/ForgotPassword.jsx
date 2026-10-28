import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import Logo from "../components/Logo.jsx";
import { apiPost } from "../api/client.js";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await apiPost("/auth/forgot-password", {
        email: cleanEmail,
      });

      navigate("/verify-reset-otp", {
        state: {
          email: cleanEmail,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl">

        <div className="mb-7">
          <Logo />

          <h1 className="font-serif text-2xl text-ledger-paper mt-6">
            Forgot password?
          </h1>

          <p className="text-ledger-paper/55 text-sm mt-2">
            Enter your email address and we'll send you a
            verification code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1 text-ledger-paper/70">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="field-input w-full rounded px-3 py-2"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Sending verification code..."
              : "Send verification code"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          <Link
            to="/login"
            className="text-ledger-gold hover:underline"
          >
            Back to sign in
          </Link>
        </p>

      </div>
    </div>
  );
}