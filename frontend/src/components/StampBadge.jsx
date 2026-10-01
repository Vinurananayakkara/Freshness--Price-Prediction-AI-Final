import React from "react";

export default function StampBadge({ verdict }) {
  const isFresh = verdict === "Fresh";

  return (
    <div
      className={[
        "stamp stamp-in",
        "w-32 h-32 flex flex-col items-center justify-center",
        "font-serif text-lg uppercase tracking-widest leading-tight",
        isFresh
          ? "text-ledger-fresh border-ledger-fresh"
          : "text-ledger-rotten border-ledger-rotten",
      ].join(" ")}
    >
      {/* Icon */}
      {isFresh ? (
        <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{verdict}</span>
    </div>
  );
}
