const configuredBase = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const BASE = `${configuredBase}${configuredBase.endsWith('/api') ? '' : '/api'}`

async function req(path, opts = {}) {
  let res
  try {
    const { headers, ...requestOptions } = opts
    res = await fetch(BASE + path, {
      ...requestOptions,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    })
  } catch {
    throw Object.assign(new Error('Cannot reach the server. Check your connection or call us to order.'), { network: true })
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Please try again.'), { status: res.status, fields: data.fields || {} })
  return data
}

export const api = {
  menu: () => req('/menu'),
  placeOrder: (body) => req('/orders', { method: 'POST', body: JSON.stringify(body) }),
  track: (id) => req(`/orders/${encodeURIComponent(id)}`),
  reorder: (phone) => req(`/orders/phone/${encodeURIComponent(phone)}`),
  confirmOrder: (id, body) => req(`/orders/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: JSON.stringify(body) }),
  cancelOrder: (id, body) => req(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: JSON.stringify(body) }),
  rateOrder: (id, body) => req(`/orders/${encodeURIComponent(id)}/rate`, { method: 'POST', body: JSON.stringify(body) }),
  payCreate: (body) => req('/payments/create', { method: 'POST', body: JSON.stringify(body) }),
  payVerify: (body) => req('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
  payEvent: (body) => req('/payments/event', { method: 'POST', body: JSON.stringify(body) }).catch(() => {}),
  payDemo: (body) => req('/payments/demo', { method: 'POST', body: JSON.stringify(body) }),
  contact: (body) => req('/contact', { method: 'POST', body: JSON.stringify(body) }),
}

export const admin = {
  orders: (key) => req('/admin/orders', { headers: { 'x-admin-key': key } }),
  customers: (key) => req('/admin/customers', { headers: { 'x-admin-key': key } }),
  messages: (key) => req('/admin/messages', { headers: { 'x-admin-key': key } }),
  step: (key, id, step) => req(`/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify({ step }) }),
  payment: (key, id, status) => req(`/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify({ action: status }) }),
  notResponding: (key, id, reason) => req(`/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify({ action: 'no_response', reason }) }),
  cancel: (key, id, reason) => req(`/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify({ action: 'cancel', reason }) }),
}
