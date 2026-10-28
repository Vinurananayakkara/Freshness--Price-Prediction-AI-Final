
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../api/client.js";

const PRODUCT_ORDER = [
  "Apple",
  "Banana",
  "Cucumber",
  "Okra",
  "Orange",
  "Potato",
  "Tomato",
];

const formatPrice = (value) =>
  Number.isFinite(Number(value))
    ? `Rs. ${Number(value).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "Unavailable";

export default function AffordableProducts() {
  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [filter, setFilter] = useState("all");
  const [district, setDistrict] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [priceData, favouriteData] = await Promise.all([
        apiGet("/recommendations/affordable"),
        apiGet("/profile/favourites"),
      ]);

      setProducts(priceData.products ?? []);
      setDistrict(priceData.district ?? "");
      setPriceNote(priceData.price_note ?? "");
      setFavourites(
        (favouriteData.favourites ?? []).map((f) => f.item)
      );
    } catch (err) {
      setError(err.message || "Unable to load affordable products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleProducts = useMemo(() => {
    const list = products.filter((product) =>
      filter === "favourites"
        ? favourites.includes(product.item)
        : true
    );

    return [...list].sort((a, b) => {
      const priceDifference =
        Number(a.market_price) - Number(b.market_price);

      if (Number.isFinite(priceDifference) && priceDifference !== 0) {
        return priceDifference;
      }

      return PRODUCT_ORDER.indexOf(a.item) - PRODUCT_ORDER.indexOf(b.item);
    });
  }, [products, favourites, filter]);

  async function toggleFavourite(item) {
    const isFavourite = favourites.includes(item);
    setBusyItem(item);
    setError("");
    setNotice("");

    try {
      if (isFavourite) {
        await apiDelete(
          `/profile/favourites/${encodeURIComponent(item)}`
        );

        setFavourites((current) =>
          current.filter((name) => name !== item)
        );
        setNotice(`${item} removed from favourites.`);
      } else {
        await apiPost("/profile/favourites", { item });

        setFavourites((current) =>
          current.includes(item) ? current : [...current, item]
        );
        setNotice(`${item} added to favourites.`);
      }
    } catch (err) {
      setError(err.message || "Unable to update favourites.");
    } finally {
      setBusyItem("");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#E8A33D]">
            Smart shopping
          </p>
          <h1 className="text-4xl font-semibold text-[#F3EFE2]">
            Affordable Products
          </h1>
          <p className="mt-3 max-w-2xl text-[#F3EFE2]/65">
            Explore estimated produce prices for your district and
            find the lowest-priced products first.
          </p>
          {district && (
            <p className="mt-3 text-sm text-[#E8A33D]">
              <span className="text-[#F3EFE2]/60">Your district:</span>{" "}
              {district}
            </p>
          )}
        </div>

        <Link
          to="/profile"
          className="btn-gold-outline self-start sm:self-auto"
        >
          Change district
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-xl border border-[#2C4A3C] bg-[#1B3229]/60 p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "all"
                ? "bg-[#E8A33D] text-[#12241D]"
                : "text-[#F3EFE2]/70 hover:text-[#F3EFE2]"
            }`}
          >
            All Products
          </button>

          <button
            type="button"
            onClick={() => setFilter("favourites")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "favourites"
                ? "bg-[#E8A33D] text-[#12241D]"
                : "text-[#F3EFE2]/70 hover:text-[#F3EFE2]"
            }`}
          >
            ♥ Favourites ({favourites.length})
          </button>
        </div>

        <p className="text-sm text-[#F3EFE2]/55">
          Sorted by estimated market price · per kg
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <p>{error}</p>
          {error.toLowerCase().includes("district") && (
            <Link
              to="/profile"
              className="mt-2 inline-block font-semibold text-[#E8A33D] underline"
            >
              Select your district
            </Link>
          )}
          <button
            type="button"
            onClick={loadData}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {notice && (
        <p role="status" className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="glass-panel rounded-2xl p-10 text-center text-[#F3EFE2]/70">
          Loading estimated prices...
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-xl font-semibold text-[#F3EFE2]">
            {filter === "favourites"
              ? "No favourite products yet"
              : "No products available"}
          </p>
          <p className="mt-2 text-sm text-[#F3EFE2]/60">
            {filter === "favourites"
              ? "Switch to All Products and press the heart on a product to save it here."
              : "Check your district and price model, then try again."}
          </p>
          {filter === "favourites" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="btn-gold-primary mt-5"
            >
              Browse all products
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product, index) => {
            const isFavourite = favourites.includes(product.item);

            return (
              <article
                key={product.item}
                className="glass-panel fade-up flex flex-col rounded-2xl p-5"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#E8A33D]">
                      {index === 0 && filter === "all"
                        ? "Lowest estimated price"
                        : "Produce"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#F3EFE2]">
                      {product.item}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavourite(product.item)}
                    disabled={busyItem === product.item}
                    aria-label={
                      isFavourite
                        ? `Remove ${product.item} from favourites`
                        : `Add ${product.item} to favourites`
                    }
                    aria-pressed={isFavourite}
                    title={
                      isFavourite
                        ? "Remove from favourites"
                        : "Add to favourites"
                    }
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xl transition disabled:opacity-50 ${
                      isFavourite
                        ? "border-[#E8A33D]/60 bg-[#E8A33D]/15 text-[#E8A33D]"
                        : "border-[#2C4A3C] text-[#F3EFE2]/60 hover:border-[#E8A33D] hover:text-[#E8A33D]"
                    }`}
                  >
                    {busyItem === product.item ? "…" : isFavourite ? "♥" : "♡"}
                  </button>
                </div>

                <div className="mb-4 rounded-xl border border-[#E8A33D]/25 bg-[#E8A33D]/5 p-4">
                  <p className="text-xs text-[#F3EFE2]/60">
                    Estimated market price
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#E8A33D]">
                    {formatPrice(product.market_price)}
                  </p>
                  <p className="mt-1 text-xs text-[#F3EFE2]/55">
                    per kilogram
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#2C4A3C] pt-4">
                  <div>
                    <p className="text-xs text-[#F3EFE2]/55">
                      Estimated wholesale
                    </p>
                    <p className="mt-1 font-semibold text-[#F3EFE2]">
                      {formatPrice(product.wholesale_price)}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#2C4A3C] px-3 py-1 text-xs text-[#F3EFE2]/65">
                    LKR / kg
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {priceNote && (
        <p className="mt-8 rounded-xl border border-[#2C4A3C] p-4 text-sm text-[#F3EFE2]/55">
          Note: {priceNote}
        </p>
      )}
    </main>
  );
}
