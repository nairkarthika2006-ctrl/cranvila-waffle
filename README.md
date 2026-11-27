# Cranvila Waffle: React + Express

```
cranvila-waffle/
  frontend/   React 18 + Vite + React Router (responsive website)
  backend/    Node + Express API (menu, orders, tracking, contact, admin)
```

## Run in development (two terminals)
```
cd backend  && npm install && npm run dev     # API on http://localhost:5000
cd frontend && npm install && npm run dev     # site on http://localhost:5173
```
Vite forwards `/api` to the backend automatically.

## Run in production (one server)
```
npm run install:all
npm run build                 # builds frontend/dist
ADMIN_KEY=your-secret npm start   # Express serves the API and the built site on PORT (default 5000)
```
Environment variables: see `backend/.env.example`. If the API lives on another domain, set `VITE_API_URL` before building the frontend and `CORS_ORIGIN` on the backend.

## What the backend does
| Endpoint | Purpose |
|---|---|
| `GET /api/menu` | Menu, delivery fee and free-delivery threshold |
| `POST /api/orders` | Place an order (name, phone, address, items). Prices are recalculated on the server. Returns the order ID |
| `GET /api/orders/:id` | Live tracking. Status moves automatically: placed, preparing after 1 min, out for delivery after 12 min, delivered after 30 min |
| `POST /api/contact` | Save a contact message |
| `GET /api/admin/orders` | List orders with customer details (header `x-admin-key`) |
| `GET /api/admin/messages` | List contact messages (header `x-admin-key`) |
| `PATCH /api/admin/orders/:id` | Body `{"step":0-3}` to set the status by hand, `{"step":null}` for automatic |

Data is saved in `backend/data/db.json`. Demo orders CW1001, CW1002 and CW1003 are created on first run. For heavier traffic, replace `backend/store.js` with SQLite, PostgreSQL or MongoDB.

Example admin call:
```
curl -H "x-admin-key: your-secret" http://localhost:5000/api/admin/orders
```

## Things to change
- Phone, email, address: `frontend/src/data.js` and the footer.
- Menu items and prices: `backend/menuData.js` (the copy in `frontend/src/data.js` is only an offline fallback).
- Testimonials, statistics and FAQ on the home page are sample text in `frontend/src/pages/Home.jsx`. Replace them with real ones.
- The checkout is pay on delivery. Online payments (Razorpay, Stripe) are not included.

---

## New: GST, payments, cancellation, customer records

**GST.** Menu prices are before tax. Items carry 5% (change `ITEM_GST` or set `gst` on one item in `backend/menuData.js`), delivery 18% (`DELIVERY_GST`). Shown as CGST + SGST (Gujarat, within state). The server calculates the bill in `backend/pricing.js`; the page only previews it. Please confirm the rates with your CA.

**Payments.** Cash on delivery, Google Pay, PhonePe and other UPI apps. Online payments go through Razorpay, which opens the UPI apps. To go live, create a Razorpay account and put `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` in `backend/.env.example`'s variables (webhook URL: `/api/payments/webhook`). With no keys the site runs in **demo mode** (simulated payment, no real money; disabled when `NODE_ENV=production`). Every payment event is saved in the payment log.

**Cancellation.** Customers cancel on the Order tracking page until the rider leaves, with two confirmations (the server enforces both) and the phone number used for the order. Paid orders get an automatic refund through Razorpay. Policy page: `/#/cancellation-policy`.

**Not responding.** A COD order stays "pending confirmation"; if the customer does not tap Confirm within `CONFIRM_MINUTES` (20) it is cancelled automatically. Online orders not paid within `PAY_MINUTES` (15) are cancelled. After `NO_RESPONSE_LIMIT` (2) no-response cancellations, that phone number cannot use COD. If you call a customer and they do not answer, mark it with the admin action below.

**Customer records.** Every order saves name, phone, addresses, orders, cancellations and no-response count in `backend/data/db.json`.

New admin calls (header `x-admin-key`):
```
GET   /api/admin/customers                 customers with order count, total spent, cancellations
GET   /api/admin/payments[?orderId=CW1005] payment log
PATCH /api/admin/orders/CW1005  {"action":"confirm"}        you called and they confirmed
PATCH /api/admin/orders/CW1005  {"action":"no_response"}    customer did not answer: cancel
PATCH /api/admin/orders/CW1005  {"action":"cancel","reason":"Out of stock"}
PATCH /api/admin/orders/CW1005  {"action":"cod_collected"}  cash received
```

**Contact map.** Google Maps embed plus a directions button. Set your real address in `frontend/src/data.js` (`ADDRESS`, `MAP_QUERY`).
