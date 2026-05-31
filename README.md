# 🏠 Household Budget — Plascencia-Frisbee

A real-time household expense tracker built with Vite + React + Firebase Firestore.

---

## Changelog

### v1.1 — June 2026
- **Future months** — navigate up to 12 months ahead to enter proactive expenses (rent, fixed bills, etc.)
- **App version** — title updated to "Household Budget Plascencia-Frisbee v1.1"
- **Custom delete dialog** — replaced browser-native confirm prompt with an in-app dialog ("Household Budget says…" no more)
- **Over-budget display** — categories that exceed budget now show `$1,000 / $900 · over by $100` in red
- **Daily Trend chart** — new cumulative area chart showing spending day by day against the monthly budget limit
- **Chart tabs** — switch between "By Category" (donut) and "Daily Trend" charts with tab navigation
- **iOS Safari fix** — resolved Google sign-in redirect_uri_mismatch for iPhone users

### v1.0 — May 2026
- Initial release
- Google Sign-in authentication (whitelist: David + Miranda)
- Real-time expense tracking via Firebase Firestore
- Monthly budget targets pre-loaded from financial analysis
- Donut chart: spending by category
- Progress bars: budget vs actual per category
- Recent transactions list with delete
- Month navigation (backward)
- Responsive design — mobile + desktop

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

1. Push repo to GitHub (private)
2. Import in vercel.com, set environment variables (see `.env` for keys)
3. After deploy, add the Vercel URL to Firebase Console → Authentication → Authorized domains

## Environment variables

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN        ← set to your Vercel domain
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Firestore security rules

Only `dplascenciap@gmail.com` and `miranda.frisbee@gmail.com` can read/write.
See `firestore.rules` — paste into Firebase Console → Firestore → Rules.
