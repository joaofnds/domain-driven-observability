import { randomUUID } from "crypto";
import { Discount } from "./Discount";
import { DiscountService } from "./DiscountService";
import { Product } from "./Product";

export class ShoppingCart {
  private readonly id = randomUUID();
  private readonly products: Product[] = [];
  private discount = 0;

  constructor(private readonly discountService: DiscountService) {}

  add(product: Product) {
    this.products.push(product);
  }

  total(): number {
    return this.subtotal() - this.discount;
  }

  subtotal(): number {
    return this.products.reduce((total, product) => total + product.value, 0);
  }

  setDiscount(amount: number) {
    this.discount = amount;
  }

  applyDiscountCode(discountCode: string) {
    let discount: Discount;
    try {
      discount = this.discountService.lookupDiscount(discountCode);
    } catch (error) {
      return 0;
    }

    const amountDiscounted = discount.applyToCart(this);
    return amountDiscounted;
  }
}
