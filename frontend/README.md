# Dambulla produce intelligence — frontend

React + Vite + Tailwind frontend for the two backend endpoints:
`POST /api/predict-price` and `POST /api/predict-freshness`.

## Setup

```bash
npm install
npm run dev
```

Runs on http://localhost:5173. The backend must be running on
http://localhost:8000 (see `src/api.js` to change this) with the CORS fix
from `backend-fixes.zip` applied, or requests will be blocked by the browser.

## Before you use this for real

`src/components/PriceOracle.jsx` has placeholder dropdown values
(`ITEMS`, `REGION_TYPES`, `SEASONS`, `SUPPLY_LEVELS`, `DEMAND_LEVELS`) — I
guessed at plausible ones since the real category strings live in your
`model_columns.pkl`, not in any code I could see. Two ways to get the real
list:

1. On the backend, run `python -c "import joblib; print(joblib.load('app/models/model_columns.pkl'))"`
   and read off the `Item_*`, `Region_Type_*`, etc. column suffixes.
2. Or just submit a wrong value once — the fixed backend now returns a 422
   listing the exact valid options for that field.

Then update the arrays at the top of `PriceOracle.jsx` to match exactly.

## Structure

```
src/
  api.js                       fetch wrappers + API_BASE
  App.jsx                      shell + stall (tab) switcher
  components/PriceOracle.jsx   price prediction form
  components/FreshnessCheck.jsx image upload + grading
  index.css                    tokens, stamp animation
```
