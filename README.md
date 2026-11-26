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
