import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  const data = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
  )
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: CATEGORY_COLORS[name] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value)

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
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={230}>
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
            <Legend
              formatter={(value) => <span style={{ fontSize: '.75rem', color: '#1e293b' }}>{value}</span>}
              iconSize={8}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
