import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import PasswordField from "../components/PasswordField.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { await login(email, password); navigate("/dashboard"); }
    catch (err) { setError(err.message || "Login failed."); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-7"><Logo /><p className="text-ledger-paper/60 text-sm mt-4">Sign in to your inspector account</p></div>
        {error && <div className="mb-4 text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded px-3 py-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm mb-1 text-ledger-paper/70">Email</label><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" className="field-input w-full rounded px-3 py-2" placeholder="you@example.com" /></div>
          <PasswordField value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          <div className="flex justify-end -mt-1"><Link to="/forgot-password" className="text-sm text-ledger-gold/80 hover:text-ledger-gold hover:underline">Forgot password?</Link></div>
          <button type="submit" disabled={submitting} className="btn-gold-primary w-full disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="mt-6 text-sm text-ledger-paper/60 text-center">Don't have an account? <Link to="/register" className="text-ledger-gold hover:underline">Register</Link></p>
      </div>
    </div>
  );
}
