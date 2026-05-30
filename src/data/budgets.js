// Proposed monthly budget targets (from financial analysis, May 2026)
// Update these numbers here as your situation changes.

export const CATEGORIES = [
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
  'Other',
]

export const MONTHLY_BUDGET = {
  'Housing':                2771,
  'Transportation':         1152,
  'Groceries':               900,
  'Dining Out':              550,
  'Baby & Family':           371,
  'Personal Care & Health':  315,
  'Shopping & Household':    198,
  'Mexico Support':          154,
  'Subscriptions':            92,
  'Fixed Bills':             276,
  'KOHO Savings':           1777,
  'Other':                    75,
}

export const TOTAL_BUDGET = Object.values(MONTHLY_BUDGET).reduce((s, v) => s + v, 0)

// One color per category — used in charts and badges
export const CATEGORY_COLORS = {
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
  'Other':                  '#94a3b8',
}
