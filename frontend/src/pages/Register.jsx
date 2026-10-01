import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-xl p-8">
        <h1 className="font-serif text-2xl text-ledger-gold mb-1">Produce Ledger</h1>
        <p className="text-ledger-paper/60 text-sm mb-6">Create your inspector account</p>

        {error && (
          <div className="mb-4 text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-ledger-paper/70">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input w-full rounded px-3 py-2"
              placeholder="Jane Perera"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-ledger-paper/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input w-full rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-ledger-paper/70">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input w-full rounded px-3 py-2"
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded bg-ledger-gold text-ledger-bg font-semibold hover:brightness-110 disabled:opacity-60 transition"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ledger-paper/60 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-ledger-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
