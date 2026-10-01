"""
Static reference data for Sri Lanka's 25 districts, used to auto-fill
market/weather parameters for the price model when the user only picks
a district (Freshness+Price "Inspector Desk" flow), and to power the
district dropdown in the Advanced Price Prediction flow.

Distances are approximate road distances (km) from Dambulla Dedicated
Economic Centre, the country's main wholesale produce market hub.
Rainfall/temperature/humidity are approximate seasonal averages by
climate zone. These are reasonable planning-grade defaults, not
survey-grade data — replace with real figures/APIs if you have them.
"""
from typing import Dict, List, TypedDict


class DistrictInfo(TypedDict):
    district: str
    region_type: str  # "Coastal" | "DryZone" | "Mixed" | "Northern" | "Urban"
    distance: float    # km from Dambulla
    rainfall: float     # mm, seasonal avg
    temperature: float  # deg C, avg
    humidity: float      # %, avg


_DISTRICTS: Dict[str, DistrictInfo] = {
    "colombo":        {"district": "Colombo", "region_type": "Urban", "distance": 148, "rainfall": 240, "temperature": 28.5, "humidity": 79},
    "gampaha":        {"district": "Gampaha", "region_type": "Urban", "distance": 130, "rainfall": 220, "temperature": 28.0, "humidity": 78},
    "kalutara":       {"district": "Kalutara", "region_type": "Coastal", "distance": 175, "rainfall": 260, "temperature": 27.8, "humidity": 80},
    "kandy":          {"district": "Kandy", "region_type": "Mixed", "distance": 72, "rainfall": 180, "temperature": 24.5, "humidity": 74},
    "matale":         {"district": "Matale", "region_type": "Mixed", "distance": 28, "rainfall": 165, "temperature": 26.0, "humidity": 72},
    "nuwara_eliya":   {"district": "Nuwara Eliya", "region_type": "Mixed", "distance": 100, "rainfall": 200, "temperature": 16.5, "humidity": 82},
    "galle":          {"district": "Galle", "region_type": "Coastal", "distance": 230, "rainfall": 250, "temperature": 27.5, "humidity": 81},
    "matara":         {"district": "Matara", "region_type": "Coastal", "distance": 250, "rainfall": 240, "temperature": 27.5, "humidity": 80},
    "hambantota":     {"district": "Hambantota", "region_type": "DryZone", "distance": 210, "rainfall": 90, "temperature": 29.0, "humidity": 70},
    "jaffna":         {"district": "Jaffna", "region_type": "Northern", "distance": 200, "rainfall": 70, "temperature": 29.5, "humidity": 71},
    "kilinochchi":    {"district": "Kilinochchi", "region_type": "Northern", "distance": 160, "rainfall": 80, "temperature": 29.0, "humidity": 72},
    "mannar":         {"district": "Mannar", "region_type": "Northern", "distance": 150, "rainfall": 75, "temperature": 29.2, "humidity": 71},
    "vavuniya":       {"district": "Vavuniya", "region_type": "Northern", "distance": 95, "rainfall": 100, "temperature": 28.8, "humidity": 70},
    "mullaitivu":     {"district": "Mullaitivu", "region_type": "Northern", "distance": 175, "rainfall": 85, "temperature": 29.0, "humidity": 72},
    "batticaloa":     {"district": "Batticaloa", "region_type": "Coastal", "distance": 195, "rainfall": 110, "temperature": 28.5, "humidity": 75},
    "ampara":         {"district": "Ampara", "region_type": "DryZone", "distance": 180, "rainfall": 105, "temperature": 28.7, "humidity": 74},
    "trincomalee":    {"district": "Trincomalee", "region_type": "Coastal", "distance": 105, "rainfall": 115, "temperature": 29.0, "humidity": 75},
    "kurunegala":     {"district": "Kurunegala", "region_type": "Mixed", "distance": 45, "rainfall": 150, "temperature": 27.0, "humidity": 73},
    "puttalam":       {"district": "Puttalam", "region_type": "Coastal", "distance": 90, "rainfall": 100, "temperature": 28.3, "humidity": 72},
    "anuradhapura":   {"district": "Anuradhapura", "region_type": "DryZone", "distance": 65, "rainfall": 110, "temperature": 28.5, "humidity": 71},
    "polonnaruwa":    {"district": "Polonnaruwa", "region_type": "DryZone", "distance": 40, "rainfall": 105, "temperature": 28.8, "humidity": 72},
    "badulla":        {"district": "Badulla", "region_type": "Mixed", "distance": 105, "rainfall": 170, "temperature": 22.5, "humidity": 76},
    "monaragala":     {"district": "Monaragala", "region_type": "DryZone", "distance": 135, "rainfall": 120, "temperature": 27.0, "humidity": 73},
    "ratnapura":      {"district": "Ratnapura", "region_type": "Mixed", "distance": 150, "rainfall": 280, "temperature": 27.0, "humidity": 82},
    "kegalle":        {"district": "Kegalle", "region_type": "Mixed", "distance": 95, "rainfall": 230, "temperature": 27.2, "humidity": 79},
}

DISTRICT_NAMES: List[str] = [d["district"] for d in _DISTRICTS.values()]


def _normalize(name: str) -> str:
    return name.strip().lower().replace(" ", "_").replace("-", "_")


def get_district_defaults(district: str) -> DistrictInfo:
    key = _normalize(district)
    info = _DISTRICTS.get(key)
    if info is None:
        raise ValueError(
            f"Unknown district '{district}'. Expected one of: {DISTRICT_NAMES}"
        )
    return info
