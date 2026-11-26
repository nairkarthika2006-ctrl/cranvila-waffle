// Single source of truth for prices. The server always recalculates totals from this list.
export const DELIVERY_FEE = 30
export const FREE_DELIVERY_ABOVE = 499

export const menu = [
  { id: 'berry-maple', name: 'Berry Maple Stack', desc: 'Crisp waffles with strawberries, blueberries, raspberries and warm maple syrup.', price: 259, cat: 'fruit', photo: 'berry-maple.jpg' },
  { id: 'rainbow-choco', name: 'Rainbow Choco Crunch', desc: 'Chocolate waffle with dark chocolate drizzle and rainbow sprinkles.', price: 229, cat: 'chocolate', photo: 'rainbow-choco.jpg' },
  { id: 'butter-berry', name: 'Butter & Berry Classic', desc: 'Golden waffle with butter, maple, strawberries and blackberries, dusted with sugar.', price: 249, cat: 'classic', photo: 'butter-berry.jpg' },
  { id: 'choco-almond', name: 'Choco Almond Melt', desc: 'Chocolate waffle layered with melted chocolate and roasted almonds.', price: 279, cat: 'chocolate', photo: 'choco-almond.jpg' },
  { id: 'fudge-stack', name: 'Fudge Stack', desc: 'Chocolate waffles layered with hot fudge sauce and a scoop of vanilla ice cream.', price: 299, cat: 'icecream', photo: 'fudge-stack.jpg', pos: 'center 55%' },
  { id: 'choco-chip', name: 'Choco Chip Whip', desc: 'Double-stacked waffles with chocolate chips, whipped cream and maple syrup.', price: 239, cat: 'chocolate', photo: 'choco-chip.jpg' },
  { id: 'caramel-crown', name: 'Caramel Crown', desc: 'Vanilla ice cream, chocolate and caramel sauce, crushed nuts and fresh mint.', price: 319, cat: 'icecream', photo: 'caramel-crown.jpg' },
  { id: 'cocoa-strawberry', name: 'Cocoa Strawberry Cream', desc: 'Cocoa waffles with fresh strawberries and a spoon of vanilla cream.', price: 259, cat: 'fruit', photo: 'cocoa-strawberry.jpg', pos: 'center 75%' },
]
