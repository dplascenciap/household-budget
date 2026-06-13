import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS } from '../data/budgets'

function fmt(v) { return `$${v.toLocaleString('en-CA', { minimumFractionDigits: 0 })}` }

// Persist legend display preference across sessions
function useLegendMode() {
  const [mode, setModeState] = useState(
    () => localStorage.getItem('chartLegendMode') || 'both'
  )
  function setMode(m) {
    setModeState(m)
    localStorage.setItem('chartLegendMode', m)
  }
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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const pct = payload[0].payload?.pct
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:'.85rem', boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}>
      <strong>{name}</strong><br />{fmt(value)}{pct ? ` · ${pct}%` : ''}
    </div>
  )
}

export default function CategoryChart({ expenses }) {
  const [mode, setMode] = useLegendMode()

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

  return (
    <div className="card chart-card">
      {/* Title + legend mode toggle */}
      <div className="chart-card-header">
        <div className="card-title" style={{ marginBottom: 0 }}>Spending by Category</div>
        <div className="legend-mode-toggle">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`legend-mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)}
              title={m.id === 'dollar' ? 'Show amounts' : m.id === 'pct' ? 'Show percentages' : 'Show both'}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Donut */}
      <div className="chart-wrap">
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
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {data.map(item => (
          <div key={item.name} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: item.color }} />
            <span className="chart-legend-name">{item.name}</span>
            <span className="chart-legend-value">{legendValue(item, mode)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
