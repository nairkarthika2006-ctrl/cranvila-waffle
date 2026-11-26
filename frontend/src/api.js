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
  contact: (body) => req('/contact', { method: 'POST', body: JSON.stringify(body) }),
}
