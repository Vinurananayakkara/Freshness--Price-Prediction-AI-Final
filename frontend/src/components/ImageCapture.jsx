import React, { useRef, useState } from "react";

export default function ImageCapture({ onFileSelected }) {
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const [previewUrl, setPreviewUrl]  = useState(null);
  const [fileName,  setFileName]     = useState(null);

  function handleFile(file) {
    if (!file) return;
    // Revoke previous object URL to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    onFileSelected(file);
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    onFileSelected(null);
    // Reset hidden inputs so the same file can be re-selected
    if (fileInputRef.current)   fileInputRef.current.value   = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ledger-line hover:border-ledger-gold hover:text-ledger-gold transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload photo
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ledger-line hover:border-ledger-gold hover:text-ledger-gold transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take a photo
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ledger-rotten/50 text-ledger-rotten hover:bg-ledger-rotten/10 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Preview */}
      {previewUrl ? (
        <div className="rounded-xl overflow-hidden border border-ledger-line max-w-sm relative group">
          <img
            src={previewUrl}
            alt="Selected produce"
            className="w-full h-60 object-cover"
          />
          {fileName && (
            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-xs text-ledger-paper/70 truncate">
              {fileName}
            </div>
          )}
        </div>
      ) : (
        /* Drop-zone placeholder */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 w-full max-w-sm h-48 rounded-xl border-2 border-dashed border-ledger-line hover:border-ledger-gold/60 cursor-pointer transition-colors group"
        >
          <svg className="w-10 h-10 text-ledger-line group-hover:text-ledger-gold/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm0 0h.008v.008H13.5V12zm6.75-6.75a.75.75 0 110 1.5.75.75 0 010-1.5z" />
          </svg>
          <p className="text-sm text-ledger-paper/40 group-hover:text-ledger-paper/60 transition-colors">Click to select a photo</p>
        </div>
      )}
    </div>
  );
}
