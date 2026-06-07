import { useState, useEffect, useRef } from 'react'
import { addExpense } from '../firebase/db'
import { CATEGORIES } from '../data/budgets'

function today() {
  return new Date().toISOString().slice(0, 10)
}

// Tracks keyboard height via visualViewport (iOS fallback)
function useKeyboardOffset(ref) {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !ref.current) return

    function onResize() {
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop
      if (ref.current) {
        ref.current.style.setProperty(
          '--keyboard-offset',
          `${Math.max(0, keyboardHeight)}px`
        )
      }
    }

    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
    }
  }, [ref])
}

export default function ExpenseForm({ user, onClose }) {
  const [form, setForm]     = useState({ amount: '', category: CATEGORIES[2], description: '', date: today() })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const modalRef            = useRef(null)

  useKeyboardOffset(modalRef)

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount.'); return }
    setSaving(true)
    try {
      await addExpense({ ...form, addedBy: user.email })
      onClose()
    } catch {
      setError('Failed to save. Try again.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal modal-keyboard-aware" ref={modalRef}>
        <h2 className="modal-title">Add Expense</h2>

        <div className="modal-scroll-body">
          <form onSubmit={handleSubmit} id="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  className="form-input"
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

        {/* Sticky actions — always visible above keyboard */}
        <div className="modal-actions modal-actions-sticky">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="expense-form" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
