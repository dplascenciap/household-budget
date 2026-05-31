const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']

// month: 'YYYY-MM'
export default function MonthSelector({ month, onChange }) {
  const [year, m] = month.split('-').map(Number)
  const label = `${MONTHS[m - 1]} ${year}`

  function prev() {
    const d = new Date(year, m - 2, 1)
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  function next() {
    const d = new Date(year, m, 1)
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Allow up to 12 months into the future
  const now = new Date()
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 12, 1)
  const isTooFar = new Date(year, m, 1) > maxDate

  return (
    <div className="month-selector">
      <button className="btn-month" onClick={prev}>‹</button>
      <h2>{label}</h2>
      <button className="btn-month" onClick={next} disabled={isTooFar}
        style={{ opacity: isTooFar ? .3 : 1 }}>›</button>
    </div>
  )
}
