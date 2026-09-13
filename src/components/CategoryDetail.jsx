import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { subscribeToExpenses, deleteExpense } from '../firebase/db'
import { MONTHLY_BUDGET, CATEGORY_COLORS } from '../data/budgets'
import ConfirmDialog from './ConfirmDialog'
import ExpenseForm from './ExpenseForm'

// Shared legend mode with CategoryChart via localStorage
const MODES = [
  { id: 'dollar', label: '$'   },
  { id: 'pct',    label: '%'   },
  { id: 'both',   label: '$+%' },
]
function useLegendMode() {
  const [mode, setModeState] = useState(() => localStorage.getItem('chartLegendMode') || 'both')
  function setMode(m) { setModeState(m); localStorage.setItem('chartLegendMode', m) }
  return [mode, setMode]
}
function legendValue(value, pct, mode) {
  const fmtD = '$' + Math.abs(value).toLocaleString('en-CA', { minimumFractionDigits: 0 })
  if (mode === 'dollar') return fmtD
  if (mode === 'pct')    return `${pct}%`
  return `${fmtD} · ${pct}%`
}

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']

function currentMonth() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
}

function fmt(n) { return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2 }) }
function fmtDate(s) {
  const [y,m,d] = s.split('-')
  return new Date(+y,+m-1,+d).toLocaleDateString('en-CA',{month:'short',day:'numeric'})
}

function monthLabel(month) {
  const [y,m] = month.split('-').map(Number)
  return `${MONTHS[m-1]} ${y}`
}


// Build donut data: group by description (merchant)
function buildChartData(expenses, color) {
  const groups = {}
  expenses.forEach(e => {
    const key = e.storeName?.trim() || e.description?.trim() || '(no store name)'
    groups[key] = (groups[key] || 0) + e.amount
  })
  const raw = Object.entries(groups)
    .map(([name, value]) => ({ name, value: Math.round(value*100)/100 }))
    .sort((a,b) => b.value - a.value)

  const entries = raw

  // Add percentage to each entry for tooltip
  const total = entries.reduce((s,e) => s + e.value, 0)
  return entries.map(e => ({
    ...e,
    pct: total > 0 ? ((e.value / total) * 100).toFixed(1) : '0.0',
  }))
}

const PALETTE = ['#2563eb','#16a34a','#dc2626','#7c3aed','#d97706','#0891b2','#94a3b8']

export default function CategoryDetail({ user }) {
  const { name }       = useParams()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const category   = decodeURIComponent(name)
  const color      = CATEGORY_COLORS[category] || '#94a3b8'
  const budget     = MONTHLY_BUDGET[category] || 0

  const [month, setMonth]         = useState(() => searchParams.get('month') || currentMonth())
  const [expenses, setExpenses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [editExpense, setEditExpense]     = useState(null)
  const [showAddForm, setShowAddForm]     = useState(false)
  const [mode, setMode]                   = useLegendMode()
  const [activeIdx, setActiveIdx]         = useState(null)

  async function confirmDelete() {
    await deleteExpense(pendingDelete)
    setPendingDelete(null)
  }

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToExpenses(month, all => {
      setExpenses(all.filter(e => e.category === category))
      setLoading(false)
    })
    return () => unsub()
  }, [month, category])

  const total     = expenses.reduce((s,e) => s+e.amount, 0)
  const remaining = budget - total
  const over      = budget > 0 && total > budget
  const chartData = buildChartData(expenses, color)

  function prevMonth() {
    const [y,m] = month.split('-').map(Number)
    const d = new Date(y, m-2, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  function nextMonth() {
    const [y,m] = month.split('-').map(Number)
    const now = new Date()
    const maxY = now.getFullYear(), maxM = now.getMonth()+1
    if (y > maxY || (y === maxY && m >= maxM)) return
    const d = new Date(y, m, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  const [cy,cm] = month.split('-').map(Number)
  const now = new Date()
  const atMax = cy > now.getFullYear() || (cy === now.getFullYear() && cm >= now.getMonth()+1)

  return (
    <div>
      {/* Back + title */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back
        </button>
        <div className="detail-cat-name">
          <span className="cat-dot-lg" style={{background: color}} />
          {category}
        </div>
      </div>

      {/* Month selector */}
      <div className="month-selector" style={{marginBottom:16}}>
        <button className="btn-month" onClick={prevMonth}>‹</button>
        <h2 style={{fontSize:'1rem'}}>{monthLabel(month)}</h2>
        <button className="btn-month" onClick={nextMonth} disabled={atMax} style={{opacity:atMax?.3:1}}>›</button>
      </div>

      {/* Summary */}
      <div className="detail-summary-row">
        <div className="card detail-summary-card">
          <div className="card-title">Spent</div>
          <div className="value spent">${total.toLocaleString('en-CA',{minimumFractionDigits:2})}</div>
        </div>
        <div className="card detail-summary-card">
          <div className="card-title">{budget===0 ? 'Budget' : over ? 'Over by' : 'Remaining'}</div>
          <div className={`value ${budget===0?'':''+( over?'over':'left')}`}>
            {budget === 0 ? 'Unbudgeted' : fmt(Math.abs(remaining))}
          </div>
        </div>
        <div className="card detail-summary-card">
          <div className="card-title">Transactions</div>
          <div className="value">{expenses.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : expenses.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:32,color:'#64748b'}}>
          No {category} expenses in {monthLabel(month)}.
        </div>
      ) : (
        <>
          {/* Donut chart */}
          {chartData.length > 0 && (
            <div className="card chart-card" style={{marginBottom:16}}>
              <div className="chart-card-header">
                <div className="card-title" style={{marginBottom:0}}>Breakdown by Store</div>
                <div className="legend-mode-toggle">
                  {MODES.map(m => (
                    <button key={m.id} className={`legend-mode-btn${mode===m.id?' active':''}`} onClick={() => setMode(m.id)}>{m.label}</button>
                  ))}
                </div>
              </div>
              <div
                className="chart-wrap"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                onClick={() => setActiveIdx(null)}
              >
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={2} dataKey="value"
                      isAnimationActive={false}
                      onClick={(_, index, e) => { e?.stopPropagation(); setActiveIdx(prev => prev === index ? null : index) }}
                      style={{ cursor: 'pointer' }}
                    >
                      {chartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PALETTE[i % PALETTE.length]}
                          opacity={activeIdx === null || activeIdx === i ? 1 : 0.45}
                          stroke={activeIdx === i ? '#fff' : 'none'}
                          strokeWidth={activeIdx === i ? 2 : 0}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tap label */}
              <div className="pie-tap-label" style={{ opacity: activeIdx !== null ? 1 : 0 }}>
                {activeIdx !== null && chartData[activeIdx]
                  ? <><strong>{chartData[activeIdx].name}</strong> · {fmt(chartData[activeIdx].value)} · {chartData[activeIdx].pct}%</>
                  : <span style={{ color: 'transparent' }}>–</span>
                }
              </div>

              {/* Custom legend with mode toggle */}
              <div className="chart-legend">
                {chartData.map((item, i) => {
                  const total = chartData.reduce((s,d) => s+d.value, 0)
                  const pct = total > 0 ? ((item.value/total)*100).toFixed(1) : '0.0'
                  return (
                    <div
                      key={item.name}
                      className="chart-legend-item"
                      style={{ opacity: activeIdx === null || activeIdx === i ? 1 : 0.45, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                      onClick={(e) => { e.stopPropagation(); setActiveIdx(prev => prev === i ? null : i) }}
                    >
                      <span className="chart-legend-dot" style={{background: PALETTE[i % PALETTE.length]}} />
                      <span className="chart-legend-name">{item.name}</span>
                      <span className="chart-legend-value">{legendValue(item.value, pct, mode)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Expense list */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>All Transactions</div>
            <div className="expense-items">
              {expenses.map(e => {
                const isRefund = e.amount < 0
                return (
                  <div key={e.id} className={`expense-row${isRefund ? ' refund-row' : ''}`}>
                    <div className="expense-cat-badge" style={{background:color}}>
                      {String(e.date.split('-')[2]).padStart(2,'0')}
                    </div>
                    <div className="expense-info">
                      <div className="expense-desc">
                        {e.storeName || e.description || category}
                        {isRefund && <span className="refund-badge">Refund</span>}
                      </div>
                      <div className="expense-meta">
                        {fmtDate(e.date)} · {e.addedBy?.split('@')[0]}
                        {e.description ? ` · ${e.description}` : ''}
                      </div>
                    </div>
                    <div className={`expense-amount${isRefund ? ' refund-amount' : ''}`}>
                      {fmt(e.amount)}
                    </div>
                    <div className="expense-actions">
                      <button className="btn-edit" onClick={() => setEditExpense(e)} title="Edit">✏️</button>
                      <button className="btn-delete" onClick={() => setPendingDelete(e.id)} title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {pendingDelete && (
        <ConfirmDialog
          message="Delete this expense?"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {editExpense && (
        <ExpenseForm
          user={{ email: editExpense.addedBy }}
          expense={editExpense}
          onClose={() => setEditExpense(null)}
        />
      )}

      {/* FAB — pre-fills current category */}
      <button className="fab" onClick={() => setShowAddForm(true)} title="Add expense">＋</button>

      {showAddForm && (
        <ExpenseForm
          user={user}
          defaultCategory={category}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
