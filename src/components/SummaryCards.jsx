function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function SummaryCards({ totalSpent, totalBudget }) {
  const remaining = totalBudget - totalSpent
  const pct       = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const over      = totalSpent > totalBudget

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div className="label">Monthly Budget</div>
        <div className="value">{fmt(totalBudget)}</div>
      </div>
      <div className="summary-card">
        <div className="label">Spent So Far</div>
        <div className="value spent">{fmt(totalSpent)}</div>
      </div>
      <div className="summary-card">
        <div className="label">{over ? 'Over Budget' : 'Remaining'}</div>
        <div className={`value ${over ? 'over' : 'left'}`}>{over ? '-' : ''}{fmt(remaining)}</div>
      </div>
      <div className="summary-card">
        <div className="label">Budget Used</div>
        <div className={`value pct ${pct >= 100 ? 'over' : pct >= 80 ? 'spent' : 'left'}`}>
          {pct.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
