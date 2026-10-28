import React, { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Logo from "../components/Logo.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { apiPost } from "../api/client.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password", {
        replace: true,
      });
    }
  }, [email, otp, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await apiPost("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!email || !otp) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl text-center">

          <div className="flex justify-center">
            <Logo />
          </div>

          <div className="mt-8">
            <div className="mx-auto w-16 h-16 rounded-full border border-ledger-gold/40 bg-ledger-gold/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-ledger-gold"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="mt-5 font-serif text-2xl text-ledger-paper">
              Password reset successful
            </h1>

            <p className="mt-3 text-sm text-ledger-paper/60">
              Your password has been changed
              successfully. You can now sign in using
              your new password.
            </p>
          </div>

          <Link
            to="/login"
            className="block mt-7 w-full py-2.5 rounded bg-ledger-gold text-ledger-bg font-semibold hover:brightness-110 transition"
          >
            Continue to login
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl">

        <Logo />

        <div className="mt-7">
          <h1 className="font-serif text-2xl text-ledger-paper">
            Create new password
          </h1>

          <p className="text-ledger-paper/55 text-sm mt-2">
            Enter a new password for your Produce
            Ledger account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="Enter new password"
            autoComplete="new-password"
          />

          <div className="mt-4">
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          <p className="mt-2 text-xs text-ledger-paper/45">
            Password must contain at least 8
            characters.
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Resetting password..."
              : "Reset password"}
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