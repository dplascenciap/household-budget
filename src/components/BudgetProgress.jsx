import { CATEGORIES, MONTHLY_BUDGET, CATEGORY_COLORS } from '../data/budgets'

function fmt(n) { return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 0 }) }

export default function BudgetProgress({ expenses }) {
  // Sum spent per category
  const spent = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  return (
    <div className="card">
      <div className="card-title">Budget Progress</div>
      <div className="progress-list">
        {CATEGORIES.map(cat => {
          const budget  = MONTHLY_BUDGET[cat] || 0
          const catSpent = spent[cat] || 0
          const pct     = budget > 0 ? Math.min((catSpent / budget) * 100, 100) : 0
          const status  = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'ok'

          return (
            <div key={cat} className="progress-item">
              <div className="progress-header">
                <span className="progress-name">
                  <span className="cat-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                  {cat}
                </span>
                <span className="progress-amounts">
                  <strong>{fmt(catSpent)}</strong> / {fmt(budget)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${status}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
