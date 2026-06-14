// Monthly budget targets — v1.6
// Edit here and commit to update budget targets.

export const CATEGORIES = [
  'Rent',
  'Transportation',
  'Groceries',
  'Dining Out',
  'Baby & Family',
  'Personal Care & Health',
  'Shopping & Household',
  'Mexico Support',
  'Subscriptions',
  'Fixed Expenses + Utilities',
  'KOHO Savings',
  'Emergency / Unexpected',
  'Other',
]

// 0 = unbudgeted (irregular). These show as "Unbudgeted" in the UI.
export const MONTHLY_BUDGET = {
  'Rent':                         2680,
  'Transportation':                590,   // car insurance $172.29 + gas $188 + parking $70 + transit $120 + car wash $40
  'Groceries':                     900,
  'Dining Out':                    550,
  'Baby & Family':                 371,
  'Personal Care & Health':        315,
  'Shopping & Household':          198,
  'Mexico Support':                154,
  'Subscriptions':                  70,   // Spotify $20 + Prime $11 + Grammarly $17 + CodeScreen $17 + Nintendo avg $11
  'Fixed Expenses + Utilities':    907,   // car loan $604 + RBC $40 + Bell $76 + Fido $72 + utilities $91 + rent insurance $24
  'KOHO Savings':                 1777,
  'Emergency / Unexpected':          0,   // unbudgeted
  'Other':                           0,   // unbudgeted — replaces Government & Legal
}

// Total budget — excludes unbudgeted (0) categories
export const TOTAL_BUDGET = Object.entries(MONTHLY_BUDGET)
  .filter(([, v]) => v > 0)
  .reduce((s, [, v]) => s + v, 0)

// Categories excluded from the Weekly Health Check
export const WEEKLY_EXCLUDE = new Set([
  'Rent',
  'Fixed Expenses + Utilities',
  'KOHO Savings',
  'Emergency / Unexpected',
  'Groceries',
])

export const CATEGORY_COLORS = {
  'Rent':                         '#0f172a',
  'Transportation':               '#2563eb',
  'Groceries':                    '#16a34a',
  'Dining Out':                   '#dc2626',
  'Baby & Family':                '#7c3aed',
  'Personal Care & Health':       '#db2777',
  'Shopping & Household':         '#d97706',
  'Mexico Support':               '#0891b2',
  'Subscriptions':                '#4f46e5',
  'Fixed Expenses + Utilities':   '#64748b',
  'KOHO Savings':                 '#059669',
  'Emergency / Unexpected':       '#9f1239',
  'Other':                        '#b45309',   // warm amber — stands out for unexpected costs
}
