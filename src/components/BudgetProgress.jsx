import { useNavigate } from 'react-router-dom'
import { CATEGORIES, MONTHLY_BUDGET, CATEGORY_COLORS } from '../data/budgets'

function fmt(n) { return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 0 }) }

export default function BudgetProgress({ expenses, hideRent }) {
  const navigate = useNavigate()
  const spent = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const visibleCategories = hideRent
    ? CATEGORIES.filter(c => c !== 'Rent')
    : CATEGORIES

  return (
    <div className="card">
      <div className="card-title">Budget Progress — click any row for details</div>
      <div className="progress-list">
        {visibleCategories.map(cat => {
          const budget   = MONTHLY_BUDGET[cat] || 0
          const catSpent = spent[cat] || 0
          const unbudgeted = budget === 0

          // Skip unbudgeted categories with no spending
          if (unbudgeted && catSpent === 0) return null

          const over    = !unbudgeted && catSpent > budget
          const pct     = budget > 0 ? Math.min((catSpent / budget) * 100, 100) : 0
          const status  = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'ok'
          const overage = catSpent - budget

          return (
            <div
              key={cat}
              className="progress-item clickable"
              onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}
              title={`View ${cat} details`}
            >
              <div className="progress-header">
                <span className="progress-name">
                  <span className="cat-dot" style={{background: CATEGORY_COLORS[cat]}} />
                  {cat}
                  <span className="progress-arrow">›</span>
                </span>
                {unbudgeted ? (
                  <span className="progress-amounts unbudgeted">
                    <strong>{fmt(catSpent)}</strong> · Unbudgeted
                  </span>
                ) : (
                  <span className="progress-amounts" style={over ? {color:'var(--danger)'} : {}}>
                    <strong>{fmt(catSpent)}</strong> / {fmt(budget)}
                    {over && <span className="over-label"> · over by {fmt(overage)}</span>}
                  </span>
                )}
              </div>
              {!unbudgeted && (
                <div className="progress-bar">
                  <div className={`progress-fill ${status}`} style={{width:`${pct}%`}} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
