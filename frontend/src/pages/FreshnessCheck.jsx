import React, { useRef, useState } from "react";
import ImageCapture from "../components/ImageCapture.jsx";
import StampBadge from "../components/StampBadge.jsx";
import { apiPostForm } from "../api/client.js";

export default function FreshnessCheck() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const requestId = useRef(0);

  function handleFilesChange(nextFiles) {
    requestId.current += 1;
    setFiles(nextFiles);
    setResults([]);
    setError("");
  }

  function clearAll() {
    requestId.current += 1;
    setFiles([]);
    setResults([]);
    setError("");
    setResetKey((value) => value + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!files.length) {
      setError("Please upload or take a photo first.");
      return;
    }
    const currentRequest = ++requestId.current;
    setSubmitting(true);
    setResults([]);
    setError("");
    const nextResults = [];
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        try {
          const data = await apiPostForm("/predict-freshness", form);
          nextResults.push({ fileName: file.name, data, error: null });
        } catch (err) {
          nextResults.push({ fileName: file.name, data: null, error: err.message || "Prediction failed." });
        }
      }
      if (requestId.current === currentRequest) setResults(nextResults);
    } finally {
      if (requestId.current === currentRequest) setSubmitting(false);
    }
  }

  const successful = results.filter((entry) => entry.data);
  const failed = results.filter((entry) => entry.error);
  const products = [...new Set(successful.map((entry) => entry.data.item.trim().toLowerCase()))];
  const mixedProducts = products.length > 1;
  // Do not report a batch average when any image failed or product types differ.
  const batchReady = results.length > 0 && failed.length === 0 && !mixedProducts && successful.length === files.length;
  const average = batchReady
    ? successful.reduce((total, entry) => total + Number(entry.data.freshness_score), 0) / successful.length
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl text-ledger-gold mb-2">Freshness Desk</h1>
      <p className="text-ledger-paper/60 mb-8">Upload or capture one or more images of the same produce type to analyse freshness.</p>

      <form onSubmit={handleSubmit} className="bg-ledger-panel/50 border border-ledger-gold/25 rounded-2xl p-4 sm:p-6 space-y-6 shadow-lg shadow-black/10 transition-colors hover:border-ledger-gold/45">
        <ImageCapture onFilesChange={handleFilesChange} resetKey={resetKey} disabled={submitting} />
        {error && <div className="text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded px-3 py-2">{error}</div>}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || !files.length}
            className="btn-gold-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-gold disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-200"
          >
            {submitting ? "Inspecting images…" : "Check freshness"}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-serif text-2xl text-ledger-paper">Individual image results</h2>
          {results.map((entry, index) => {
            const isFresh = Boolean(entry.data && String(entry.data.prediction || "").toLowerCase().includes("fresh"));
            return (
              <div
                key={`${index}-${entry.fileName}`}
                className={`rounded-2xl p-4 sm:p-5 flex flex-wrap gap-5 items-center transition-all duration-300 ${
                  entry.data
                    ? isFresh
                      ? "bg-ledger-panel/65 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_22px_rgba(34,197,94,0.22)] hover:bg-ledger-panel/85"
                      : "bg-ledger-panel/65 border border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_22px_rgba(239,68,68,0.22)] hover:bg-ledger-panel/85"
                    : "bg-ledger-panel/65 border border-rose-500/40"
                }`}
              >
                {entry.data ? (
                  <StampBadge verdict={entry.data.prediction} />
                ) : (
                  <span className="text-rose-400 font-semibold px-4 py-2 rounded-lg border border-rose-500/30 bg-rose-950/30">
                    Unsupported / Failed
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-ledger-paper/55 break-all mb-1.5">
                    Image {index + 1}: {entry.fileName}
                  </p>
                  {entry.data ? (
                    <>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-lg font-semibold text-ledger-paper">{entry.data.item}</p>
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
                          {entry.data.prediction}
                        </span>
                      </div>
                      <p className="text-sm text-ledger-paper/70 mt-1">
                        Confidence: {(entry.data.confidence * 100).toFixed(1)}%
                      </p>
                      <p
                        className={`inline-block mt-2 rounded-lg border px-3.5 py-1.5 text-xs font-medium font-mono ${
                          isFresh
                            ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-sm"
                            : "border-rose-500/40 bg-rose-950/40 text-rose-300 shadow-sm"
                        }`}
                      >
                        Freshness score: {Number(entry.data.freshness_score).toFixed(1)} / 100
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-rose-400">{entry.error}</p>
                  )}
                </div>
              </div>
            );
          })}
          {mixedProducts && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-rose-300">
              Mixed products detected. Please upload images of the same produce type; no average was calculated.
            </div>
          )}
          {failed.length > 0 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-rose-300">
              {failed.length} image(s) could not be analysed. No batch average was calculated. Remove or replace those images and try again.
            </div>
          )}
          {batchReady && (
            <div className="bg-ledger-panel/75 border border-ledger-gold/60 rounded-2xl p-5 sm:p-7 space-y-3.5 shadow-xl shadow-ledger-gold/5">
              <h3 className="font-serif text-xl text-ledger-paper">Batch summary</h3>
              <p className="text-ledger-paper/70">Product: {successful[0].data.item} · Images: {successful.length}</p>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ledger-paper/55">Average freshness indicator</p>
                  <p
                    className={`text-3xl sm:text-4xl font-semibold tabular-nums ${
                      average >= 50 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {average.toFixed(1)} <span className="text-base text-ledger-paper/50">/ 100</span>
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3.5 py-1 text-xs font-medium ${
                    average >= 50
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-rose-500/40 bg-rose-950/30 text-rose-300"
                  }`}
                >
                  {successful.length} image{successful.length !== 1 ? "s" : ""} analysed · {average >= 50 ? "Fresh batch" : "Spoiled / Rotten"}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-ledger-line/60" role="progressbar" aria-label="Average freshness indicator" aria-valuenow={Math.max(0, Math.min(100, average))} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    average >= 50
                      ? "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                      : "bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, average))}%` }}
                />
              </div>
              <p className="text-xs text-ledger-paper/50">Arithmetic average of the individual model-derived freshness scores; not a measured physical freshness percentage.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
