import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS } from '../data/budgets'

function fmt(v) { return `$${v.toLocaleString('en-CA', { minimumFractionDigits: 0 })}` }

function useLegendMode() {
  const [mode, setModeState] = useState(
    () => localStorage.getItem('chartLegendMode') || 'both'
  )
  function setMode(m) { setModeState(m); localStorage.setItem('chartLegendMode', m) }
  return [mode, setMode]
}

const MODES = [
  { id: 'dollar', label: '$'   },
  { id: 'pct',    label: '%'   },
  { id: 'both',   label: '$+%' },
]

function legendValue(item, mode) {
  if (mode === 'dollar') return fmt(item.value)
  if (mode === 'pct')    return `${item.pct}%`
  return `${fmt(item.value)} · ${item.pct}%`
}

export default function CategoryChart({ expenses }) {
  const [mode, setMode]         = useLegendMode()
  const [activeIdx, setActiveIdx] = useState(null)

  const raw = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
  )
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: CATEGORY_COLORS[name] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value)

  const total = raw.reduce((s, d) => s + d.value, 0)
  const data  = raw.map(d => ({
    ...d,
    pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0',
  }))

  if (!data.length) {
    return (
      <div className="card chart-card">
        <div className="card-title">Spending by Category</div>
        <div className="empty-state">No expenses this month yet.</div>
      </div>
    )
  }

  const active = activeIdx !== null ? data[activeIdx] : null

  function handleSliceClick(_, index) {
    setActiveIdx(prev => prev === index ? null : index)
  }

  return (
    <div className="card chart-card">
      <div className="chart-card-header">
        <div className="card-title" style={{ marginBottom: 0 }}>Spending by Category</div>
        <div className="legend-mode-toggle">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`legend-mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Donut — onClick replaces hover tooltip for reliable mobile tap */}
      <div className="chart-wrap" style={{ touchAction: 'manipulation' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              onClick={handleSliceClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  opacity={activeIdx === null || activeIdx === i ? 1 : 0.45}
                  stroke={activeIdx === i ? '#fff' : 'none'}
                  strokeWidth={activeIdx === i ? 2 : 0}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tap label — shows on slice tap, replaces hover tooltip */}
      <div className="pie-tap-label" style={{ opacity: active ? 1 : 0 }}>
        {active
          ? <><strong>{active.name}</strong> · {fmt(active.value)} · {active.pct}%</>
          : <span style={{ color: 'transparent' }}>–</span>
        }
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {data.map((item, i) => (
          <div
            key={item.name}
            className="chart-legend-item"
            style={{ opacity: activeIdx === null || activeIdx === i ? 1 : 0.45, cursor: 'pointer' }}
            onClick={() => handleSliceClick(null, i)}
          >
            <span className="chart-legend-dot" style={{ background: item.color }} />
            <span className="chart-legend-name">{item.name}</span>
            <span className="chart-legend-value">{legendValue(item, mode)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
