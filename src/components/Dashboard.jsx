import { useEffect, useState } from 'react'
import { subscribeToExpenses } from '../firebase/db'
import MonthSelector from './MonthSelector'
import SummaryCards from './SummaryCards'
import ChartPanel from './ChartPanel'
import BudgetProgress from './BudgetProgress'
import ExpenseList from './ExpenseList'
import ExpenseForm from './ExpenseForm'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function Dashboard({ user }) {
  const [month, setMonth]       = useState(currentMonth)
  const [expenses, setExpenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToExpenses(month, data => {
      setExpenses(data)
      setLoading(false)
    })
    return () => unsub()
  }, [month])

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <>
      <MonthSelector month={month} onChange={setMonth} />

      {loading ? (
        <div style={{ textAlign:'center', padding:'48px', color:'#64748b' }}>Loading…</div>
      ) : (
        <>
          <SummaryCards totalSpent={totalSpent} />

          <div className="grid-2">
            <ChartPanel expenses={expenses} month={month} />
            <BudgetProgress expenses={expenses} />
          </div>

          <ExpenseList expenses={expenses} />
        </>
      )}

      <button className="fab" onClick={() => setShowForm(true)} title="Add expense">＋</button>

      {showForm && <ExpenseForm user={user} onClose={() => setShowForm(false)} />}
    </>
  )
}
