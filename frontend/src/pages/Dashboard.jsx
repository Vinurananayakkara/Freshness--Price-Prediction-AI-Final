import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MODES = [
  {
    to: "/price-prediction",
    emoji: "📊",
    title: "Advanced Price Prediction",
    description:
      "Enter market conditions yourself — item, district, season, rainfall, distance, middleman count, transport cost and more — and get a predicted farm-gate price.",
    badge: "Manual entry",
    color: "group-hover:border-ledger-gold",
  },
  {
    to: "/freshness-check",
    emoji: "🌿",
    title: "Freshness Desk",
    description:
      "Upload or snap a photo of a produce item. The AI model identifies it and returns a freshness verdict with a confidence score.",
    badge: "Vision AI",
    color: "group-hover:border-ledger-fresh",
  },
  {
    to: "/inspector-desk",
    emoji: "🔍",
    title: "Inspector Desk",
    description:
      "The combined flow for everyday use: snap a photo and pick your district — get the item, its freshness, and an estimated price in one pass.",
    badge: "All-in-one",
    color: "group-hover:border-ledger-gold",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm text-ledger-gold/70 tracking-widest uppercase mb-1 font-mono">
          {greeting}
        </p>
        <h1 className="font-serif text-4xl text-ledger-paper mb-2">
          Welcome back,{" "}
          <span className="text-ledger-gold">
            {user?.name?.split(" ")[0] || "Inspector"}
          </span>
        </h1>
        <p className="text-ledger-paper/50 text-base">
          Choose a desk to begin your inspection.
        </p>
      </div>

      {/* Stat bar */}
      <div className="flex gap-6 mb-10 flex-wrap">
        {[
          { label: "Active tools", value: "3" },
          { label: "AI models", value: "2" },
          { label: "Districts covered", value: "25" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1 min-w-[120px] rounded-xl border border-ledger-line bg-ledger-panel/40 px-5 py-4"
          >
            <p className="font-serif text-2xl text-ledger-gold">{s.value}</p>
            <p className="text-xs text-ledger-paper/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {MODES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`group relative block rounded-2xl border border-ledger-line bg-ledger-panel/40 p-6 hover:bg-ledger-panel/70 transition-all duration-200 ${m.color}`}
          >
            {/* Badge */}
            <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full border border-ledger-line text-ledger-paper/40 font-mono">
              {m.badge}
            </span>

            {/* Icon */}
            <div className="text-4xl mb-4 leading-none">{m.emoji}</div>

            <h2 className="font-serif text-xl mb-2 text-ledger-paper group-hover:text-ledger-gold transition-colors">
              {m.title}
            </h2>
            <p className="text-sm text-ledger-paper/55 leading-relaxed mb-5">
              {m.description}
            </p>

            <span className="inline-flex items-center gap-1.5 text-sm text-ledger-gold/70 group-hover:text-ledger-gold transition-colors">
              Open desk
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-xs text-ledger-paper/25 font-mono">
        Produce Ledger · Sri Lankan Market Intelligence · Powered by XGBoost &amp; Keras CNN
      </p>
    </div>
  );
}
