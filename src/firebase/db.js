import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db, HOUSEHOLD_ID } from './config'

const expensesRef = () =>
  collection(db, 'households', HOUSEHOLD_ID, 'expenses')

// Real-time listener for a given month (YYYY-MM)
export function subscribeToExpenses(month, callback) {
  const q = query(expensesRef(), where('month', '==', month))
  return onSnapshot(q, snapshot => {
    const expenses = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.date > a.date ? 1 : -1))
    callback(expenses)
  })
}

// Real-time listener for a date range (weekly check)
export function subscribeToWeekExpenses(monday, sunday, callback) {
  const q = query(
    expensesRef(),
    where('date', '>=', monday),
    where('date', '<=', sunday),
  )
  return onSnapshot(q, snapshot => {
    const expenses = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.date > a.date ? 1 : -1))
    callback(expenses)
  })
}

// Add a new expense (amount negative = refund)
export async function addExpense({ amount, category, description, date, addedBy }) {
  return addDoc(expensesRef(), {
    amount:      parseFloat(amount),
    category:    category.trim(),
    description: (description || '').trim(),
    date:        date.trim(),
    month:       date.trim().slice(0, 7),
    addedBy:     addedBy.trim(),
    createdAt:   serverTimestamp(),
  })
}

// Update an existing expense
export async function updateExpense(id, { amount, category, description, date }) {
  return updateDoc(doc(db, 'households', HOUSEHOLD_ID, 'expenses', id), {
    amount:      parseFloat(amount),
    category:    category.trim(),
    description: (description || '').trim(),
    date:        date.trim(),
    month:       date.trim().slice(0, 7),
  })
}

// Delete an expense by id
export async function deleteExpense(id) {
  return deleteDoc(doc(db, 'households', HOUSEHOLD_ID, 'expenses', id))
}
