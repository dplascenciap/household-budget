import { useState, useMemo } from 'react'
import { deleteExpense } from '../firebase/db'
import { CATEGORY_COLORS } from '../data/budgets'
import ConfirmDialog from './ConfirmDialog'
import ExpenseForm from './ExpenseForm'
import ExportModal from './ExportModal'

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

function hasActiveFilters(f, cats) {
  return Object.values(f).some(v => v !== '') || cats.length > 0
}

function applyFilters(expenses, f, cats) {
  return expenses.filter(e => {
    const text = `${e.description} ${e.category}`.toLowerCase()
    if (f.search && !text.includes(f.search.toLowerCase())) return false
    const amt = Math.abs(e.amount)
    if (f.minAmount && amt < parseFloat(f.minAmount)) return false
    if (f.maxAmount && amt > parseFloat(f.maxAmount)) return false
    if (f.dateFrom && e.date < f.dateFrom) return false
    if (f.dateTo   && e.date > f.dateTo)   return false
    if (cats.length > 0 && !cats.includes(e.category)) return false
    return true
  })
}

export default function ExpenseList({ expenses, user }) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [editExpense, setEditExpense]     = useState(null)
  const [showFilter, setShowFilter]         = useState(false)
  const [showExport, setShowExport]         = useState(false)
  const [filters, setFilters]               = useState(EMPTY_FILTERS)
  const [selectedCats, setSelectedCats]     = useState([])

  // Only show categories that have expenses this month
  const availableCats = useMemo(() =>
    [...new Set(expenses.map(e => e.category))].sort(),
  [expenses])

  async function confirmDelete() {
    await deleteExpense(pendingDelete)
    setPendingDelete(null)
  }

  function updateFilter(field, value) {
    setFilters(f => ({ ...f, [field]: value }))
  }

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setSelectedCats([])
  }

  const active   = hasActiveFilters(filters, selectedCats)
  const filtered = applyFilters(expenses, filters, selectedCats)

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
              onClick={() => setShowFilter(s => !s)}
              title="Filter transactions"
            >
              🔍 {active ? 'Filtered' : 'Filter'}
            </button>
            <button
              className="export-btn"
              onClick={() => setShowExport(true)}
              title="Export to CSV"
            >
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <div className={`filter-panel${showFilter ? ' open' : ''}`}>
          {/* Category pills */}
          {availableCats.length > 0 && (
            <div className="filter-field full-width" style={{marginBottom:12}}>
              <label className="form-label">Category</label>
              <div className="filter-cat-pills">
                {availableCats.map(cat => (
                  <button
                    key={cat}
                    className={`filter-cat-pill${selectedCats.includes(cat) ? ' active' : ''}`}
                    style={selectedCats.includes(cat) ? { background: CATEGORY_COLORS[cat] || '#94a3b8', borderColor: CATEGORY_COLORS[cat] || '#94a3b8' } : {}}
                    onClick={() => toggleCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filter-grid">
            <div className="filter-field full-width">
              <label className="form-label">Search description</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Chipotle, Amazon…"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
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
              />
            </div>
            <div className="filter-field">
              <label className="form-label">From date</label>
              <input
                className="form-input"
                type="date"
                value={filters.dateFrom}
                onChange={e => updateFilter('dateFrom', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label className="form-label">To date</label>
              <input
                className="form-input"
                type="date"
                value={filters.dateTo}
                onChange={e => updateFilter('dateTo', e.target.value)}
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

      {showExport && (
        <ExportModal
          filters={filters}
          selectedCats={selectedCats}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  )
}
