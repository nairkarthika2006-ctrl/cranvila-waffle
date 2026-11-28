export const PHONE = '+91 98765 43210'
export const PHONE_LINK = 'tel:+919876543210'
export const EMAIL = 'hello@cranvilawaffle.com'
export const DELIVERY_FEE = 30
export const FREE_DELIVERY_ABOVE = 499
export const DELIVERY_GST = 18
export const ITEM_GST = 5

// Add your street / shop number to ADDRESS and MAP_QUERY (e.g. 'Shop 5, ... Bhestan, Surat') to drop the pin exactly on the shop. The map on the Contact page is built from MAP_QUERY.
export const ADDRESS = ['Cranvila Waffle, Bhestan', 'Surat, Gujarat 394210']
export const MAP_QUERY = 'Bhestan, Surat, Gujarat 394210'

export const img = (name) => `${import.meta.env.BASE_URL}images/${name}`
export const rupee = (n) => `₹${Number.isInteger(n) ? n : n.toFixed(2)}`
export const money = (value) => rupee(typeof value === 'object' && value?.total != null ? value.total : value)

// Fallback menu, used only if the backend cannot be reached. The backend list is the source of truth.
export const items = [
  { id: 'berry-maple', name: 'Berry Maple Stack', desc: 'Crisp waffles with strawberries, blueberries, raspberries and warm maple syrup.', price: 259, cat: 'fruit', photo: 'berry-maple.jpg' },
  { id: 'rainbow-choco', name: 'Rainbow Choco Crunch', desc: 'Chocolate waffle with dark chocolate drizzle and rainbow sprinkles.', price: 229, cat: 'chocolate', photo: 'rainbow-choco.jpg' },
  { id: 'butter-berry', name: 'Butter & Berry Classic', desc: 'Golden waffle with butter, maple, strawberries and blackberries, dusted with sugar.', price: 249, cat: 'classic', photo: 'butter-berry.jpg' },
  { id: 'choco-almond', name: 'Choco Almond Melt', desc: 'Chocolate waffle layered with melted chocolate and roasted almonds.', price: 279, cat: 'chocolate', photo: 'choco-almond.jpg' },
  { id: 'fudge-stack', name: 'Fudge Stack', desc: 'Chocolate waffles layered with hot fudge sauce and a scoop of vanilla ice cream.', price: 299, cat: 'icecream', photo: 'fudge-stack.jpg', pos: 'center 55%' },
  { id: 'choco-chip', name: 'Choco Chip Whip', desc: 'Double-stacked waffles with chocolate chips, whipped cream and maple syrup.', price: 239, cat: 'chocolate', photo: 'choco-chip.jpg' },
  { id: 'caramel-crown', name: 'Caramel Crown', desc: 'Vanilla ice cream, chocolate and caramel sauce, crushed nuts and fresh mint.', price: 319, cat: 'icecream', photo: 'caramel-crown.jpg' },
  { id: 'iced-cocoa', name: 'Iced Chocolate Drink', desc: 'Chilled chocolate drink finished with a cloud of cream.', price: 149, cat: 'drinks', photo: 'iced-chocolate-drink.png', diet: 'veg', allergens: ['milk'], inStock: true },
  { id: 'hot-cocoa', name: 'Marshmallow Hot Cocoa', desc: 'Rich hot chocolate topped with whipped cream and marshmallow.', price: 159, cat: 'drinks', photo: 'marshmallow-cocoa-latest.png', diet: 'veg', allergens: ['milk'], inStock: true },
  { id: 'chocolate-shake', name: 'Chocolate Cream Shake', desc: 'Creamy chocolate shake topped with whipped cream and chocolate curls.', price: 189, cat: 'drinks', photo: 'chocolate-shake-latest.png', diet: 'veg', allergens: ['milk'], inStock: true },
  { id: 'strawberry-chocolate-cups', name: 'Strawberry Chocolate Cooler', desc: 'Chocolate and fresh strawberry layered with cream.', price: 219, cat: 'drinks', photo: 'strawberry-chocolate-cooler.png', diet: 'veg', allergens: ['milk', 'strawberry'], inStock: true },
  { id: 'chocolate-brownie', name: 'Chocolate Brownie', desc: 'Fudgy chocolate brownie finished with chocolate drizzle.', price: 179, cat: 'brownies', photo: 'brownie-drizzle.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'brownie-icecream', name: 'Brownie & Ice Cream', desc: 'Warm chocolate brownie served with a scoop of vanilla ice cream.', price: 229, cat: 'brownies', photo: 'brownie-icecream-latest.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'choc-chip-brownie', name: 'Chocolate Chip Brownie', desc: 'Dense chocolate brownie topped with chocolate chips.', price: 199, cat: 'brownies', photo: 'brownie-chip-latest.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'brownie-stack', name: 'Double Brownie Stack', desc: 'A rich stack of brownies finished with white and milk chocolate.', price: 249, cat: 'brownies', photo: 'brownie-stack-latest.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
]

export const filters = [
  { key: 'all', label: 'All' },
  { key: 'classic', label: 'Classic' },
  { key: 'fruit', label: 'Fruit' },
  { key: 'chocolate', label: 'Chocolate' },
  { key: 'icecream', label: 'Ice cream' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'brownies', label: 'Brownies' },
]

export const steps = ['Order placed', 'Preparing', 'Out for delivery', 'Delivered']

export const PAY_OPTIONS = [
  { key: 'cod', method: 'cod', app: null, label: 'Cash on delivery', hint: 'Pay the rider in cash. You will need to confirm the order right after placing it.' },
  { key: 'gpay', method: 'online', app: 'gpay', label: 'Google Pay', hint: 'Pay now with the Google Pay UPI app.' },
  { key: 'phonepe', method: 'online', app: 'phonepe', label: 'PhonePe', hint: 'Pay now with the PhonePe UPI app.' },
  { key: 'upi', method: 'online', app: 'upi', label: 'Other UPI app', hint: 'Paytm, BHIM, bank apps or a UPI ID.' },
]
export const PAY_LABEL = { gpay: 'Google Pay', phonepe: 'PhonePe', upi: 'UPI' }
