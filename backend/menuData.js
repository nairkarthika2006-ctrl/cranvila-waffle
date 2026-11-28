// Single source of truth for prices. The server always recalculates totals from this list.
export const DELIVERY_FEE = 30
export const FREE_DELIVERY_ABOVE = 499
// GST: food items 5% by default (set `gst` on an item to override). Delivery charge 18%.
// Confirm the correct rates for your business with your CA.
export const ITEM_GST = 5
export const DELIVERY_GST = 18

export const menu = [
  { id: 'berry-maple', name: 'Berry Maple Stack', desc: 'Crisp waffles with strawberries, blueberries, raspberries and warm maple syrup.', price: 259, cat: 'fruit', photo: 'berry-maple.jpg', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'rainbow-choco', name: 'Rainbow Choco Crunch', desc: 'Chocolate waffle with dark chocolate drizzle and rainbow sprinkles.', price: 229, cat: 'chocolate', photo: 'rainbow-choco.jpg', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'butter-berry', name: 'Butter & Berry Classic', desc: 'Golden waffle with butter, maple, strawberries and blackberries, dusted with sugar.', price: 249, cat: 'classic', photo: 'butter-berry.jpg', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'choco-almond', name: 'Choco Almond Melt', desc: 'Chocolate waffle layered with melted chocolate and roasted almonds.', price: 279, cat: 'chocolate', photo: 'choco-almond.jpg', diet: 'egg', allergens: ['eggs', 'milk', 'wheat', 'nuts'], inStock: true },
  { id: 'fudge-stack', name: 'Fudge Stack', desc: 'Chocolate waffles layered with hot fudge sauce and a scoop of vanilla ice cream.', price: 299, cat: 'icecream', photo: 'fudge-stack.jpg', pos: 'center 55%', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'choco-chip', name: 'Choco Chip Whip', desc: 'Double-stacked waffles with chocolate chips, whipped cream and maple syrup.', price: 239, cat: 'chocolate', photo: 'choco-chip.jpg', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'caramel-crown', name: 'Caramel Crown', desc: 'Vanilla ice cream, chocolate and caramel sauce, crushed nuts and fresh mint.', price: 319, cat: 'icecream', photo: 'caramel-crown.jpg', diet: 'egg', allergens: ['eggs', 'milk', 'wheat', 'nuts'], inStock: true },
  { id: 'iced-cocoa', name: 'Iced Chocolate Drink', desc: 'Chilled chocolate drink finished with a cloud of cream.', price: 149, cat: 'drinks', photo: 'iced-chocolate-drink.png', diet: 'veg', allergens: ['milk'], inStock: true },
  { id: 'chocolate-shake', name: 'Chocolate Cream Shake', desc: 'Creamy chocolate shake topped with whipped cream and chocolate curls.', price: 189, cat: 'drinks', photo: 'chocolate-shake-latest.png', diet: 'veg', allergens: ['milk'], inStock: true },
  { id: 'strawberry-chocolate-cups', name: 'Strawberry Chocolate Cooler', desc: 'Chocolate and fresh strawberry layered with cream.', price: 219, cat: 'drinks', photo: 'strawberry-chocolate-cooler.png', diet: 'veg', allergens: ['milk', 'strawberry'], inStock: true },
  { id: 'chocolate-brownie', name: 'Chocolate Brownie', desc: 'Fudgy chocolate brownie finished with chocolate drizzle.', price: 179, cat: 'brownies', photo: 'brownie-drizzle.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'brownie-icecream', name: 'Brownie & Ice Cream', desc: 'Warm chocolate brownie served with a scoop of vanilla ice cream.', price: 229, cat: 'brownies', photo: 'brownie-icecream-latest.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'choc-chip-brownie', name: 'Chocolate Chip Brownie', desc: 'Dense chocolate brownie topped with chocolate chips.', price: 199, cat: 'brownies', photo: 'brownie-chip-latest.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
  { id: 'brownie-stack', name: 'Double Brownie Stack', desc: 'A rich stack of brownies finished with white and milk chocolate.', price: 249, cat: 'brownies', photo: 'brownie-stack-latest.png', diet: 'egg', allergens: ['eggs', 'milk', 'wheat'], inStock: true },
]
.map((i) => ({ gst: ITEM_GST, ...i }))
