// Monthly budget targets — v1.2 restructure
// Edit here and commit to update budget targets.

export const CATEGORIES = [
  'Rent',
  'Housing',
  'Transportation',
  'Groceries',
  'Dining Out',
  'Baby & Family',
  'Personal Care & Health',
  'Shopping & Household',
  'Mexico Support',
  'Subscriptions',
  'Fixed Bills',
  'KOHO Savings',
  'Government & Legal',
  'Emergency / Unexpected',
  'Other',
]

// 0 = unbudgeted (irregular, unexpected). These show as "Unbudgeted" in the UI.
export const MONTHLY_BUDGET = {
  'Rent':                   2680,   // landlord cheque
  'Housing':                 115,   // utilities $91 + rent insurance (Belair) $24.14
  'Transportation':          590,   // car insurance (Belair) $172.29 + gas $188 + parking $70 + transit $120 + car wash $40
  'Groceries':               900,
  'Dining Out':              550,
  'Baby & Family':           371,
  'Personal Care & Health':  315,
  'Shopping & Household':    198,
  'Mexico Support':          154,
  'Subscriptions':            70,   // Spotify $20 + Prime $11 + Grammarly $17 + CodeScreen $17 + Nintendo avg $11 (KOHO plan now free)
  'Fixed Bills':             792,   // car loan $604 + RBC insurance $40 + Bell $76 + Fido $72
  'KOHO Savings':           1777,   // Moving Fund + Travel + Taxes + Emergency + Bbud
  'Government & Legal':        0,   // unbudgeted — immigration, legal fees, related travel
  'Emergency / Unexpected':    0,   // unbudgeted — one-off unexpected expenses
  'Other':                    75,
}

// Total budget — excludes unbudgeted (0) categories
export const TOTAL_BUDGET = Object.entries(MONTHLY_BUDGET)
  .filter(([, v]) => v > 0)
  .reduce((s, [, v]) => s + v, 0)

// Categories excluded from the Weekly Health Check
// (monthly fixed costs that don't make sense on a weekly basis)
export const WEEKLY_EXCLUDE = new Set([
  'Rent',
  'Fixed Bills',
  'KOHO Savings',
  'Government & Legal',
  'Emergency / Unexpected',
  'Groceries',  // bulk buying (Costco) makes week-to-week comparison misleading
])

export const CATEGORY_COLORS = {
  'Rent':                   '#0f172a',
  'Housing':                '#1e3a5f',
  'Transportation':         '#2563eb',
  'Groceries':              '#16a34a',
  'Dining Out':             '#dc2626',
  'Baby & Family':          '#7c3aed',
  'Personal Care & Health': '#db2777',
  'Shopping & Household':   '#d97706',
  'Mexico Support':         '#0891b2',
  'Subscriptions':          '#4f46e5',
  'Fixed Bills':            '#64748b',
  'KOHO Savings':           '#059669',
  'Government & Legal':     '#b45309',
  'Emergency / Unexpected': '#9f1239',
  'Other':                  '#94a3b8',
}
