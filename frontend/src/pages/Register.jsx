import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import PasswordField from "../components/PasswordField.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register(
        name.trim(),
        email.trim(),
        password
      );

      navigate("/verify-email", {
        state: {
          email: email.trim(),
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl">

        <div className="mb-7">
          <Logo />

          <p className="text-ledger-paper/60 text-sm mt-4">
            Create your inspector account
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1 text-ledger-paper/70">
              Full name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              autoComplete="name"
              className="field-input w-full rounded px-3 py-2"
              placeholder="Jane Perera"
            />
          </div>

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
              autoComplete="email"
              className="field-input w-full rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <PasswordField
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            minLength={8}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirm password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            minLength={8}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold-primary w-full disabled:opacity-60"
          >
            {submitting
              ? "Sending verification code…"
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ledger-paper/60 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-ledger-gold hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}