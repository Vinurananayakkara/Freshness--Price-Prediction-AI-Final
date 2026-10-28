import React from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import Logo from "../components/Logo.jsx";

export default function Welcome() {
  const location = useLocation();

  const email = location.state?.email;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-ledger-panel/60 border border-ledger-line rounded-2xl p-6 sm:p-8 shadow-2xl text-center">

        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8">

          <div className="mx-auto w-16 h-16 rounded-full border border-ledger-gold/40 bg-ledger-gold/10 flex items-center justify-center">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-ledger-gold"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>

          </div>

          <h1 className="mt-5 text-2xl font-semibold text-ledger-paper">
            Welcome to Produce Ledger
          </h1>

          <p className="mt-3 text-sm text-ledger-paper/60">
            Your email has been verified successfully.
            Your account is ready to use.
          </p>

          {email && (
            <p className="mt-2 text-sm text-ledger-gold break-all">
              {email}
            </p>
          )}

        </div>

        <Link
          to="/login"
          className="btn-gold-primary block mt-7 w-full text-center"
        >
          Continue to login
        </Link>

      </div>
    </div>
  );
}