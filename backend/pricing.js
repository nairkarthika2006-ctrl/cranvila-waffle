import { DELIVERY_FEE, FREE_DELIVERY_ABOVE, DELIVERY_GST } from './menuData.js'
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

// lines: [{ price, qty, gst }]. Single source of truth for bill amounts. Shop is in Gujarat, so
// delivery inside the state is CGST + SGST (half each).
export function totals(lines) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const itemGst = r2(lines.reduce((s, l) => s + (l.price * l.qty * l.gst) / 100, 0))
  const deliveryGst = r2((deliveryFee * DELIVERY_GST) / 100)
  const gstTotal = r2(itemGst + deliveryGst)
  const cgst = r2(gstTotal / 2)
  const sgst = r2(gstTotal - cgst)
  return { subtotal, deliveryFee, deliveryGst, gst: { cgst, sgst, total: gstTotal }, total: r2(subtotal + deliveryFee + gstTotal) }
}
