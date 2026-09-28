# Household Budget App — Developer Guide

> This guide is the single source of truth for any developer or AI assistant picking up this project.
> It covers the full tech stack, project structure, every feature, and how to make common changes.
> Last updated: 2026-09-27 · Current version: v1.7.1

---

## 1. What This App Is

A real-time household expense tracker for **David Plascencia** and **Miranda Frisbee** (Toronto, ON, Canada). They track monthly spending against a fixed budget, broken down by category. Both users share one household account and see the same data in real time.

**Live URL:** https://household-budget-jade.vercel.app  
**GitHub:** https://github.com/dplascenciap/household-budget (private)  
**Household ID in Firestore:** `frisbee-plascencia`

---

## 2. Tech Stack

| Layer       | Technology                          | Notes |
|-------------|-------------------------------------|-------|
| Frontend    | Vite + React 18 (JavaScript, no TypeScript) | SPA, no SSR |
| Styling     | Plain CSS (`src/App.css`) with CSS custom properties | No Tailwind, no CSS modules |
| Charts      | Recharts 2.x                        | Donut + area charts |
| Database    | Firebase Firestore (NoSQL)          | Real-time listeners via `onSnapshot` |
| Auth        | Firebase Authentication             | Google Sign-In only; 2 whitelisted emails |
| Hosting     | Vercel (free tier)                  | Auto-deploys on push to `main` |
| Node.js     | v18.13 (Windows dev machine)        | `sharp` must be `^0.32.6` — latest sharp breaks on Node 18.13 |

---

## 3. Project Structure

```
Budget/
├── src/
│   ├── App.jsx                    # Root component: routing, auth gate, sign-out
│   ├── App.css                    # All styles — single global file
│   ├── main.jsx                   # Vite entry point
│   ├── firebase/
│   │   ├── config.js              # Firebase app init + Firestore db export
│   │   └── db.js                  # All Firestore read/write functions
│   ├── data/
│   │   └── budgets.js             # CATEGORIES, CARDS, MONTHLY_BUDGET, colors — edit here to change targets
│   └── components/
│       ├── Header.jsx             # Top bar: app name + version + user + sign out
│       ├── BottomNav.jsx          # Fixed bottom navigation (Dashboard only for now)
│       ├── Login.jsx              # Google sign-in screen
│       ├── Dashboard.jsx          # Main page: assembles all dashboard components
│       ├── SummaryCards.jsx       # Top stat cards: Spent / Remaining / Transactions
│       ├── MonthSelector.jsx      # ‹ Month › navigator, allows past + up to 12 months ahead
│       ├── MonthProgress.jsx      # Thin progress bar showing day X of Y in current month
│       ├── ChartPanel.jsx         # Tab switcher: By Category donut | Daily Trend
│       ├── CategoryChart.jsx      # Donut chart (spending by category) with tap-to-highlight
│       ├── DailySpendChart.jsx    # Cumulative area chart (daily spend vs budget)
│       ├── BudgetProgress.jsx     # Per-category progress bars; links to CategoryDetail
│       ├── ExpenseList.jsx        # Transaction list with filter panel + CSV export trigger
│       ├── ExportModal.jsx        # CSV export: month range picker + download
│       ├── ExpenseForm.jsx        # Add / Edit expense modal (amount, category, card, store, notes, date)
│       ├── CategoryDetail.jsx     # Drill-down page for one category: stats + donut by store
│       ├── ConfirmDialog.jsx      # Generic "are you sure?" modal (used for delete)
│       ├── ScrollToTop.jsx        # Scrolls to top on route change (fixes Android scroll position)
│       └── WeeklyCheck.jsx        # Weekly spend view (currently removed from nav, code kept)
├── public/
│   ├── manifest.json              # PWA manifest (name, icons, display: standalone)
│   ├── apple-touch-icon.png       # 180×180 — home screen icon on iPhone
│   ├── icon-192.png               # Android home screen icon
│   ├── icon-512.png               # Android splash icon
│   └── favicon.png                # Browser tab icon
├── project_description/
│   └── DEVELOPER_GUIDE.md        # This file
├── .env                           # Firebase config keys (gitignored — never commit)
├── .gitignore                     # Includes: node_modules, dist, .env, serviceAccount.json
├── vercel.json                    # SPA rewrite + Firebase auth proxy
├── vite.config.js                 # Vite config (React plugin)
├── firestore.rules                # Firestore security rules (paste into Firebase Console)
├── Budget_CLAUDE.md               # Project briefing template (partially filled)
└── README.md                      # Changelog (v1.0 → current)
```

---

## 4. Environment Variables

Stored in `.env` locally and in Vercel dashboard for production. Never commit these.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=household-budget-jade.vercel.app   ← must be Vercel domain, not firebaseapp.com
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**Important:** `VITE_FIREBASE_AUTH_DOMAIN` must be the Vercel domain (not `*.firebaseapp.com`). This is required for Google Sign-In to work on iOS Safari due to cross-origin storage partitioning. The `vercel.json` file proxies `/__/auth/*` to Firebase to make this work.

---

## 5. Firestore Data Model

### Collection path
```
households/{HOUSEHOLD_ID}/expenses/{expenseId}
```
`HOUSEHOLD_ID` is hardcoded as `frisbee-plascencia` in `src/firebase/config.js`.

### Expense document fields
```js
{
  amount:      number,      // positive = expense, negative = refund
  category:    string,      // must match a value in CATEGORIES (budgets.js)
  storeName:   string,      // primary label shown in UI (e.g. "Farm Boy")
  description: string,      // optional notes
  date:        string,      // "YYYY-MM-DD"
  month:       string,      // "YYYY-MM" — used for Firestore queries
  addedBy:     string,      // full email of the user who added it
  card:        string,      // one of CARDS array (budgets.js); default "Not Provided"
  createdAt:   Timestamp,   // Firestore server timestamp
}
```

### Meta document
```
households/{HOUSEHOLD_ID}/meta/storeNames
```
```js
{ names: string[] }   // autocomplete list for the store name field
```

### Firestore indexes
The app queries by `month` (equality) and `date` (range). No composite indexes are required — single-field indexes are created automatically by Firestore.

---

## 6. Authentication

- **Provider:** Google Sign-In only
- **Whitelisted users:** `dplascenciap@gmail.com` and `miranda.frisbee@gmail.com`
- **Where the whitelist is enforced:** `firestore.rules` (server-side) + `App.jsx` (client-side sign-out if email not in list)
- **Mobile sign-in:** Uses `signInWithRedirect` on mobile (detected via `navigator.userAgent`), `signInWithPopup` on desktop. This is required for WhatsApp in-app browser and other restricted mobile browsers.
- **iOS fix:** `authDomain` is set to the Vercel domain. `vercel.json` proxies `/__/auth/*` to `https://sugg-household-budget.firebaseapp.com/__/auth/*`.

---

## 7. How to Run Locally

```bash
cd "C:\Users\dplas\Desktop\Projects\Personal\Budget"
npm install
npm run dev
```

Open http://localhost:5173

**To build for production:**
```bash
npm run build
```
Output goes to `dist/`. Vercel runs this automatically on deploy.

---

## 8. How to Deploy

Deployment is automatic: push to `main` → Vercel builds and deploys.

```bash
git add <files>
git commit -m "your message"
git push
```

Vercel is connected to the GitHub repo. No manual deploy command needed.

**After adding a new environment variable:** Go to Vercel dashboard → Project → Settings → Environment Variables → add it there too. Then redeploy.

---

## 9. Budget Targets

All budget targets live in **`src/data/budgets.js`**. This is the only file you need to edit to change monthly targets.

```js
export const MONTHLY_BUDGET = {
  'Rent':                         2780,   // new lease July 2026–June 2027: $2,630 + $50 increase + $100 locker
  'Transportation':                590,
  'Groceries':                     900,
  'Dining Out':                    550,
  'Baby & Family':                 371,
  'Personal Care & Health':        200,
  'Shopping & Household':          198,
  'Mexico Support':                154,
  'Subscriptions':                  70,
  'Fixed Expenses + Utilities':    907,
  'KOHO Savings':                 3680,
  'Emergency / Unexpected':          0,   // 0 = unbudgeted (shown as "Unbudgeted" in UI)
  'Other':                           0,   // 0 = unbudgeted
}
```

**To change a budget target:** Edit the number next to the category name, save, commit, and push. Vercel redeploys automatically. No database changes needed.

**To add a new category:**
1. Add it to `CATEGORIES` array
2. Add it to `MONTHLY_BUDGET` (use `0` if unbudgeted)
3. Add a hex color to `CATEGORY_COLORS`
4. Commit and push

**Cards list** (shown in expense form and filter):
```js
export const CARDS = ['AMEX', 'Costco CIBC', 'TD David', 'TD Miranda', 'Not Provided']
```
To add a card, add a string to this array.

---

## 10. Features

### 10.1 Dashboard

The main screen (`/`). Composed of:
- **Month selector** — navigate backward (any past month) or forward (up to 12 months ahead). Future months are useful for pre-entering known expenses like rent.
- **Month progress bar** — thin bar showing "Day X of Y · Z% elapsed". Only shown for the current month.
- **Summary cards** — Spent / Remaining / Transactions for the selected month.
- **Chart panel** — two tabs:
  - *By Category* — donut chart of spending by category. Has a "Hide Rent" toggle (rent is large and distorts the visual). Tap a slice to highlight it; tap the center or active legend item to reset.
  - *Daily Trend* — cumulative area chart, day by day vs the total monthly budget line.
- **Budget progress bars** — one row per category. Shows amount spent vs target, colored bar, over-budget in red. Clicking a row navigates to the Category Detail page for that category and month.
- **Recent Transactions** — full list of expenses for the selected month, with filter, edit, delete, and CSV export.

### 10.2 Add Expense (FAB)

The `+` button (bottom-right, above the nav bar) opens the expense form. Fields:

| Field | Notes |
|-------|-------|
| Amount | Positive number |
| Expense / Refund toggle | Refund makes the amount negative; shown in green in the list |
| Category | Dropdown from `CATEGORIES` in budgets.js |
| Card | Pill selector from `CARDS` in budgets.js |
| Store Name | Text field with autocomplete from Firestore `meta/storeNames` |
| Notes | Optional free text |
| Date | Defaults to today; can be changed |

Autocomplete: as you type in Store Name, suggestions appear from the global store names list stored in Firestore. New names are added to this list automatically on save.

### 10.3 Edit Expense

Tap the ✏️ icon on any transaction row. Opens the same form pre-filled with existing values. All fields are editable.

### 10.4 Delete Expense

Tap the trash icon on any transaction row. A confirmation dialog appears before deletion.

### 10.5 Filter Panel

In Recent Transactions, tap the 🔍 Filter button to open the filter panel. Filters:

- **Card** — multi-select pills (AMEX, Costco CIBC, TD David, TD Miranda, Not Provided)
- **Category** — multi-select pills; only shows categories that have at least one expense this month, colored in their category color
- **Search** — text search across store name, notes, and category
- **Min / Max amount** — filters by absolute value of amount
- **From / To date** — date range filter

When any filter is active:
- The header shows "X of Y transactions · net $Z" (net = expenses minus refunds)
- The filter button shows "Filtered" in orange
- A "✕ Clear" button appears in the filter panel

**Implementation note (for reference):**
The filter total is computed in `ExpenseList.jsx`:
```js
const filteredNet = filtered.reduce((s, e) => s + e.amount, 0)
```
It is displayed in the `filter-summary-row` div at the bottom of the filter panel. Net is green when negative (net refund). CSS class is `.filter-summary-total` in `App.css`.

### 10.6 CSV Export

Tap the CSV button in the Recent Transactions header. A modal lets you choose a month range (January 2026 to current month). Active filters are applied. The downloaded file includes:
- All matching transactions sorted by date descending
- Columns: Date, Store Name, Notes, Category, Card, Amount, Type, Added By
- A summary section at the bottom with totals by category and a grand total

### 10.7 Category Detail Page

URL: `/category/{categoryName}?month=YYYY-MM`

Reached by tapping any category row in the Budget Progress section. Shows:
- Stats: Spent / Over By or Under By / Transactions
- Month navigator (same as dashboard)
- Donut chart breaking down spending by store name — **no cap on number of stores shown** (all stores always visible)
- Legend with `$` / `%` / `$+%` toggle
- Full transaction list for that category and month, with edit and delete

The `?month=YYYY-MM` query param ensures the correct month is pre-loaded when navigating from a past month on the dashboard.

### 10.8 PWA (Add to Home Screen)

The app has a web manifest and icons. When added to the home screen:
- Shows a custom house icon (orange roof, cream walls, blue windows)
- Launches in standalone mode (no browser chrome)
- iOS: requires iOS 16.4+ for push notifications (not yet implemented)
- Android: works as a full PWA

### 10.9 Legend Mode Toggle

In both the dashboard donut chart and category detail donut chart, a `$` / `%` / `$+%` pill toggle controls what the legend shows. Preference is saved in `localStorage` and shared between both views.

---

## 11. Common Changes

### Change a monthly budget target
Edit `src/data/budgets.js` → `MONTHLY_BUDGET`. Change the number. Commit and push.

### Add a new expense card
Edit `src/data/budgets.js` → `CARDS` array. Add the card name as a string. Commit and push.

### Add a new budget category
1. `CATEGORIES` array — add the name
2. `MONTHLY_BUDGET` — add `'Name': amount` (use `0` for unbudgeted)
3. `CATEGORY_COLORS` — add `'Name': '#hexcolor'`
4. Commit and push

### Rename a category (with existing data)
Renaming in `budgets.js` only affects new entries. Existing Firestore documents still have the old category name. You must either:
- Write a migration script (Node.js with `firebase-admin`) to update existing documents, OR
- Accept that old data shows under the old name and new data under the new name

### Run a Firestore migration script
1. Get `serviceAccount.json` from Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Place it in the project root (it is gitignored)
3. Write a `.mjs` script using `firebase-admin`:
```js
import admin from 'firebase-admin'
import { readFileSync } from 'fs'
const sa = JSON.parse(readFileSync('./serviceAccount.json'))
admin.initializeApp({ credential: admin.credential.cert(sa) })
const db = admin.firestore()
// ... your migration logic
```
4. Run: `node migrate-yourscript.mjs`
5. **Delete `serviceAccount.json` immediately after.** Never commit it.

### Update the version label
Edit `src/components/Header.jsx` → change the version string in `<span>Plascencia-Frisbee vX.X</span>`.

---

## 12. Key Decisions and Constraints

- **Single CSS file (`App.css`):** All styles in one file for simplicity. No CSS modules, no Tailwind.
- **No TypeScript:** Plain JavaScript. Kept simple intentionally.
- **No backend:** The app is a static SPA. All data logic goes through Firebase client SDK directly from the browser.
- **Vercel free tier:** Must stay within free tier. No long-running servers, no paid Vercel features.
- **`authDomain` must be the Vercel domain:** If you ever move to a different hosting domain, update `VITE_FIREBASE_AUTH_DOMAIN` and add the new domain to Firebase Console → Authentication → Authorized Domains.
- **`sharp@0.32.6` not latest:** The dev machine runs Node 18.13. Latest sharp requires a newer Node. Do not upgrade sharp without first upgrading Node.
- **No `serviceAccount.json` in git:** This file grants full Firebase admin access. It is in `.gitignore`. If accidentally committed, rotate the service account key immediately in Firebase Console and use `git filter-repo` or BFG to scrub the history.
- **Recharts Tooltip removed from donut charts:** The hover-based Tooltip did not fire reliably on first tap on iOS and Android. Replaced with an `onClick` handler + `activeIdx` state. First tap always works on all devices.
- **`signInWithRedirect` on mobile:** `signInWithPopup` fails in WhatsApp and some iOS in-app browsers. Mobile is detected via `navigator.userAgent` and redirected instead.

---

## 13. What Was Tried and Did Not Work

- **Recharts `<Tooltip>` on donut charts** — required two taps on mobile (hover fires differently on touch screens). Replaced with `onClick` on each `<Cell>`.
- **`isAnimationActive={false}` on Pie** — caused a "select whole chart" behavior on first tap in some cases. Removed; `touchAction: manipulation` on the wrapper handles tap delay instead.
- **`authDomain: firebaseapp.com`** — caused `redirect_uri_mismatch` on iOS Safari due to cross-origin storage partitioning in WebKit. Must use the Vercel domain.
- **Browser Notification API with `setTimeout`** — does not persist when the browser or tab is closed. Not a real reminder system.
- **SVG icon for Refund badge** — rendering was inconsistent across platforms. Removed; plain text "Refund" green pill badge is used instead.
- **Position: fixed bottom nav with `height: 100vh`** — caused the nav bar to disappear in PWA standalone mode on iOS and overlap content in Chrome on iPhone. Rebuilt with flex layout and `env(safe-area-inset-bottom)`.

---

## 14. Pending / Future Work

### Near term (v1.8)
- Complete release notes for v1.7.1 in README.md

### Backlog
- **Budget Settings UI** — edit monthly targets from within the app without touching code
- **Smart Link to Claude.ai** — a button that opens Claude with the current month's CSV pre-loaded for financial review
- **Push notifications** — daily 9 PM reminder to log expenses (requires FCM + service worker + Vercel Cron; see Budget_CLAUDE.md for full breakdown)
- **Recurring expenses** — mark an expense as recurring so it pre-populates each month
- **Month-over-month comparison** — chart or table comparing this month vs last month by category
- **CSV / PDF export for tax records** — year-end summary export
- **Budget alerts** — notification or visual indicator when a category hits 80% or 100% of budget

### Financial notes (not code)
- **Kia loan:** Make ~$6,650 lump sum payment in October 2026 from accumulated KOHO savings, then switch to direct bi-weekly extra principal payments (9.24% interest — direct payments beat KOHO savings rate)
- **August 2026:** Reduce Moving Fund KOHO contributions to ~$800/month to absorb ~$3,000 income gap from Miranda's work benefit ending
- **Miranda returns from leave:** January 25, 2027 — ramp up Moving Fund aggressively to reach $20,000 target by May 2027
- **Childcare:** Get on Toronto daycare waitlists immediately (12–18 month wait for infant spots)
- **Rent:** $2,780/month, lease valid July 2026 – June 2027 ($2,630 base + $50 increase + $100 locker)

---

## 15. KOHO Savings Breakdown (reference)

The `KOHO Savings` budget category represents semi-monthly transfers to KOHO savings goals. Current targets (as of July 2026):

| Goal | Monthly |
|------|---------|
| Baby Fund | $750 |
| Travel | $571 |
| Taxes | $261 |
| Moving Fund | $1,429 |
| Kia (paused) | $669 |
| **Total** | **$3,680** |

The Kia goal is listed but effectively paused — funds accumulated there will be used for the October lump sum, then the goal will be wound down.

---

*End of guide. Update this document whenever a new feature is added or a key decision changes.*
