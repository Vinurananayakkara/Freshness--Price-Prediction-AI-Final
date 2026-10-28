
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPatch } from "../api/client.js";

const EMPTY_PROFILE = { name: "", email: "", district: "" };

export default function Profile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const [userData, districtData] = await Promise.all([
          apiGet("/profile"),
          apiGet("/districts"),
        ]);

        setProfile({
          name: userData.name ?? "",
          email: userData.email ?? "",
          district: userData.district ?? "",
        });

        setDistricts(districtData.districts ?? []);
      } catch (err) {
        setError(err.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);

      const updated = await apiPatch("/profile", {
        name: profile.name.trim(),
        district: profile.district || null,
      });

      setProfile({
        name: updated.name ?? "",
        email: updated.email ?? profile.email,
        district: updated.district ?? "",
      });

      setMessage("Your profile has been saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-[#F3EFE2]/70">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#E8A33D]">
          Your account
        </p>
        <h1 className="text-4xl font-semibold text-[#F3EFE2]">
          User Profile
        </h1>
        <p className="mt-3 text-[#F3EFE2]/65">
          Set your district to receive market-price estimates relevant
          to your area.
        </p>
      </div>

      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E8A33D]/40 bg-[#E8A33D]/10 text-2xl text-[#E8A33D]">
            {profile.name.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[#F3EFE2]">
              {profile.name || "Your account"}
            </h2>
            <p className="break-all text-sm text-[#F3EFE2]/60">
              {profile.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium text-[#F3EFE2]"
            >
              Full name
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              required
              maxLength={120}
              value={profile.name}
              onChange={handleChange}
              className="field-input w-full rounded-lg px-4 py-3"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-medium text-[#F3EFE2]"
            >
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              readOnly
              className="field-input w-full cursor-not-allowed rounded-lg px-4 py-3 opacity-70"
            />
            <p className="mt-2 text-xs text-[#F3EFE2]/50">
              Your registered email address is read-only.
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-district"
              className="mb-2 block text-sm font-medium text-[#F3EFE2]"
            >
              Your district
            </label>
            <select
              id="profile-district"
              name="district"
              value={profile.district}
              onChange={handleChange}
              className="field-input w-full rounded-lg px-4 py-3"
              required
            >
              <option value="">Select your district</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#F3EFE2]/55">
              Affordable product estimates use your saved district.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !profile.district}
            className="btn-gold-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <div className="mt-6">
        <Link
          to="/affordable-products"
          className="text-sm font-medium text-[#E8A33D] hover:underline"
        >
          Explore affordable products →
        </Link>
      </div>
    </main>
  );
}
