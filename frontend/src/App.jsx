import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PricePrediction from "./pages/PricePrediction.jsx";
import FreshnessCheck from "./pages/FreshnessCheck.jsx";
import InspectorDesk from "./pages/InspectorDesk.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Welcome from "./pages/Welcome.jsx";
import VerifyResetOTP from "./pages/VerifyResetOTP.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Profile from "./pages/Profile.jsx";
import AffordableProducts from "./pages/AffordableProducts.jsx";

export default function App() {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/verify-reset-otp"
          element={<VerifyResetOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-prediction"
          element={
            <ProtectedRoute>
              <PricePrediction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freshness-check"
          element={
            <ProtectedRoute>
              <FreshnessCheck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector-desk"
          element={
            <ProtectedRoute>
              <InspectorDesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/affordable-products"
          element={
            <ProtectedRoute>
              <AffordableProducts />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
