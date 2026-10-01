import React, { useEffect, useState } from "react";
import ImageCapture from "../components/ImageCapture.jsx";
import StampBadge from "../components/StampBadge.jsx";
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
  const [file, setFile]               = useState(null);
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please upload or take a photo first.");
      return;
    }
    if (!district) {
      setError("Please select a district.");
      return;
    }
    setError("");
    setResult(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file",            file);
      formData.append("district",        district);
      formData.append("season",          advanced.season);
      formData.append("supply_level",    advanced.supply_level);
      formData.append("demand_index",    advanced.demand_index);
      formData.append("middleman_count", advanced.middleman_count);
      formData.append("transport_cost",  advanced.transport_cost);
      const data = await apiPostForm("/predict-hybrid", formData);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-ledger-gold/60 tracking-widest uppercase font-mono mb-1">Combined flow</p>
        <h1 className="font-serif text-3xl text-ledger-paper mb-2">Inspector Desk</h1>
        <p className="text-ledger-paper/50">
          One photo, one district — get the item, its freshness, and an estimated price in a single pass.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-ledger-panel/50 border border-ledger-line rounded-2xl p-6 space-y-6">

        {/* Image capture */}
        <div>
          <p className="text-sm text-ledger-paper/70 mb-3 font-medium">Produce photo</p>
          <ImageCapture onFileSelected={setFile} />
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
                  className="text-xs text-ledger-gold hover:underline"
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
                className="field-input w-full max-w-xs rounded-lg px-3 py-2"
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
            className="flex items-center gap-2 text-sm text-ledger-paper/50 hover:text-ledger-paper/80 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showAdvanced ? "Hide" : "Show"} advanced options
            <span className="text-xs text-ledger-paper/30">(season, supply, transport…)</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 animate-fade-up">
              <AdvField label="Season">
                <select className="field-input w-full rounded-lg px-3 py-2"
                  value={advanced.season} onChange={(e) => updateAdvanced("season", e.target.value)}>
                  {SEASON_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </AdvField>

              <AdvField label="Supply level">
                <select className="field-input w-full rounded-lg px-3 py-2"
                  value={advanced.supply_level} onChange={(e) => updateAdvanced("supply_level", e.target.value)}>
                  {SUPPLY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </AdvField>

              <AdvField label="Demand index">
                <select className="field-input w-full rounded-lg px-3 py-2"
                  value={advanced.demand_index} onChange={(e) => updateAdvanced("demand_index", e.target.value)}>
                  {DEMAND_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </AdvField>

              <AdvField label="Middlemen">
                <input type="number" min="0" className="field-input w-full rounded-lg px-3 py-2"
                  value={advanced.middleman_count} onChange={(e) => updateAdvanced("middleman_count", e.target.value)} />
              </AdvField>

              <AdvField label="Transport cost (Rs.)" className="sm:col-span-2">
                <input type="number" step="any" min="0" className="field-input w-full rounded-lg px-3 py-2"
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
          disabled={submitting || districts.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ledger-gold text-ledger-bg font-semibold hover:brightness-110 disabled:opacity-60 transition-all"
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

      {/* Result */}
      {result && (
        <div className="mt-8 fade-up bg-ledger-panel/60 border border-ledger-gold/40 rounded-2xl overflow-hidden">
          {/* Freshness verdict row */}
          <div className="flex items-center gap-6 flex-wrap p-6 border-b border-ledger-line">
            <StampBadge verdict={result.prediction} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-0.5">Identified item</p>
              <p className="font-serif text-2xl text-ledger-paper mb-3">{result.item}</p>

              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-ledger-paper/40 mb-0.5">Confidence</p>
                  <p className="text-lg text-ledger-gold font-mono">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-ledger-paper/40 mb-0.5">Freshness score</p>
                  <p className="text-lg text-ledger-gold font-mono">{result.freshness_score.toFixed(1)}<span className="text-sm text-ledger-paper/40"> / 100</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Price section -- entirely skipped for rotten items */}
          <div className="p-6">
            <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-1">
              {result.district} · {result.region_type} · {result.distance_from_dambulla} km from Dambulla
            </p>

            {result.prediction === "Rotten" ? (
              <div className="flex items-start gap-2 mt-2 text-ledger-paper/60 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-ledger-rotten/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                This item was identified as rotten, so no price is shown — spoiled produce isn't priced at market.
              </div>
            ) : result.price_available ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <div>
                    <p className="text-xs text-ledger-paper/40 mb-1">Wholesale price</p>
                    <p className="font-serif text-3xl text-ledger-paper tabular-nums">
                      {formatRs(result.wholesale_price)}
                      <span className="text-sm text-ledger-paper/40 ml-1.5">/ kg</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ledger-paper/40 mb-1">Market (retail) price</p>
                    <p className="font-serif text-3xl text-ledger-gold tabular-nums">
                      {formatRs(result.market_price)}
                      <span className="text-sm text-ledger-paper/40 ml-1.5">/ kg</span>
                    </p>
                  </div>
                </div>

                {result.varieties && result.varieties.length > 0 && (
                  <div className="mt-6 border-t border-ledger-line pt-4">
                    <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-3">
                      By variety (estimated)
                    </p>
                    <div className="space-y-2">
                      {result.varieties.map((v) => (
                        <div key={v.name} className="flex items-center justify-between text-sm">
                          <span className="text-ledger-paper/70">{v.name}</span>
                          <span className="font-mono text-ledger-paper/90 tabular-nums">
                            {formatRs(v.wholesale_price)} <span className="text-ledger-paper/30">wholesale</span>
                            <span className="mx-2 text-ledger-paper/20">·</span>
                            {formatRs(v.market_price)} <span className="text-ledger-paper/30">market</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-ledger-paper/30 mt-3">
                      Estimated from typical variety price spreads — the photo isn't used to identify the exact variety.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-2 mt-2 text-ledger-paper/60 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-ledger-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                {result.note || "No pricing data available for this item."}
              </div>
            )}
          </div>
        </div>
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
