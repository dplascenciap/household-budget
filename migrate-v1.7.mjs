// v1.7 migration — run once, then delete this file.
// Requires serviceAccount.json in project root.
//
// Changes:
//   1. Add card = 'Not Provided' to all existing entries
//   2. Fix miscategorized June entries:
//      - Bell $75.71 (Jun 29): Subscriptions → Fixed Expenses + Utilities
//      - Popular Car Wash $39.54 (Jun 21): Subscriptions → Transportation
//      - Chipotle $3.36 (Jun 29): Groceries → Dining Out
//      - Shoppers $11.73 (Jun 8): Dining Out → Groceries

import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const sa = JSON.parse(readFileSync('./serviceAccount.json', 'utf8'))
admin.initializeApp({ credential: admin.credential.cert(sa) })
const db = admin.firestore()

const COLLECTION = 'households/frisbee-plascencia/expenses'

// Identify entries to recategorize by storeName + date + old category
const FIXES = [
  { storeName: 'Bell',             date: '2026-06-29', from: 'Subscriptions', to: 'Fixed Expenses + Utilities' },
  { storeName: 'Popular Car Wash', date: '2026-06-21', from: 'Subscriptions', to: 'Transportation' },
  { storeName: 'Chipotle',         date: '2026-06-29', from: 'Groceries',     to: 'Dining Out' },
  { storeName: 'Shoppers',         date: '2026-06-08', from: 'Dining Out',    to: 'Groceries' },
]

async function migrate() {
  const snap = await db.collection(COLLECTION).get()
  if (snap.empty) { console.log('No documents found.'); return }

  console.log(`Processing ${snap.size} documents…\n`)

  const batch = db.batch()
  let cardAdded = 0
  let fixed = 0

  snap.docs.forEach(d => {
    const data    = d.data()
    const updates = {}

    // 1. Add card field if missing
    if (!data.card) {
      updates.card = 'Not Provided'
      cardAdded++
    }

    // 2. Fix miscategorized entries
    const match = FIXES.find(f =>
      f.storeName === data.storeName &&
      f.date      === data.date      &&
      f.from      === data.category
    )
    if (match) {
      updates.category = match.to
      fixed++
      console.log(`  ✏️  ${data.storeName} (${data.date}): ${match.from} → ${match.to}`)
    }

    if (Object.keys(updates).length) batch.update(d.ref, updates)
  })

  await batch.commit()
  console.log(`\n✅  card field added:        ${cardAdded} entries`)
  console.log(`✅  recategorized:           ${fixed} entries`)
  console.log('\nMigration complete. Delete migrate-v1.7.mjs and serviceAccount.json.')
}

migrate()
  .catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1) })
  .finally(() => process.exit(0))
