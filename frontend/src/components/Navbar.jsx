import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/price-prediction", label: "Price Prediction" },
  { to: "/freshness-check", label: "Freshness Desk" },
  { to: "/inspector-desk", label: "Inspector Desk" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="border-b border-ledger-line bg-ledger-panel/60 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-serif text-xl text-ledger-gold tracking-wide">
          Produce Ledger
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-colors ${
                location.pathname === l.to
                  ? "text-ledger-gold"
                  : "text-ledger-paper/70 hover:text-ledger-paper"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-ledger-paper/60">
            {user.name}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-sm px-3 py-1.5 rounded border border-ledger-line hover:border-ledger-gold hover:text-ledger-gold transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
      {/* mobile links */}
      <div className="md:hidden flex overflow-x-auto gap-4 px-6 pb-3 text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`whitespace-nowrap ${
              location.pathname === l.to ? "text-ledger-gold" : "text-ledger-paper/70"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
