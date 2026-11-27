const BASE = `${import.meta.env.VITE_API_URL || ''}/api`

async function req(path, opts = {}) {
  let res
  try {
    res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts })
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
  confirmOrder: (id, body) => req(`/orders/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: JSON.stringify(body) }),
  cancelOrder: (id, body) => req(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: JSON.stringify(body) }),
  rateOrder: (id, body) => req(`/orders/${encodeURIComponent(id)}/rate`, { method: 'POST', body: JSON.stringify(body) }),
  payCreate: (body) => req('/payments/create', { method: 'POST', body: JSON.stringify(body) }),
  payVerify: (body) => req('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
  payEvent: (body) => req('/payments/event', { method: 'POST', body: JSON.stringify(body) }).catch(() => {}),
  payDemo: (body) => req('/payments/demo', { method: 'POST', body: JSON.stringify(body) }),
  contact: (body) => req('/contact', { method: 'POST', body: JSON.stringify(body) }),
}
