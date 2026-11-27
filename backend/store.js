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

export const normPhone = (p) => String(p || '').replace(/\D/g, '').slice(-10)

let db
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { db = seed() }

// Upgrade older data files (and the demo seed) to the current shape.
db.customers ||= []; db.payments ||= []; db.ratings ||= []; db.messages ||= []
for (const o of db.orders) {
  if (!o.status) {
    Object.assign(o, {
      status: 'confirmed', confirmedAt: o.createdAt, confirmedBy: 'legacy', paymentMethod: 'cod', paymentStatus: o.manualStep === 3 ? 'paid' : 'cod_due',
      deliveryGst: 0, gst: { cgst: 0, sgst: 0, total: 0 }, cancellation: null,
    })
  }
  if (!customerOf(o)) upsertCustomer(o)
}
save()

export function save() {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(db, null, 2))
  fs.renameSync(FILE + '.tmp', FILE)
}
export const getDb = () => db

export function customerOf(o) { return db.customers.find((c) => c.phone === normPhone(o.phone)) }
// Every order keeps the customer's details in the customers list (one record per phone number).
export function upsertCustomer({ name, phone, address }) {
  let c = db.customers.find((x) => x.phone === normPhone(phone))
  const now = new Date().toISOString()
  if (!c) { c = { phone: normPhone(phone), name, addresses: [], createdAt: now, noResponseCount: 0, cancelledCount: 0 }; db.customers.push(c) }
  c.name = name; c.lastOrderAt = now
  if (address && !c.addresses.includes(address)) c.addresses.push(address)
  return c
}

// Payment log: one row per payment event (COD chosen, gateway order created, success, failure, refund...).
export function logPayment(entry) {
  db.payments.push({ id: `PL${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), ...entry })
  save()
}
