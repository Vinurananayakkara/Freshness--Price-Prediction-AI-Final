import React, { useState } from "react";

export default function PasswordField({ label = "Password", value, onChange, placeholder, minLength, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-sm mb-1 text-ledger-paper/70">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          minLength={minLength}
          autoComplete={autoComplete}
          className="field-input w-full rounded px-3 py-2 pr-11"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-ledger-paper/45 hover:text-ledger-gold transition"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 5 9 5a16.6 16.6 0 01-3.1 3.6M6.2 6.2C4.1 7.5 3 9 3 9s3.5 5 9 5c1 0 1.9-.2 2.8-.5"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
