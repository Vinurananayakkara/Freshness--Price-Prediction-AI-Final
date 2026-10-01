import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PricePrediction from "./pages/PricePrediction.jsx";
import FreshnessCheck from "./pages/FreshnessCheck.jsx";
import InspectorDesk from "./pages/InspectorDesk.jsx";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
