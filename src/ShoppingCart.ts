import { randomUUID } from "crypto";
import { DiscountService } from "./DiscountService";
import { DiscountInstrumentation } from "./instrumentation/DiscountInstrumentation";
import { Product } from "./Product";

export class ShoppingCart {
  readonly id = randomUUID();

  private readonly products: Product[] = [];
  private discount = 0;

  constructor(
    private readonly discountService: DiscountService,
    private readonly instrumentation: DiscountInstrumentation
  ) {}

  add(product: Product) {
    this.instrumentation.addingProductToCart(this, product);
    this.products.push(product);
    this.instrumentation.addedProductToCart(this, product);
  }

  total(): number {
    return this.subtotal() - this.discount;
  }

  size(): number {
    return this.products.length;
  }

  subtotal(): number {
    return this.products.reduce((total, product) => total + product.value, 0);
  }

  setDiscount(amount: number) {
    this.discount = amount;
  }

  applyDiscountCode(discountCode) {
    this.instrumentation.applyingDiscountCode(discountCode);

    let discount;
    try {
      discount = this.discountService.lookupDiscount(discountCode);
    } catch (error) {
      this.instrumentation.discountCodeLookupFailed(discountCode, error);
      return 0;
    }
    this.instrumentation.discountCodeLookupSucceeded(discountCode);

    const amountDiscounted = discount.applyToCart(this);
    this.instrumentation.discountApplied(discountCode, amountDiscounted);
    return amountDiscounted;
  }
}
