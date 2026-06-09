import { useState } from 'react'
import { fetchExpensesForMonths } from '../firebase/db'

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']

function currentMonth() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
}

// Options from Jan 2026 up to the current month
function getMonthOptions() {
  const options = []
  const now = new Date()
  let y = 2026, m = 1
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    options.push({
      value: `${y}-${String(m).padStart(2,'0')}`,
      label: `${MONTH_NAMES[m-1]} ${y}`,
    })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return options
}

function getMonthsInRange(from, to) {
  const months = []
  let [y, m] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2,'0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return months
}

function applyFilters(expenses, f, cats) {
  const today = new Date().toISOString().slice(0, 10)
  return expenses.filter(e => {
    if (e.date > today) return false                                      // never include future entries
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

function downloadCSV(expenses, fromMonth, toMonth) {
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))

  const headers = ['Date','Description','Category','Amount ($)','Type','Added By']
  const rows = sorted.map(e => [
    e.date,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    `"${e.category}"`,
    Math.abs(e.amount).toFixed(2),
    e.amount < 0 ? 'Refund' : 'Expense',
    e.addedBy?.split('@')[0] || '',
  ])

  // Category summary
  const totals = {}
  sorted.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount })
  const grandTotal = sorted.reduce((s, e) => s + e.amount, 0)

  const summary = [
    [],
    ['--- SUMMARY BY CATEGORY ---','','','','',''],
    ['Category','','','Total ($)','',''],
    ...Object.entries(totals)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([cat, total]) => [`"${cat}"`, '', '', total.toFixed(2), '', '']),
    [],
    ['GRAND TOTAL','','',grandTotal.toFixed(2),'',''],
  ]

  const label = fromMonth === toMonth ? fromMonth : `${fromMonth}-to-${toMonth}`
  const csv   = [
    headers.join(','),
    ...rows.map(r => r.join(',')),
    ...summary.map(r => r.join(',')),
  ].join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `budget-${label}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ExportModal({ filters, selectedCats, onClose }) {
  const cm = currentMonth()
  const [fromMonth, setFromMonth] = useState(cm)
  const [toMonth, setToMonth]     = useState(cm)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const options    = getMonthOptions()
  const hasFilters = Object.values(filters).some(v => v !== '') || selectedCats.length > 0

  async function handleExport() {
    if (fromMonth > toMonth) { setError('Start month must be on or before the end month.'); return }
    setLoading(true)
    setError('')
    try {
      const months   = getMonthsInRange(fromMonth, toMonth)
      const all      = await fetchExpensesForMonths(months)
      const filtered = applyFilters(all, filters, selectedCats)
      if (!filtered.length) {
        setError('No transactions found for this range.')
        setLoading(false)
        return
      }
      downloadCSV(filtered, fromMonth, toMonth)
      onClose()
    } catch {
      setError('Export failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2 className="modal-title">Export to CSV</h2>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">From</label>
            <select className="form-select" value={fromMonth} onChange={e => setFromMonth(e.target.value)}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <select className="form-select" value={toMonth} onChange={e => setToMonth(e.target.value)}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="export-filter-note">
            ⚡ Active filters will be applied — only matching transactions will export.
          </div>
        )}

        <p className="export-note">
          Transactions up to today only. A category summary is included at the bottom of the file.
        </p>

        {error && <p style={{ color:'var(--danger)', fontSize:'.85rem', marginBottom:8 }}>{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleExport} disabled={loading}>
            {loading ? 'Exporting…' : '↓ Download CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
