import { useEffect, useState } from 'react'
import { subscribeToWeekExpenses } from '../firebase/db'
import { CATEGORIES, MONTHLY_BUDGET, CATEGORY_COLORS, WEEKLY_EXCLUDE } from '../data/budgets'

// Weekly budget = monthly / (52/12)
const WEEKLY_FACTOR = 12 / 52

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getWeekBounds(offsetWeeks) {
  const now   = new Date()
  const day   = now.getDay() // 0=Sun
  const diff  = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offsetWeeks * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function fmtDateShort(d) {
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function fmtMoney(n) {
  return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 0 })
}

function statusClass(pct) {
  if (pct >= 100) return 'over'
  if (pct >= 80)  return 'warning'
  return 'ok'
}

function statusLabel(pct) {
  if (pct >= 100) return '🔴 Over'
  if (pct >= 80)  return '🟡 Caution'
  if (pct >= 50)  return '🟢 On track'
  return '🟢 Good'
}

export default function WeeklyCheck() {
  const [offset, setOffset]     = useState(0)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)

  const { monday, sunday } = getWeekBounds(offset)
  const mondayStr = toDateStr(monday)
  const sundayStr = toDateStr(sunday)

  // Detect if week spans two months
  const spansTwoMonths = monday.getMonth() !== sunday.getMonth()
  const weekLabel = spansTwoMonths
    ? `${fmtDateShort(monday)} – ${fmtDateShort(sunday)} (spans ${monday.toLocaleString('en-CA',{month:'short'})}–${sunday.toLocaleString('en-CA',{month:'short'})})`
    : `${fmtDateShort(monday)} – ${fmtDateShort(sunday)}`

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToWeekExpenses(mondayStr, sundayStr, data => {
      setExpenses(data)
      setLoading(false)
    })
    return () => unsub()
  }, [mondayStr, sundayStr])

  // Per-category weekly spend
  const spentByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const weeklyCategories = CATEGORIES.filter(cat =>
    !WEEKLY_EXCLUDE.has(cat) && MONTHLY_BUDGET[cat] > 0
  )

  const totalWeeklyBudget = weeklyCategories.reduce((s, cat) =>
    s + MONTHLY_BUDGET[cat] * WEEKLY_FACTOR, 0)

  const totalWeeklySpent = weeklyCategories.reduce((s, cat) =>
    s + (spentByCategory[cat] || 0), 0)

  const overallPct = totalWeeklyBudget > 0
    ? (totalWeeklySpent / totalWeeklyBudget) * 100
    : 0

  return (
    <div>
      {/* Week navigator */}
      <div className="month-selector" style={{marginBottom:8}}>
        <button className="btn-month" onClick={() => setOffset(o => o - 1)}>‹</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontWeight:700,fontSize:'1rem'}}>Week of</div>
          <div style={{fontSize:'.82rem',color:'#64748b'}}>{weekLabel}</div>
        </div>
        <button className="btn-month" onClick={() => setOffset(o => o + 1)}
          disabled={offset >= 0} style={{opacity: offset>=0?.3:1}}>›</button>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:48,color:'#64748b'}}>Loading…</div>
      ) : (
        <>
          {/* Overall summary */}
          <div className="summary-grid" style={{marginBottom:16}}>
            <div className="summary-card">
              <div className="label">Weekly Budget</div>
              <div className="value">{fmtMoney(totalWeeklyBudget)}</div>
            </div>
            <div className="summary-card">
              <div className="label">Spent This Week</div>
              <div className={`value ${statusClass(overallPct)}`}>{fmtMoney(totalWeeklySpent)}</div>
            </div>
            <div className="summary-card">
              <div className="label">Remaining</div>
              <div className={`value ${totalWeeklySpent > totalWeeklyBudget ? 'over' : 'left'}`}>
                {fmtMoney(Math.abs(totalWeeklyBudget - totalWeeklySpent))}
              </div>
            </div>
            <div className="summary-card">
              <div className="label">Overall</div>
              <div className={`value pct ${statusClass(overallPct)}`}>{overallPct.toFixed(0)}%</div>
            </div>
          </div>

          {/* Per-category health check */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>Category Health Check</div>
            <div className="weekly-list">
              {weeklyCategories.map(cat => {
                const weekBudget = MONTHLY_BUDGET[cat] * WEEKLY_FACTOR
                const spent      = spentByCategory[cat] || 0
                const pct        = (spent / weekBudget) * 100
                const sc         = statusClass(pct)

                return (
                  <div key={cat} className="weekly-row">
                    <div className="weekly-cat">
                      <span className="cat-dot" style={{background: CATEGORY_COLORS[cat]}} />
                      <span className="weekly-cat-name">{cat}</span>
                    </div>
                    <div className="weekly-amounts">
                      <span className={`weekly-spent ${sc}`}>{fmtMoney(spent)}</span>
                      <span className="weekly-budget-amt"> / {fmtMoney(weekBudget)}</span>
                    </div>
                    <div className="weekly-status">{statusLabel(pct)}</div>
                    <div className="progress-bar" style={{marginTop:4}}>
                      <div className={`progress-fill ${sc}`} style={{width:`${Math.min(pct,100)}%`}} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Unbudgeted spending this week */}
          {(() => {
            const unbudgeted = expenses.filter(e =>
              WEEKLY_EXCLUDE.has(e.category) || MONTHLY_BUDGET[e.category] === 0
            )
            if (!unbudgeted.length) return null
            const total = unbudgeted.reduce((s,e) => s+e.amount, 0)
            return (
              <div className="card" style={{marginTop:16}}>
                <div className="card-title" style={{marginBottom:8}}>Unbudgeted / Fixed Costs This Week</div>
                <p style={{fontSize:'.85rem',color:'#64748b',marginBottom:12}}>
                  These expenses are excluded from the weekly budget above.
                </p>
                {unbudgeted.map(e => (
                  <div key={e.id} className="expense-row">
                    <div className="expense-cat-badge" style={{background: CATEGORY_COLORS[e.category]||'#94a3b8',fontSize:'.6rem'}}>
                      {e.category.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div className="expense-info">
                      <div className="expense-desc">{e.description || e.category}</div>
                      <div className="expense-meta">{e.category}</div>
                    </div>
                    <div className="expense-amount">${e.amount.toLocaleString('en-CA',{minimumFractionDigits:2})}</div>
                  </div>
                ))}
                <div style={{textAlign:'right',fontWeight:700,fontSize:'.9rem',marginTop:8,paddingTop:8,borderTop:'1px solid #e2e8f0'}}>
                  Total: ${total.toLocaleString('en-CA',{minimumFractionDigits:2})}
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
