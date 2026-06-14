// v1.6 combined migration — run once, then delete this file.
// Requires serviceAccount.json in project root.
//
// Changes:
//   1. "Fixed Bills"           → "Fixed Expenses + Utilities"
//   2. "Housing"               → "Fixed Expenses + Utilities"
//   3. "Groceries & Household" → "Groceries"
//   4. "Government & Legal"    → "Other"
//   5. Copy description → storeName, clear description (now used as Notes)
//   6. Rebuild storeNames meta document

import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const sa = JSON.parse(readFileSync('./serviceAccount.json', 'utf8'))
admin.initializeApp({ credential: admin.credential.cert(sa) })
const db = admin.firestore()

const COLLECTION = 'households/frisbee-plascencia/expenses'
const META_DOC   = 'households/frisbee-plascencia/meta/storeNames'

const RENAMES = {
  'Fixed Bills':           'Fixed Expenses + Utilities',
  'Housing':               'Fixed Expenses + Utilities',
  'Groceries & Household': 'Groceries',
  'Government & Legal':    'Other',
}

async function migrate() {
  const col  = db.collection(COLLECTION)
  const snap = await col.get()

  if (snap.empty) { console.log('No documents found.'); return }

  console.log(`Processing ${snap.size} documents…\n`)

  const batch        = db.batch()
  const storeNameSet = new Set()
  let   renamed      = 0
  let   migrated     = 0

  snap.docs.forEach(d => {
    const data    = d.data()
    const updates = {}

    // 1-4: Rename category
    const newCat = RENAMES[data.category]
    if (newCat) { updates.category = newCat; renamed++ }

    // 5: Copy description → storeName, clear description
    if (!data.storeName && data.description) {
      updates.storeName   = data.description.trim()
      updates.description = ''
      migrated++
    } else if (!data.storeName) {
      updates.storeName = ''
    }

    if (Object.keys(updates).length) batch.update(d.ref, updates)

    // Collect store names for meta document
    const sn = updates.storeName ?? data.storeName
    if (sn && sn.trim()) storeNameSet.add(sn.trim())
  })

  await batch.commit()
  console.log(`✅  Categories renamed:       ${renamed}`)
  console.log(`✅  description → storeName:  ${migrated}`)

  // Rebuild storeNames meta document
  const names = [...storeNameSet].sort()
  await db.doc(META_DOC).set({ names }, { merge: false })
  console.log(`✅  storeNames list rebuilt:  ${names.length} entries`)
  console.log('\nMigration complete. Delete migrate-v1.6.mjs and serviceAccount.json.')
}

migrate()
  .catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1) })
  .finally(() => process.exit(0))
