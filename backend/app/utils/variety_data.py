"""
Variety-level / channel-level price spread for each of the 7 produce items.

WHY THIS EXISTS: the freshness CNN and the price model both only know the
item at the species level ("Banana"), not the cultivar ("Kolikuttu" vs
"Puwalu") or which shop it was bought at. This applies a static multiplier
on top of the model's single item-level price prediction, so the UI can
show "here's the likely range" without claiming to know which cultivar or
retail channel the photo represents.

CALIBRATION: every entry below is now sourced from real current market data
(Cargills/Keells/Glomark supermarket prices + Pettah/Dambulla/Narahenpita
wet-market prices, supplied by the project owner). Multiplier = variety's
real mid-range price / the item's target retail baseline used to calibrate
base_price in the training generator (see that file's docstring, item 5).

TWO DIFFERENT KINDS OF "VARIETY" ARE MIXED IN HERE -- worth keeping straight:
  - Apple, Orange, Banana, Cucumber: entries are genuine CULTIVARS (Kolikuttu
    vs Ambul vs Cavendish, Royal Gala vs Fuji, etc.) -- the fruit/vegetable
    itself differs.
  - Tomato, Potato: entries are the SAME produce at different RETAIL
    CHANNELS (Dambulla wholesale vs Pettah wet market vs Cargills
    supermarket) -- no cultivar distinction was in the source data, just
    channel-driven price spread. Labeled by channel name so this isn't
    mistaken for a cultivar breakdown.
  - Okra: only a single price range (Rs.400-600) was available, with no
    distinct varieties or channels reported -- no breakdown to show.

CAVEAT: Dambulla figures for Tomato/Potato are wholesale-market prices,
while the wholesale_price/market_price split elsewhere in this codebase
already separates trader vs. shopper prices. Applying one multiplier to
both wholesale_price and market_price here is an approximation -- the
Dambulla entry is really only meaningful against wholesale_price, and the
supermarket/wet-market entries only against market_price. Splitting that
out properly would need per-price-type multipliers instead of one shared
ratio; this hasn't been done yet.
"""
from typing import Optional, TypedDict


class VarietyEstimate(TypedDict):
    name: str
    wholesale_price: float
    market_price: float


# item -> {variety_or_channel_name: price_multiplier_relative_to_the_item's
# target retail baseline (see retrain script docstring item 5 for targets)}
ITEM_VARIETIES: dict[str, dict[str, float]] = {
    "Apple": {
        # Target baseline Rs.2000/kg (Cargills/Keells branded tier).
        "Local / General (wet market)": 0.12,   # Pettah/Narahenpita, 200-300
        "Green": 0.99,                          # 1870-2100
        "Fuji": 1.11,                           # 2210-2250
        "Royal Gala": 1.12,                     # 2000-2490
        "Red": 1.41,                            # 2770-2850
    },
    "Orange": {
        # Target baseline Rs.490/kg (Cargills Sweet Orange).
        "Local Orange": 0.49,      # 225-260, Pettah/Narahenpita
        "Sour Orange": 0.87,       # 425, Cargills
        "Sweet Orange": 1.00,      # 490, Cargills
        "Large Narang": 1.89,      # 926, Cargills
        "Imported Orange": 4.22,   # 2070, Cargills
    },
    "Banana": {
        # Target baseline Rs.350/kg.
        "Seeni": 0.63,               # ~220, Keells
        "Ambul / Sour": 0.76,        # 150-380, Pettah/Narahenpita
        "Cavendish": 0.94,           # 320-340, Cargills/Keells
        "Ambun / Anamalu": 1.60,     # 383-740, Cargills/Keells
        "Kolikuttu": 1.93,           # 670-680, Cargills/Keells
    },
    "Cucumber": {
        # Target baseline Rs.110/kg. These ARE distinct varieties, not
        # just channels -- Green/Japanese cucumber are physically
        # different, larger cultivars, not the same item at a pricier shop.
        "Standard / Local": 1.07,      # 100-135, Keells/Cargills/Glomark
        "Japanese Cucumber": 2.91,     # 320, Cargills
        "Green Cucumber": 2.99,        # 240-418, Keells/Cargills
    },
    "Tomato": {
        # Target baseline Rs.590/kg. Channel spread, not cultivar --
        # same generic tomato, different point of sale.
        "Dambulla (wholesale)": 0.53,
        "Pettah (wet market)": 0.59,
        "Narahenpita (wet market)": 0.81,
        "Cargills (supermarket)": 1.03,
        "Glomark (supermarket)": 1.11,
    },
    "Potato": {
        # Target baseline Rs.390/kg. Channel spread, all "local" potato
        # (see CAVEAT above re: Dambulla being a wholesale figure).
        "Dambulla, Local (wholesale)": 0.74,
        "Pettah, Local (wet market)": 0.88,
        "Glomark (supermarket)": 0.88,
        "Cargills (supermarket)": 1.00,
        "Narahenpita, Local (wet market)": 1.38,
    },
}


def get_variety_breakdown(
    item: str,
    wholesale_price: Optional[float],
    market_price: Optional[float],
) -> list[VarietyEstimate]:
    """
    Returns a per-variety/channel price estimate for `item`, scaling the
    model's single base prediction by each entry's multiplier. Returns an
    empty list if either base price is None (e.g. the item was rotten and
    no price was computed) or the item has no entry in ITEM_VARIETIES
    (currently: Okra, which has no sourced breakdown -- see module
    docstring).
    """
    if wholesale_price is None or market_price is None:
        return []

    varieties = ITEM_VARIETIES.get(item)
    if not varieties:
        return []

    return [
        {
            "name": name,
            "wholesale_price": round(wholesale_price * multiplier, 2),
            "market_price": round(market_price * multiplier, 2),
        }
        for name, multiplier in varieties.items()
    ]
