import { useState, useRef } from 'react'
import { deleteExpense } from '../firebase/db'
import { CATEGORY_COLORS } from '../data/budgets'
import ConfirmDialog from './ConfirmDialog'
import ExpenseForm from './ExpenseForm'

function fmt(n) {
  const abs = Math.abs(n).toLocaleString('en-CA', { minimumFractionDigits: 2 })
  return n < 0 ? `-$${abs}` : `$${abs}`
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return new Date(+y, +m-1, +d).toLocaleDateString('en-CA', { month:'short', day:'numeric' })
}

function initials(cat) { return cat.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

const EMPTY_FILTERS = { search: '', minAmount: '', maxAmount: '', dateFrom: '', dateTo: '' }

function hasActiveFilters(f) {
  return Object.values(f).some(v => v !== '')
}

function applyFilters(expenses, f) {
  return expenses.filter(e => {
    const text = `${e.description} ${e.category}`.toLowerCase()
    if (f.search && !text.includes(f.search.toLowerCase())) return false
    const amt = Math.abs(e.amount)
    if (f.minAmount && amt < parseFloat(f.minAmount)) return false
    if (f.maxAmount && amt > parseFloat(f.maxAmount)) return false
    if (f.dateFrom && e.date < f.dateFrom) return false
    if (f.dateTo   && e.date > f.dateTo)   return false
    return true
  })
}

export default function ExpenseList({ expenses, user }) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [editExpense, setEditExpense]     = useState(null)
  const [showFilter, setShowFilter]       = useState(false)
  const [filters, setFilters]             = useState(EMPTY_FILTERS)
  const filterRef                         = useRef(null)

  async function confirmDelete() {
    await deleteExpense(pendingDelete)
    setPendingDelete(null)
  }

  function updateFilter(field, value) {
    setFilters(f => ({ ...f, [field]: value }))
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
  }

  function toggleFilter() {
    const next = !showFilter
    setShowFilter(next)
    if (next) {
      // Scroll filter panel to top of viewport after it opens
      // so results below have maximum space above the keyboard
      setTimeout(() => {
        filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  // When a filter input is focused, re-scroll to keep filter at top
  function onInputFocus() {
    setTimeout(() => {
      filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300) // wait for keyboard animation
  }

  const active   = hasActiveFilters(filters)
  const filtered = applyFilters(expenses, filters)

  return (
    <>
      <div className="card">
        {/* Header */}
        <div className="expense-list-header">
          <h3>Recent Transactions</h3>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {active && (
              <span className="filter-count">{filtered.length} of {expenses.length}</span>
            )}
            {!active && (
              <span style={{ fontSize:'.8rem', color:'#64748b' }}>{expenses.length} entries</span>
            )}
            <button
              className={`filter-toggle-btn${showFilter ? ' open' : ''}${active ? ' active' : ''}`}
              onClick={toggleFilter}
              title="Filter transactions"
            >
              🔍 {active ? 'Filtered' : 'Filter'}
            </button>
          </div>
        </div>

        {/* Filter panel — at top so it's always immediately visible.
            Auto-scrolls to top of viewport on open so results maximise
            the space above the keyboard when typing.                    */}
        <div className={`filter-panel${showFilter ? ' open' : ''}`} ref={filterRef}>
          <div className="filter-grid">
            <div className="filter-field full-width">
              <label className="form-label">Search description</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Chipotle, Amazon…"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                onFocus={onInputFocus}
              />
            </div>
            <div className="filter-field">
              <label className="form-label">Min amount ($)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={e => updateFilter('minAmount', e.target.value)}
                onFocus={onInputFocus}
              />
            </div>
            <div className="filter-field">
              <label className="form-label">Max amount ($)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Any"
                value={filters.maxAmount}
                onChange={e => updateFilter('maxAmount', e.target.value)}
                onFocus={onInputFocus}
              />
            </div>
            <div className="filter-field">
              <label className="form-label">From date</label>
              <input
                className="form-input"
                type="date"
                value={filters.dateFrom}
                onChange={e => updateFilter('dateFrom', e.target.value)}
                onFocus={onInputFocus}
              />
            </div>
            <div className="filter-field">
              <label className="form-label">To date</label>
              <input
                className="form-input"
                type="date"
                value={filters.dateTo}
                onChange={e => updateFilter('dateTo', e.target.value)}
                onFocus={onInputFocus}
              />
            </div>
          </div>
          {active && (
            <button className="filter-clear-btn" onClick={clearFilters}>
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Transactions */}
        {expenses.length === 0 ? (
          <div className="empty-state">No transactions yet this month. Hit + to add one.</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No transactions match your filters.</div>
        ) : (
          <div className="expense-items">
            {filtered.map(e => {
              const isRefund = e.amount < 0
              return (
                <div key={e.id} className={`expense-row${isRefund ? ' refund-row' : ''}`}>
                  <div
                    className="expense-cat-badge"
                    style={{ background: CATEGORY_COLORS[e.category] || '#94a3b8' }}
                  >
                    {initials(e.category)}
                  </div>
                  <div className="expense-info">
                    <div className="expense-desc">
                      {e.description || e.category}
                      {isRefund && <span className="refund-badge">↩ Refund</span>}
                    </div>
                    <div className="expense-meta">
                      {fmtDate(e.date)} · {e.category} · {e.addedBy?.split('@')[0]}
                    </div>
                  </div>
                  <div className={`expense-amount${isRefund ? ' refund-amount' : ''}`}>
                    {fmt(e.amount)}
                  </div>
                  <div className="expense-actions">
                    <button className="btn-edit" onClick={() => setEditExpense(e)} title="Edit">✏️</button>
                    <button className="btn-delete" onClick={() => setPendingDelete(e.id)} title="Delete">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          message="Delete this expense?"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {editExpense && (
        <ExpenseForm
          user={user}
          expense={editExpense}
          onClose={() => setEditExpense(null)}
        />
      )}
    </>
  )
}
