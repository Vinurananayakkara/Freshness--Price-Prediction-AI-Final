import React from "react";

export default function StampBadge({ verdict }) {
  const isFresh = String(verdict || "").trim().toLowerCase().includes("fresh");
  const displayVerdict = verdict || (isFresh ? "Fresh" : "Rotten");

  return (
    <div
      className={[
        "stamp stamp-in relative",
        "w-32 h-32 sm:w-36 sm:h-36 flex flex-col items-center justify-center p-2",
        "font-serif tracking-widest uppercase select-none transition-all duration-300",
        isFresh ? "stamp-fresh" : "stamp-rotten",
      ].join(" ")}
      aria-label={`Verdict: ${displayVerdict}`}
    >
      {/* Subtle inner concentric ring for authentic inspector seal look */}
      <div
        className={`absolute inset-1.5 rounded-full border border-dashed pointer-events-none opacity-60 ${
          isFresh ? "border-emerald-400/60" : "border-rose-400/60"
        }`}
      />

      {/* Top tiny eyebrow tag */}
      <span
        className={`text-[9px] font-mono tracking-widest uppercase mb-1 px-1.5 py-0.5 rounded ${
          isFresh
            ? "text-emerald-300 bg-emerald-500/15"
            : "text-rose-300 bg-rose-500/15"
        }`}
      >
        {isFresh ? "Verified" : "Inspected"}
      </span>

      {/* Primary Icon */}
      {isFresh ? (
        <svg
          className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg
          className="w-7 h-7 text-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}

      {/* Verdict text */}
      <span className="text-base sm:text-lg font-bold mt-1 tracking-wider">
        {displayVerdict}
      </span>

      {/* Bottom subtle rating indicator */}
      <span className="text-[8px] font-mono tracking-[0.2em] opacity-80 mt-0.5">
        {isFresh ? "GRADE · A" : "GRADE · SPOILED"}
      </span>
    </div>
  );
}
