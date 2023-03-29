import { ShoppingCart } from "./ShoppingCart";

export class Discount {
  constructor(
    public readonly code: string,
    private readonly discountPercentage: number
  ) {}

  applyToCart(cart: ShoppingCart) {
    const amount = cart.subtotal() * this.discountPercentage;
    cart.setDiscount(amount);
    return amount;
  }
}
