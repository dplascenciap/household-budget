import { useState } from 'react'
import { deleteExpense } from '../firebase/db'
import { CATEGORY_COLORS } from '../data/budgets'
import ConfirmDialog from './ConfirmDialog'

function fmt(n) { return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2 }) }

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function initials(cat) { return cat.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

export default function ExpenseList({ expenses }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  async function confirmDelete() {
    await deleteExpense(pendingDelete)
    setPendingDelete(null)
  }

  return (
    <>
      <div className="card">
        <div className="expense-list-header">
          <h3>Recent Transactions</h3>
          <span style={{ fontSize:'.8rem', color:'#64748b' }}>{expenses.length} entries</span>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">No transactions yet this month. Hit + to add one.</div>
        ) : (
          <div className="expense-items">
            {expenses.map(e => (
              <div key={e.id} className="expense-row">
                <div
                  className="expense-cat-badge"
                  style={{ background: CATEGORY_COLORS[e.category] || '#94a3b8' }}
                >
                  {initials(e.category)}
                </div>
                <div className="expense-info">
                  <div className="expense-desc">{e.description || e.category}</div>
                  <div className="expense-meta">
                    {fmtDate(e.date)} · {e.category} · {e.addedBy?.split('@')[0]}
                  </div>
                </div>
                <div className="expense-amount">{fmt(e.amount)}</div>
                <button
                  className="btn-delete"
                  onClick={() => setPendingDelete(e.id)}
                  title="Delete"
                >✕</button>
              </div>
            ))}
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
    </>
  )
}
