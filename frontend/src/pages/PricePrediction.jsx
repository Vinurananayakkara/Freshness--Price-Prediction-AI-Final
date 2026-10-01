import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";

const DEFAULT_FORM = {
  item: "",
  district: "",
  region_type: "",
  season: "",
  rainfall: "",
  temperature: "",
  humidity: "",
  supply_level: "Medium",
  demand_index: "Medium",
  distance_from_dambulla: "",
  middleman_count: "2",
  transport_cost: "500",
};

function formatRs(value) {
  return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PricePrediction() {
  const [options, setOptions]               = useState(null);
  const [form, setForm]                     = useState(DEFAULT_FORM);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState("");
  const [result, setResult]                 = useState(null);

  useEffect(() => {
    apiGet("/price-options")
      .then((opts) => {
        setOptions(opts);
        setForm((f) => ({
          ...f,
          item:        opts.items[0]        || "",
          region_type: opts.region_types[0] || "",
          season:      opts.seasons[0]      || "",
          supply_level: (opts.supply_levels || ["Low","Medium","High"])[1] || "Medium",
          demand_index: (opts.demand_levels  || ["Low","Medium","High"])[1] || "Medium",
        }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingOptions(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleDistrictChange(district) {
    update("district", district);
    if (!district) return;
    try {
      const defaults = await apiGet(`/district-defaults/${encodeURIComponent(district)}`);
      setForm((f) => ({
        ...f,
        region_type:           defaults.region_type,
        rainfall:              String(defaults.rainfall),
        temperature:           String(defaults.temperature),
        humidity:               String(defaults.humidity),
        distance_from_dambulla: String(defaults.distance),
      }));
    } catch {
      // non-fatal — user can still fill fields manually
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSubmitting(true);
    try {
      const payload = {
        item:                    form.item,
        region_type:             form.region_type,
        season:                  form.season,
        rainfall:                parseFloat(form.rainfall),
        temperature:             parseFloat(form.temperature),
        humidity:                parseFloat(form.humidity),
        supply_level:            form.supply_level,
        demand_index:            form.demand_index,
        distance_from_dambulla:  parseFloat(form.distance_from_dambulla),
        middleman_count:         parseInt(form.middleman_count, 10),
        transport_cost:          parseFloat(form.transport_cost),
        district:                form.district || undefined,
      };
      const data = await apiPost("/predict-price", payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingOptions) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 flex items-center gap-3 text-ledger-paper/50">
        <span className="spinner" />
        Loading form options…
      </div>
    );
  }

  const supplyLevels = options?.supply_levels || ["Low", "Medium", "High"];
  const demandLevels = options?.demand_levels  || ["Low", "Medium", "High"];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-ledger-gold/60 tracking-widest uppercase font-mono mb-1">Price Model</p>
        <h1 className="font-serif text-3xl text-ledger-paper mb-2">Advanced Price Prediction</h1>
        <p className="text-ledger-paper/50">
          Enter market conditions for full control over the price prediction.
          Select a district to auto-fill weather &amp; distance defaults.
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded-lg px-4 py-3 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-ledger-panel/50 border border-ledger-line rounded-2xl p-6 space-y-6">

        {/* Row 1 – Item + District */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Food item" hint="Crop variety">
            <select
              className="field-input w-full rounded-lg px-3 py-2"
              value={form.item}
              onChange={(e) => update("item", e.target.value)}
              required
            >
              {options.items.map((it) => (
                <option key={it} value={it}>{it}</option>
              ))}
            </select>
          </Field>

          <Field label="District" hint="Auto-fills weather & distance">
            <select
              className="field-input w-full rounded-lg px-3 py-2"
              value={form.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
            >
              <option value="">— Select district —</option>
              {options.districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Row 2 – Region + Season */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Region type">
            <select
              className="field-input w-full rounded-lg px-3 py-2"
              value={form.region_type}
              onChange={(e) => update("region_type", e.target.value)}
              required
            >
              {options.region_types.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          <Field label="Season">
            <select
              className="field-input w-full rounded-lg px-3 py-2"
              value={form.season}
              onChange={(e) => update("season", e.target.value)}
              required
            >
              {options.seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Section divider */}
        <div className="border-t border-ledger-line pt-4">
          <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-4">Weather conditions</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rainfall (mm)">
              <input type="number" step="any" required className="field-input w-full rounded-lg px-3 py-2"
                value={form.rainfall} onChange={(e) => update("rainfall", e.target.value)} />
            </Field>
            <Field label="Temperature (°C)">
              <input type="number" step="any" required className="field-input w-full rounded-lg px-3 py-2"
                value={form.temperature} onChange={(e) => update("temperature", e.target.value)} />
            </Field>
            <Field label="Humidity (%)">
              <input type="number" step="any" min="0" max="100" required className="field-input w-full rounded-lg px-3 py-2"
                value={form.humidity} onChange={(e) => update("humidity", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Market conditions */}
        <div className="border-t border-ledger-line pt-4">
          <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-4">Market conditions</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Supply level">
              <select className="field-input w-full rounded-lg px-3 py-2"
                value={form.supply_level} onChange={(e) => update("supply_level", e.target.value)}>
                {supplyLevels.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>

            <Field label="Demand index">
              <select className="field-input w-full rounded-lg px-3 py-2"
                value={form.demand_index} onChange={(e) => update("demand_index", e.target.value)}>
                {demandLevels.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>

            <Field label="Distance from Dambulla (km)">
              <input type="number" step="any" min="0" required className="field-input w-full rounded-lg px-3 py-2"
                value={form.distance_from_dambulla} onChange={(e) => update("distance_from_dambulla", e.target.value)} />
            </Field>

            <Field label="Middleman count">
              <input type="number" min="0" required className="field-input w-full rounded-lg px-3 py-2"
                value={form.middleman_count} onChange={(e) => update("middleman_count", e.target.value)} />
            </Field>

            <Field label="Transport cost (Rs.)">
              <input type="number" step="any" min="0" required className="field-input w-full rounded-lg px-3 py-2"
                value={form.transport_cost} onChange={(e) => update("transport_cost", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-ledger-line pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ledger-gold text-ledger-bg font-semibold hover:brightness-110 disabled:opacity-60 transition-all"
          >
            {submitting ? (
              <>
                <span className="spinner" style={{borderTopColor:"#12241D", borderColor:"rgba(18,36,29,0.3)"}} />
                Predicting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.757 7.5l.86-4.3a2 2 0 011.962-1.6h8.842a2 2 0 011.962 1.6l.86 4.3M4.757 7.5H19.243" />
                </svg>
                Predict price
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 fade-up bg-ledger-panel/60 border border-ledger-gold/40 rounded-2xl p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-2">Wholesale price</p>
              <p className="font-serif text-4xl text-ledger-paper tabular-nums">
                {formatRs(result.wholesale_price)}
                <span className="text-lg text-ledger-paper/40 ml-2">/ kg</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-ledger-paper/40 uppercase tracking-widest font-mono mb-2">Market (retail) price</p>
              <p className="font-serif text-4xl text-ledger-gold tabular-nums">
                {formatRs(result.market_price)}
                <span className="text-lg text-ledger-paper/40 ml-2">/ kg</span>
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-ledger-paper/30">
            {form.item} · {form.district || form.region_type} · {form.season} season
          </p>

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
                Estimated from typical variety price spreads, not identified from a photo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-ledger-paper/70">
        {label}
        {hint && <span className="ml-1.5 text-xs text-ledger-paper/35">({hint})</span>}
      </span>
      {children}
    </label>
  );
}
