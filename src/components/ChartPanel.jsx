import { useState } from 'react'
import CategoryChart from './CategoryChart'
import DailySpendChart from './DailySpendChart'

const TABS = [
  { id: 'category', label: '🍩 By Category' },
  { id: 'daily',    label: '📈 Daily Trend'  },
]

export default function ChartPanel({ expenses, month, totalBudget }) {
  const [active, setActive] = useState('category')

  return (
    <div>
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

      {active === 'category'
        ? <CategoryChart expenses={expenses} />
        : <DailySpendChart expenses={expenses} month={month} totalBudget={totalBudget} />
      }
    </div>
  )
}
