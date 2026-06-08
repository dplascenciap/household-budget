# 🏠 Household Budget — Plascencia-Frisbee

A real-time household expense tracker built with Vite + React + Firebase Firestore.

---

## Changelog

### v1.3 — June 2026

#### Features
- **Transaction filter** — collapsible filter bar on the dashboard transaction list; filter by description search, amount range (min/max), and date range; shows "X of Y" count when active
- **Edit expenses** — tap ✏️ on any transaction to edit amount, category, description, or date in place
- **Refund entry** — add/edit form now has an Expense / Refund segmented toggle; refunds appear in green with a ↩ badge and reduce category spending automatically
- **Groceries renamed** — "Groceries" is now "Groceries & Household" to reflect that personal care items bought at Costco/Walmart belong here; existing data migrated
- **Hide Rent moved** — toggle now lives inside the chart card header next to the chart tabs, contextually next to what it affects
- **Nav bar always visible** — fixed iOS Chrome overlap and PWA mode disappearing nav; rebuilt on flex layout with safe-area support for iPhone home indicator

#### Bug fixes
- 🐛 **Edit and delete in Category Detail** — ✏️ and ✕ buttons now available when viewing a specific category, consistent with the main dashboard
- 🐛 **iOS Chrome nav overlap** — nav bar was covering content at bottom of screen
- 🐛 **PWA mode nav disappears** — nav would scroll off-screen when added to iPhone home screen; flex layout fixes this permanently
- 🐛 **Weekly check removed** — removed from nav bar for now; will be redesigned in a future release

---

### v1.2 — June 2026

#### Features
- **Multi-page navigation** — bottom nav bar with Dashboard and Weekly Check
- **Category drill-down** — click any budget category to see its expense breakdown and merchant donut chart
- **Weekly health check** — Mon–Sun view with per-category status; navigate to previous weeks
- **Rent toggle** — hide rent from charts/budget to see discretionary spending only
- **Budget restructured** — Rent is now its own category; car loan moved to Fixed Bills; Transportation reflects true running costs; KOHO plan removed (Miranda employee benefit); Government & Legal and Emergency / Unexpected added as unbudgeted categories
- **Kia loan** — Kia Finance confirmed extra payments apply directly to principal; recommended switching from KOHO accumulation to direct monthly extra payments
- **PWA home screen icons** — proper house icon on both Android and iPhone when added to home screen; web app manifest added
- **Donut chart legend** — moved outside the chart into a 2-column grid below; fixes mobile cropping

#### Bug fixes
- 🐛 **Back button redesign** — replaced mismatched Unicode arrow with a pill-style button and SVG chevron, consistent with the rest of the UI
- 🐛 **404 on direct URL access** — added SPA catch-all rewrite in `vercel.json` so React Router routes work correctly on Vercel
- 🐛 **Groceries excluded from Weekly Check** — bulk Costco purchases skewed the weekly comparison; Groceries is now monthly-only
- 🐛 **Whitespace trimming** — all expense fields (description, category, addedBy) are trimmed before saving; prevents duplicate merchant groupings in charts
- 🐛 **Version label** — header updated from v1.1 to v1.2
- 🐛 **Save button hidden by keyboard** — sticky Save button always visible above keyboard on both Android and iPhone; uses `dvh` units + `visualViewport` API fallback for iOS

---

### v1.1 — June 2026

#### Features
- **Future months** — navigate up to 12 months ahead to enter proactive expenses (rent, fixed bills, etc.)
- **App version** — title updated to "Household Budget Plascencia-Frisbee v1.1"
- **Custom delete dialog** — replaced browser-native confirm prompt with an in-app dialog
- **Over-budget display** — categories that exceed budget now show `$1,000 / $900 · over by $100` in red
- **Daily Trend chart** — cumulative area chart showing spending day by day against the monthly budget limit
- **Chart tabs** — switch between "By Category" (donut) and "Daily Trend" charts

#### Bug fixes
- 🐛 **iOS Safari sign-in** — resolved Google sign-in `redirect_uri_mismatch` for iPhone users
- 🐛 **WhatsApp in-app browser** — switched to `signInWithRedirect` on mobile to support sign-in from in-app browsers

---

### v1.0 — May 2026

#### Features
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
