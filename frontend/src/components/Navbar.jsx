import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/price-prediction", label: "Price Prediction" },
  { to: "/freshness-check", label: "Freshness Desk" },
  { to: "/inspector-desk", label: "Inspector Desk" },
   { to: "/profile", label: "Profile" },
  { to: "/affordable-products", label: "Affordable Products" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  if (!user) return null;

  function signOut() {
    setMobileOpen(false);
    logout();
    navigate("/login");
  }

  const linkStyle = (active) =>
    `block rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200
    ${active
      ? "border-ledger-gold bg-ledger-gold/15 text-ledger-gold shadow-[0_0_14px_rgba(232,163,61,0.2)]"
      : "border-transparent text-ledger-paper/70 hover:border-ledger-gold/60 hover:bg-ledger-gold/15 hover:text-ledger-gold hover:shadow-[0_0_12px_rgba(232,163,61,0.2)]"}`;

  return (
    <>
      {/* Original horizontal navbar remains on desktop */}
      <nav className="border-b border-ledger-line bg-ledger-panel/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/dashboard"><Logo /></Link>

          <div className="hidden md:flex items-center gap-2">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to}
                aria-current={location.pathname === link.to ? "page" : undefined}
                className={linkStyle(location.pathname === link.to)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-ledger-paper/60">{user.name}</span>
            <button type="button" onClick={signOut}
              className="hidden md:inline-flex text-sm px-3.5 py-1.5 rounded-lg border border-ledger-gold/50 text-ledger-paper/85 hover:border-ledger-gold hover:bg-ledger-gold/15 hover:text-ledger-gold hover:shadow-[0_0_14px_rgba(232,163,61,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              Log out
            </button>
            <button type="button" onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation"
              className="md:hidden rounded-lg border border-ledger-gold/60 px-3 py-2 text-sm text-ledger-gold hover:bg-ledger-gold/15 hover:shadow-[0_0_14px_rgba(232,163,61,0.25)] transition-all duration-200">
              ☰ Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile-only slide-out sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 w-full h-full bg-black/60" />
          <aside id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Mobile navigation"
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col border-r border-ledger-gold/40 bg-ledger-panel shadow-2xl">
            <div className="flex items-center justify-between gap-3 p-5 border-b border-ledger-line">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}><Logo /></Link>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu"
                className="rounded-lg border border-ledger-line px-2.5 py-1.5 text-ledger-paper hover:border-ledger-gold hover:text-ledger-gold hover:bg-ledger-gold/10 transition-colors">✕</button>
            </div>

            <div className="flex-1 p-4 space-y-2">
              <p className="px-3 mb-3 text-xs uppercase tracking-widest text-ledger-paper/50">Navigation</p>
              {LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={linkStyle(location.pathname === link.to)}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-ledger-line p-4 space-y-3">
              <p className="text-sm text-ledger-paper/70 truncate">{user.name}</p>
              <button type="button" onClick={signOut}
                className="w-full rounded-lg border border-amber-300/50 bg-ledger-gold text-ledger-bg font-semibold px-4 py-2.5 text-sm hover:bg-[#F5B041] hover:border-amber-300 hover:shadow-[0_0_16px_rgba(232,163,61,0.4)] transition-all duration-200">
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
