import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { TOTAL_BUDGET } from '../data/budgets'

function daysInMonth(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function buildData(expenses, month) {
  const total = daysInMonth(month)

  // Sum expenses per day number
  const byDay = {}
  expenses.forEach(e => {
    const day = parseInt(e.date.split('-')[2], 10)
    byDay[day] = (byDay[day] || 0) + e.amount
  })

  // Build cumulative array — flat on days with no spend
  let cumulative = 0
  return Array.from({ length: total }, (_, i) => {
    const day = i + 1
    cumulative += byDay[day] || 0
    return { day, spent: Math.round(cumulative * 100) / 100 }
  })
}

const fmtY = v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
const fmtFull = n => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2 })

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 8, padding: '8px 12px',
      fontSize: '.83rem', boxShadow: '0 2px 8px rgba(0,0,0,.1)',
    }}>
      <strong>Day {label}</strong><br />
      Total so far: {fmtFull(payload[0].value)}
    </div>
  )
}

export default function DailySpendChart({ expenses, month }) {
  const data    = buildData(expenses, month)
  const hasData = expenses.length > 0

  return (
    <div className="card chart-card">
      <div className="card-title">Daily Cumulative Spending</div>
      {!hasData ? (
        <div className="empty-state">No expenses this month yet.</div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtY}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={TOTAL_BUDGET}
                stroke="#dc2626"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: 'Budget limit', position: 'insideTopRight', fontSize: 10, fill: '#dc2626', dy: -4 }}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#spendGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
