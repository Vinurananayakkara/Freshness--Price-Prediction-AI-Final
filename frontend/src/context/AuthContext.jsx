import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiPost, apiGet } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    apiGet("/auth/me")
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // -------------------------
  // Login
  // -------------------------

  async function login(email, password) {
    const data = await apiPost("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "access_token",
      data.access_token
    );

    setUser(data.user);

    return data.user;
  }

  // -------------------------
  // Registration
  // -------------------------

  async function register(name, email, password) {
    return await apiPost("/auth/register", {
      name,
      email,
      password,
    });
  }

  // -------------------------
  // Verify registration OTP
  // -------------------------

  async function verifyRegistration(email, otp) {
    return await apiPost(
      "/auth/verify-registration",
      {
        email,
        otp,
      }
    );
  }

  // -------------------------
  // Resend registration OTP
  // -------------------------

  async function resendRegistrationOTP(email) {
    return await apiPost(
      "/auth/resend-registration-otp",
      {
        email,
      }
    );
  }

  // -------------------------
  // Logout
  // -------------------------

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyRegistration,
        resendRegistrationOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}