import { useState, useEffect, useRef } from 'react'
import { addExpense, updateExpense } from '../firebase/db'
import { CATEGORIES } from '../data/budgets'

function today() { return new Date().toISOString().slice(0, 10) }

function useKeyboardOffset(ref) {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !ref.current) return
    function onResize() {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      if (ref.current) ref.current.style.setProperty('--keyboard-offset', `${offset}px`)
    }
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => { vv.removeEventListener('resize', onResize); vv.removeEventListener('scroll', onResize) }
  }, [ref])
}

// expense = null → add mode; expense = object → edit mode
export default function ExpenseForm({ user, onClose, expense }) {
  const isEdit    = !!expense
  const isRefundInit = isEdit && expense.amount < 0

  const [type, setType]   = useState(isRefundInit ? 'refund' : 'expense')
  const [form, setForm]   = useState({
    amount:      isEdit ? Math.abs(expense.amount) : '',
    category:    isEdit ? expense.category : CATEGORIES[3],
    description: isEdit ? expense.description : '',
    date:        isEdit ? expense.date : today(),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const modalRef            = useRef(null)

  useKeyboardOffset(modalRef)

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount.'); return }

    const finalAmount = type === 'refund'
      ? -Math.abs(parseFloat(form.amount))
      :  Math.abs(parseFloat(form.amount))

    setSaving(true)
    try {
      if (isEdit) {
        await updateExpense(expense.id, { ...form, amount: finalAmount })
      } else {
        await addExpense({ ...form, amount: finalAmount, addedBy: user.email })
      }
      onClose()
    } catch {
      setError('Failed to save. Try again.')
      setSaving(false)
    }
  }

  const isRefund = type === 'refund'
  const title    = isEdit ? (isRefund ? 'Edit Refund' : 'Edit Expense') : (isRefund ? 'Add Refund' : 'Add Expense')

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal modal-keyboard-aware" ref={modalRef}>
        <h2 className="modal-title">{title}</h2>

        {/* Expense / Refund segmented toggle */}
        <div className="form-type-toggle">
          <button
            type="button"
            className={`form-type-btn${type === 'expense' ? ' active expense' : ''}`}
            onClick={() => setType('expense')}
          >
            💳 Expense
          </button>
          <button
            type="button"
            className={`form-type-btn${type === 'refund' ? ' active refund' : ''}`}
            onClick={() => setType('refund')}
          >
            ↩ Refund
          </button>
        </div>

        {isRefund && (
          <div className="refund-note">
            A refund reduces your spending total for this category.
          </div>
        )}

        <div className="modal-scroll-body">
          <form onSubmit={handleSubmit} id="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{isRefund ? 'Refund Amount ($)' : 'Amount ($)'}</label>
                <input
                  className={`form-input${isRefund ? ' refund-input' : ''}`}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => update('amount', e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={e => update('date', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => update('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Food Basics, Chipotle…"
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>

            {error && <p style={{ color:'#dc2626', fontSize:'.85rem', marginBottom:8 }}>{error}</p>}
          </form>
        </div>

        <div className="modal-actions modal-actions-sticky">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            form="expense-form"
            className={isRefund ? 'btn-refund' : 'btn-primary'}
            disabled={saving}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : isRefund ? 'Save Refund' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
