// Tiny JSON-file database. Fine for a single small shop; swap for SQLite/Postgres/MongoDB when you grow.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
const FILE = path.join(dir, 'db.json')

function seed() {
  const now = new Date().toISOString()
  const mk = (id, step, itemId, name, price) => ({
    id, createdAt: now, manualStep: step, name: 'Demo customer', phone: '9876543210', address: 'Demo address, Surat',
    note: '', items: [{ id: itemId, name, price, qty: 1 }], subtotal: price, deliveryFee: 30, total: price + 30,
  })
  return {
    nextOrder: 1004,
    orders: [
      mk('CW1001', 1, 'berry-maple', 'Berry Maple Stack', 259),
      mk('CW1002', 2, 'choco-almond', 'Choco Almond Melt', 279),
      mk('CW1003', 3, 'fudge-stack', 'Fudge Stack', 299),
    ],
    messages: [],
  }
}

let db
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { db = seed(); save() }

export function save() {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(db, null, 2))
  fs.renameSync(FILE + '.tmp', FILE)
}
export const getDb = () => db
