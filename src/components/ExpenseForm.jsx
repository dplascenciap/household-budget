import { useState } from 'react'
import { addExpense } from '../firebase/db'
import { CATEGORIES } from '../data/budgets'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ExpenseForm({ user, onClose }) {
  const [form, setForm]   = useState({ amount: '', category: CATEGORIES[2], description: '', date: today() })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

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
      <div className="modal">
        <h2 className="modal-title">Add Expense</h2>
        <form onSubmit={handleSubmit}>
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

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
