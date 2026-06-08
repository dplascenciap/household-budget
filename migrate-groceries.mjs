// One-time migration: rename "Groceries" → "Groceries & Household" in Firestore
// Run once, then delete this file.
// Requires: serviceAccount.json in the project root (download from Firebase Console)

import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const sa = JSON.parse(readFileSync('./serviceAccount.json', 'utf8'))
admin.initializeApp({ credential: admin.credential.cert(sa) })
const db = admin.firestore()

async function migrate() {
  const col      = db.collection('households/frisbee-plascencia/expenses')
  const snapshot = await col.where('category', '==', 'Groceries').get()

  if (snapshot.empty) {
    console.log('✅  No "Groceries" entries found — already migrated or nothing to do.')
    return
  }

  console.log(`Found ${snapshot.size} entries to migrate…`)

  const batch = db.batch()
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { category: 'Groceries & Household' })
  })

  await batch.commit()
  console.log(`✅  Migrated ${snapshot.size} entries: "Groceries" → "Groceries & Household"`)
  console.log('You can now delete migrate-groceries.mjs and serviceAccount.json.')
}

migrate().catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1) })
        .finally(() => process.exit(0))
