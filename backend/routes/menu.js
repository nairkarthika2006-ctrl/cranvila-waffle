import { Router } from 'express'
import { menu, DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../menuData.js'

const r = Router()
r.get('/', (req, res) => res.json({ items: menu, deliveryFee: DELIVERY_FEE, freeDeliveryAbove: FREE_DELIVERY_ABOVE }))
export default r
