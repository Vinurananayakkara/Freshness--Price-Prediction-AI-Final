import React from "react";

function formatRs(value) {
  if (value == null || isNaN(value)) return "—";
  return `Rs. ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function VarietyPriceTable({
  varieties = [],
  title = "Estimated prices by variety",
  showUnit = true,
  disclaimer = "Varieties are estimated, not visually identified.",
  className = "",
}) {
  if (!varieties || varieties.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-medium text-ledger-paper/70 tracking-wide">
          {title}
        </h4>
        {showUnit && (
          <span className="text-[11px] font-mono text-ledger-paper/40 uppercase tracking-wider">
            Unit: Rs. / kg
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ledger-line/70 bg-ledger-bg/40 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ledger-line/60 bg-ledger-panel/60 text-xs font-mono uppercase tracking-wider text-ledger-paper/50">
                <th scope="col" className="py-2.5 px-4 font-medium text-ledger-paper/60">
                  Variety
                </th>
                <th scope="col" className="py-2.5 px-4 font-medium text-right text-[#B6D7AE]">
                  <span className="inline-flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B6D7AE]"></span>
                    Wholesale
                  </span>
                </th>
                <th scope="col" className="py-2.5 px-4 font-medium text-right text-ledger-gold">
                  <span className="inline-flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-ledger-gold"></span>
                    Retail
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ledger-line/40">
              {varieties.map((v) => (
                <tr
                  key={v.name}
                  className="hover:bg-ledger-paper/[0.04] transition-colors duration-150"
                >
                  <td className="py-2.5 px-4 font-medium text-ledger-paper/90 whitespace-nowrap sm:whitespace-normal">
                    {v.name}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#B6D7AE] font-medium whitespace-nowrap">
                    {formatRs(v.wholesale_price)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-ledger-gold font-medium whitespace-nowrap">
                    {formatRs(v.market_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {disclaimer && (
        <p className="text-xs text-ledger-paper/40">
          {disclaimer}
        </p>
      )}
    </div>
  );
}
