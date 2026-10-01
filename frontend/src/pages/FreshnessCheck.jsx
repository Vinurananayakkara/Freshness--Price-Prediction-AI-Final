import React, { useState } from "react";
import ImageCapture from "../components/ImageCapture.jsx";
import StampBadge from "../components/StampBadge.jsx";
import { apiPostForm } from "../api/client.js";

export default function FreshnessCheck() {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please upload or take a photo first.");
      return;
    }
    setError("");
    setResult(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiPostForm("/predict-freshness", formData);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl text-ledger-gold mb-2">Freshness Desk</h1>
      <p className="text-ledger-paper/60 mb-8">
        Upload or take a photo of a produce item to get its freshness verdict.
      </p>

      <form onSubmit={handleSubmit} className="bg-ledger-panel/50 border border-ledger-line rounded-xl p-6 space-y-6">
        <ImageCapture onFileSelected={setFile} />

        {error && (
          <div className="text-sm text-ledger-rotten border border-ledger-rotten/40 bg-ledger-rotten/10 rounded px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded bg-ledger-gold text-ledger-bg font-semibold hover:brightness-110 disabled:opacity-60 transition"
        >
          {submitting ? "Inspecting…" : "Check freshness"}
        </button>
      </form>

      {result && (
        <div className="mt-8 bg-ledger-panel/50 border border-ledger-gold/50 rounded-xl p-6 flex items-center gap-6 flex-wrap">
          <StampBadge verdict={result.prediction} />
          <div>
            <p className="text-sm text-ledger-paper/60">Identified item</p>
            <p className="font-serif text-2xl mb-3">{result.item}</p>
            <p className="text-sm text-ledger-paper/60">Confidence</p>
            <p className="text-lg text-ledger-gold">{(result.confidence * 100).toFixed(1)}%</p>
            {result.freshness_score !== null && result.freshness_score !== undefined && (
              <>
                <p className="text-sm text-ledger-paper/60 mt-3">Freshness score</p>
                <p className="text-lg text-ledger-gold">{result.freshness_score} / 100</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
