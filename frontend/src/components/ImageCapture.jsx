import React, { useEffect, useRef, useState } from "react";

/** Shared image picker: multi-image mode when onFilesChange is provided. */
export default function ImageCapture({ onFilesChange, onFileSelected, resetKey = 0, disabled = false }) {
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);
  const itemsRef = useRef([]);
  const callbacksRef = useRef({ onFilesChange, onFileSelected });
  const lastResetKey = useRef(resetKey);
  const [items, setItems] = useState([]);
  const isMulti = typeof onFilesChange === "function";
  callbacksRef.current = { onFilesChange, onFileSelected };

  function replaceItems(next) {
    const retainedIds = new Set(next.map((item) => item.id));
    itemsRef.current.forEach((item) => {
      if (!retainedIds.has(item.id)) URL.revokeObjectURL(item.url);
    });
    itemsRef.current = next;
    setItems(next);
    callbacksRef.current.onFilesChange?.(next.map((item) => item.file));
    callbacksRef.current.onFileSelected?.(next.length ? next[next.length - 1].file : null);
  }

  function resetInputs() {
    if (uploadRef.current) uploadRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  function addFiles(fileList) {
    if (disabled) return;
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    resetInputs();
    if (!files.length) return;
    // In single-image mode only create a URL for the image we actually keep.
    const selected = isMulti ? files : [files[files.length - 1]];
    const added = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    replaceItems(isMulti ? [...itemsRef.current, ...added] : added);
  }

  function clear() {
    replaceItems([]);
    resetInputs();
  }

  useEffect(() => {
    if (lastResetKey.current !== resetKey) {
      lastResetKey.current = resetKey;
      clear();
    }
    // Only react to changes in resetKey, not parent callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    itemsRef.current = [];
  }, []);

  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg border border-ledger-line bg-ledger-panel/50 px-4 py-2.5 text-sm font-medium text-ledger-paper/90 transition-all duration-200 hover:border-ledger-gold hover:text-ledger-gold hover:bg-ledger-gold/15 hover:shadow-[0_0_16px_rgba(232,163,61,0.25)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-gold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button type="button" disabled={disabled} onClick={() => uploadRef.current?.click()} className={buttonClass}>
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></svg>
          {isMulti ? (items.length ? "Add Images" : "Upload Images") : "Upload Photo"}
        </button>
        <button type="button" disabled={disabled} onClick={() => cameraRef.current?.click()} className={buttonClass}>
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/><circle cx="12" cy="13" r="3.5" /></svg>
          Take a Photo
        </button>
        {items.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={clear}
            className="rounded-lg border border-rose-500/50 bg-rose-950/20 px-4 py-2.5 text-sm font-medium text-rose-400 transition-all duration-200 hover:bg-rose-500/20 hover:border-rose-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.25)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:opacity-50"
          >
            Clear All
          </button>
        )}
      </div>

      <input ref={uploadRef} type="file" accept="image/*" multiple={isMulti} className="hidden" aria-label="Choose produce images" onChange={(event) => addFiles(event.target.files)} disabled={disabled} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take a produce photo" onChange={(event) => addFiles(event.target.files)} disabled={disabled} />

      {items.length > 0 ? (
        <section aria-label="Selected produce images" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ledger-paper/80" aria-live="polite">{items.length} image{items.length === 1 ? "" : "s"} selected</p>
            <p className="text-xs text-ledger-paper/50">Add more photos or remove any image below</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item, index) => (
              <article key={item.id} className="group min-w-0 overflow-hidden rounded-xl border border-ledger-line bg-ledger-panel/70 transition-all duration-200 hover:border-ledger-gold/60 hover:shadow-[0_0_18px_rgba(232,163,61,0.15)]">
                <div className="relative aspect-square overflow-hidden bg-ledger-panel">
                  <img src={item.url} alt={`Selected produce image ${index + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-md bg-ledger-bg/85 px-2 py-1 text-xs font-semibold text-ledger-paper">{index + 1}</span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3">
                  <span className="min-w-0 flex-1 truncate text-xs text-ledger-paper/70" title={item.file.name}>{item.file.name}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Remove image ${index + 1}: ${item.file.name}`}
                    title="Remove image"
                    onClick={() => replaceItems(itemsRef.current.filter((entry) => entry.id !== item.id))}
                    className="shrink-0 rounded-md border border-rose-500/40 bg-rose-950/20 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/25 hover:border-rose-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:opacity-50 transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => uploadRef.current?.click()}
          className="flex min-h-44 w-full max-w-lg flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ledger-line bg-ledger-panel/20 px-4 py-8 text-center text-ledger-paper/60 transition-all duration-200 hover:border-ledger-gold hover:text-ledger-gold hover:bg-ledger-gold/5 hover:shadow-[0_0_22px_rgba(232,163,61,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-gold disabled:opacity-50"
        >
          <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5"/><path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5-5 4 4 3-3 4 4"/></svg>
          <span className="text-sm font-medium">{isMulti ? "Choose produce images" : "Choose a produce photo"}</span>
          <span className="text-xs text-ledger-paper/40">Or use Take a Photo to capture an image</span>
        </button>
      )}
    </div>
  );
}
