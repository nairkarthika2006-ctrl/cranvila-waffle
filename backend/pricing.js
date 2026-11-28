import { DELIVERY_FEE, FREE_DELIVERY_ABOVE, DELIVERY_GST } from './menuData.js'
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

// lines: [{ price, qty, gst }]. Single source of truth for bill amounts. Shop is in Gujarat, so
// delivery inside the state is CGST + SGST (half each).
export function totals(lines, couponCode = '') {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const code = String(couponCode || '').trim().toUpperCase()
  const discount = code === 'WELCOME10' ? r2(subtotal * 0.10) : 0
  const discountedSubtotal = r2(subtotal - discount)
  const deliveryFee = discountedSubtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const itemGst = r2(lines.reduce((s, l) => s + (l.price * l.qty * l.gst) / 100, 0) * (discount ? (discountedSubtotal / subtotal) : 1))
  const deliveryGst = r2((deliveryFee * DELIVERY_GST) / 100)
  const gstTotal = r2(itemGst + deliveryGst)
  const cgst = r2(gstTotal / 2)
  const sgst = r2(gstTotal - cgst)
  return { subtotal, discount, couponCode: discount ? code : '', deliveryFee, deliveryGst, gst: { cgst, sgst, total: gstTotal }, total: r2(discountedSubtotal + deliveryFee + gstTotal) }
}
