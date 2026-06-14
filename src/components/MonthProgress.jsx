// Shows how far through the current month we are.
// Only shown for the current month — not for past or future months.
export default function MonthProgress({ month }) {
  const now   = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

  // Only render for the current month
  if (month !== today) return null

  const [y, m]   = month.split('-').map(Number)
  const totalDays = new Date(y, m, 0).getDate()        // days in month
  const dayOfMonth = now.getDate()                      // today's day number
  const pct        = Math.round((dayOfMonth / totalDays) * 100)

  return (
    <div className="month-progress">
      <div className="month-progress-bar">
        <div className="month-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="month-progress-label">
        Day {dayOfMonth} of {totalDays} · {pct}% of month elapsed
      </span>
    </div>
  )
}
