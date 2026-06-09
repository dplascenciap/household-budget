import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS } from '../data/budgets'

function fmt(v) { return `$${v.toLocaleString('en-CA', { minimumFractionDigits: 0 })}` }

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:'.85rem', boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}>
      <strong>{name}</strong><br />{fmt(value)}
    </div>
  )
}

export default function CategoryChart({ expenses }) {
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
      <div className="card-title">Spending by Category</div>

      {/* Donut — legend removed from inside, no more cropping */}
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

      {/* Custom 2-column legend below the chart */}
      <div className="chart-legend">
        {data.map(item => (
          <div key={item.name} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: item.color }} />
            <span className="chart-legend-name">{item.name}</span>
            <span className="chart-legend-value">{fmt(item.value)} · {item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
