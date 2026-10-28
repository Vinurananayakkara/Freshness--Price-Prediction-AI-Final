import React, { useEffect, useRef, useState } from "react";
import ImageCapture from "../components/ImageCapture.jsx";
import StampBadge from "../components/StampBadge.jsx";
import VarietyPriceTable from "../components/VarietyPriceTable.jsx";
import { apiGet, apiPostForm } from "../api/client.js";

const SEASON_OPTIONS    = ["Maha", "Yala"];
const SUPPLY_OPTIONS    = ["Low", "Medium", "High"];
const DEMAND_OPTIONS    = ["Low", "Medium", "High"];
const DEFAULT_ADVANCED  = {
  season:          "Maha",
  supply_level:    "Medium",
  demand_index:    "Medium",
  middleman_count: "2",
  transport_cost:  "500",
};

function formatRs(value) {
  return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InspectorDesk() {
  const [districts, setDistricts]     = useState([]);
  const [districtError, setDistrictError] = useState("");
  const [district, setDistrict]       = useState("");
  const [files, setFiles]             = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const requestId = useRef(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced]       = useState(DEFAULT_ADVANCED);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [result, setResult]           = useState(null);

  function loadDistricts() {
    setDistrictError("");
    apiGet("/districts")
      .then((d) => {
        setDistricts(d.districts);
        setDistrict(d.districts[0] || "");
      })
      .catch((err) => setDistrictError(err.message || "Failed to load districts."));
  }

  useEffect(() => { loadDistricts(); }, []);

  function updateAdvanced(field, value) {
    setAdvanced((a) => ({ ...a, [field]: value }));
  }

  function handleFilesChange(next) {
    requestId.current += 1;
    setFiles(next);
    setResult(null);
    setError("");
  }

  function startNewAnalysis() {
    requestId.current += 1;
    setFiles([]);
    setResult(null);
    setError("");
    setResetKey((n) => n + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!files.length) {
      setError("Please upload or take a photo first.");
      return;
    }
    if (!district) {
      setError("Please select a district.");
      return;
    }
    const currentRequest = ++requestId.current;
    setError("");
    setResult(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("district",        district);
      formData.append("season",          advanced.season);
      formData.append("supply_level",    advanced.supply_level);
      formData.append("demand_index",    advanced.demand_index);
      formData.append("middleman_count", advanced.middleman_count);
      formData.append("transport_cost",  advanced.transport_cost);
      const data = await apiPostForm("/predict-hybrid-batch", formData);
      if (requestId.current === currentRequest) setResult(data);
    } catch (err) {
      if (requestId.current === currentRequest) setError(err.message || "Prediction failed.");
    } finally {
      if (requestId.current === currentRequest) setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-ledger-gold/60 tracking-widest uppercase font-mono mb-1">Combined flow</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ledger-gold mb-2">Inspector Desk</h1>
        <p className="text-ledger-paper/50">
          Upload images of one produce type, choose a district, and analyse average freshness and estimated prices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-ledger-panel/50 border border-ledger-gold/25 rounded-2xl p-4 sm:p-6 space-y-6 shadow-lg shadow-black/10 transition-colors hover:border-ledger-gold/45">

        {/* Image capture */}
        <div>
          <p className="text-sm text-ledger-paper/70 mb-3 font-medium">Produce photos</p>
          <ImageCapture onFilesChange={handleFilesChange} resetKey={resetKey} disabled={submitting} />
        </div>

        {/* District selector */}
        <div>
          <label className="block">
            <span className="block text-sm mb-1 text-ledger-paper/70 font-medium">District</span>

            {districtError ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-ledger-rotten">{districtError}</span>
                <button
                  type="button"
                  onClick={loadDistricts}
                  className="text-xs font-medium text-ledger-gold border border-ledger-gold/50 bg-ledger-gold/10 rounded-md px-3 py-1 hover:bg-ledger-gold hover:text-ledger-bg hover:shadow-[0_0_14px_rgba(232,163,61,0.4)] transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            ) : districts.length === 0 ? (
              <div className="flex items-center gap-2 text-ledger-paper/40 text-sm">
                <span className="spinner" />
                Loading districts…
              </div>
            ) : (
              <select
                className="field-input w-full max-w-xs rounded-lg border border-ledger-line hover:border-ledger-gold/60 focus:border-ledger-gold px-3 py-2 transition-colors"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </label>
        </div>

        {/* Advanced options toggle */}
        <div className="border-t border-ledger-line pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-ledger-line px-3.5 py-2 text-sm text-ledger-paper/80 bg-ledger-panel/40 hover:border-ledger-gold hover:bg-ledger-gold/15 hover:text-ledger-gold hover:shadow-[0_0_16px_rgba(232,163,61,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-90 text-ledger-gold" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showAdvanced ? "Hide" : "Show"} advanced options
            <span className="text-xs text-ledger-paper/40">(season, supply, transport…)</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 animate-fade-up">
              <AdvField label="Season">
                <select className="field-input w-full rounded-lg border border-ledger-line hover:border-[#B6D7AE]/65 focus:border-ledger-gold px-3 py-2 transition-colors"
                  value={advanced.season} onChange={(e) => updateAdvanced("season", e.target.value)}>
                  {SEASON_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </AdvField>

              <AdvField label="Supply level">
                <select className="field-input w-full rounded-lg border border-ledger-line hover:border-[#B6D7AE]/65 focus:border-ledger-gold px-3 py-2 transition-colors"
                  value={advanced.supply_level} onChange={(e) => updateAdvanced("supply_level", e.target.value)}>
                  {SUPPLY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </AdvField>

              <AdvField label="Demand index">
                <select className="field-input w-full rounded-lg border border-ledger-line hover:border-[#B6D7AE]/65 focus:border-ledger-gold px-3 py-2 transition-colors"
                  value={advanced.demand_index} onChange={(e) => updateAdvanced("demand_index", e.target.value)}>
                  {DEMAND_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </AdvField>

              <AdvField label="Middlemen">
                <input type="number" min="0" className="field-input w-full rounded-lg border border-ledger-line hover:border-[#B6D7AE]/65 focus:border-ledger-gold px-3 py-2 transition-colors"
                  value={advanced.middleman_count} onChange={(e) => updateAdvanced("middleman_count", e.target.value)} />
              </AdvField>

              <AdvField label="Transport cost (Rs.)" className="sm:col-span-2">
                <input type="number" step="any" min="0" className="field-input w-full rounded-lg border border-ledger-line hover:border-[#B6D7AE]/65 focus:border-ledger-gold px-3 py-2 transition-colors"
                  value={advanced.transport_cost} onChange={(e) => updateAdvanced("transport_cost", e.target.value)} />
              </AdvField>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded-lg px-4 py-3 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || districts.length === 0 || !files.length}
          className="btn-gold-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-gold disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-200"
        >
          {submitting ? (
            <>
              <span className="spinner" style={{borderTopColor:"#12241D", borderColor:"rgba(18,36,29,0.3)"}} />
              Inspecting…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Inspect &amp; price
            </>
          )}
        </button>
      </form>

      {/* Batch results */}
      {result && (
        <section className="mt-8 space-y-4">
          <h2 className="font-serif text-2xl text-ledger-paper">Individual image results</h2>
          {result.images.map((entry, index) => {
            const isFresh = Boolean(entry.prediction && String(entry.prediction).toLowerCase().includes("fresh"));
            return (
              <div
                key={index}
                className={`rounded-2xl p-4 sm:p-5 flex items-center gap-5 flex-wrap transition-all duration-300 ${
                  entry.error
                    ? "bg-ledger-panel/65 border border-rose-500/40"
                    : isFresh
                    ? "bg-ledger-panel/65 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_22px_rgba(34,197,94,0.22)] hover:bg-ledger-panel/85"
                    : "bg-ledger-panel/65 border border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_22px_rgba(239,68,68,0.22)] hover:bg-ledger-panel/85"
                }`}
              >
                {entry.error ? (
                  <span className="text-rose-400 font-semibold px-4 py-2 rounded-lg border border-rose-500/30 bg-rose-950/30">
                    Unsupported / Failed
                  </span>
                ) : (
                  <StampBadge verdict={entry.prediction} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-ledger-paper/55 break-all mb-1.5">Image {index + 1}: {entry.file_name}</p>
                  {entry.error ? (
                    <p className="text-sm text-rose-400">{entry.error}</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-lg font-semibold text-ledger-paper">{entry.item}</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isFresh
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isFresh ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-pulse"
                            }`}
                          />
                          {entry.prediction}
                        </span>
                      </div>
                      <p className="text-sm text-ledger-paper/60 mt-1">Confidence: {(entry.confidence * 100).toFixed(1)}%</p>
                      <p
                        className={`inline-block mt-2 rounded-lg border px-3.5 py-1.5 text-xs font-medium font-mono ${
                          isFresh
                            ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-sm"
                            : "border-rose-500/40 bg-rose-950/40 text-rose-300 shadow-sm"
                        }`}
                      >
                        Freshness score: {entry.freshness_score.toFixed(1)} / 100
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {result.batch_ready && (
            <div className="bg-ledger-panel/75 border border-ledger-gold/60 rounded-2xl p-5 sm:p-7 space-y-3.5 shadow-xl shadow-ledger-gold/5">
              <h3 className="font-serif text-xl text-ledger-paper">Batch summary</h3>
              <p className="text-ledger-paper/70">{result.item} · {result.image_count} image(s)</p>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ledger-paper/55">Average freshness indicator</p>
                  <p
                    className={`text-3xl sm:text-4xl font-semibold tabular-nums ${
                      result.average_freshness_score >= 50 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {result.average_freshness_score.toFixed(1)} <span className="text-base text-ledger-paper/50">/ 100</span>
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3.5 py-1 text-xs font-medium ${
                    result.average_freshness_score >= 50
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-rose-500/40 bg-rose-950/30 text-rose-300"
                  }`}
                >
                  {result.image_count} image{result.image_count !== 1 ? "s" : ""} analysed · {result.average_freshness_score >= 50 ? "Fresh batch" : "Spoiled / Rotten"}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-ledger-line/60" role="progressbar" aria-label="Average freshness indicator" aria-valuenow={Math.max(0, Math.min(100, result.average_freshness_score))} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.average_freshness_score >= 50
                      ? "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                      : "bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, result.average_freshness_score))}%` }}
                />
              </div>
              <p className="text-xs text-ledger-paper/50">Average of model-derived image scores; not a laboratory-measured freshness percentage.</p>
            </div>
          )}
          {result.note && (
            <div className="border border-rose-500/40 bg-rose-950/20 rounded-lg p-4 text-sm text-rose-300">{result.note}</div>
          )}
          {result.price_available && (
            <div className="bg-ledger-panel/70 border border-ledger-gold/50 rounded-2xl p-5 sm:p-7 space-y-5 shadow-lg shadow-ledger-gold/5">
              <p className="text-xs text-ledger-paper/50 uppercase tracking-widest">{result.district} · {result.region_type} · {result.distance_from_dambulla} km from Dambulla</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#B6D7AE]/30 bg-[#B6D7AE]/5 p-4 transition-all hover:border-[#B6D7AE]/70 hover:bg-[#B6D7AE]/10"><p className="text-sm text-ledger-paper/60">Estimated wholesale price</p>
                  <p className="font-serif text-2xl text-ledger-paper">{formatRs(result.wholesale_price)} <span className="text-sm">/ kg</span></p></div>
                <div className="rounded-xl border border-ledger-gold/35 bg-ledger-gold/5 p-4 transition-all hover:border-ledger-gold/75 hover:bg-ledger-gold/10"><p className="text-sm text-ledger-paper/60">Estimated retail price</p>
                  <p className="font-serif text-2xl text-ledger-gold">{formatRs(result.market_price)} <span className="text-sm">/ kg</span></p></div>
              </div>
              {result.varieties?.length > 0 && (
                <div className="border-t border-ledger-line pt-5">
                  <VarietyPriceTable varieties={result.varieties} />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AdvField({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm mb-1 text-ledger-paper/60">{label}</span>
      {children}
    </label>
  );
}
