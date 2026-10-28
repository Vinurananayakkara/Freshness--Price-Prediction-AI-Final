import React from "react";

export default function Logo({ compact = false, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label="Produce Ledger">
      <svg viewBox="0 0 64 64" className="w-10 h-10 shrink-0" role="img" aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="16" fill="#E8A33D" />
        <path d="M20 19h24v28H20z" fill="#173128" opacity=".96" />
        <path d="M25 27h14M25 33h14M25 39h8" stroke="#F3EFE2" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 19c1-6 6-9 12-8-1 6-5 9-12 8Z" fill="#7FB56E" />
        <path d="M33 20c-4-5-9-6-14-3 3 5 8 7 14 3Z" fill="#9CC98E" />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className="font-serif text-xl text-ledger-gold tracking-wide">Produce Ledger</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ledger-paper/45">Freshness · Market Intelligence</div>
        </div>
      )}
    </div>
  );
}
