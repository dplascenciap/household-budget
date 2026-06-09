import { useState } from 'react'
import CategoryChart from './CategoryChart'
import DailySpendChart from './DailySpendChart'

const TABS = [
  { id: 'category', label: 'By Category' },
  { id: 'daily',    label: 'Daily Trend'  },
]

export default function ChartPanel({ expenses, month, totalBudget, hideRent, onToggleHideRent }) {
  const [active, setActive] = useState('category')

  return (
    <div>
      {/* Chart type tabs + Hide Rent toggle in same row */}
      <div className="chart-panel-header">
        <div className="chart-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`chart-tab${active === t.id ? ' active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          className={`rent-toggle-btn compact${hideRent ? ' active' : ''}`}
          onClick={onToggleHideRent}
          title={hideRent ? 'Show rent' : 'Hide rent from chart'}
        >
          🏠
        </button>
      </div>

      {hideRent && (
        <p className="rent-toggle-note" style={{ marginBottom: 8 }}>
          Rent hidden — showing discretionary spending only
        </p>
      )}

      {active === 'category'
        ? <CategoryChart expenses={expenses} />
        : <DailySpendChart expenses={expenses} month={month} totalBudget={totalBudget} />
      }
    </div>
  )
}
