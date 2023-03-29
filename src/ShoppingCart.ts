import { randomUUID } from "crypto";
import { Discount } from "./Discount";
import { DiscountService } from "./DiscountService";
import { Analytics } from "./instrumentation/Analytics";
import { Logger } from "./instrumentation/Logger";
import { Metrics } from "./instrumentation/Metrics";
import { Product } from "./Product";

export class ShoppingCart {
  readonly id = randomUUID();

  private readonly products: Product[] = [];
  private discount = 0;

  constructor(
    private readonly discountService: DiscountService,
    private readonly logger: Logger,
    private readonly metrics: Metrics,
    private readonly analytics: Analytics
  ) {}

  add(product: Product) {
    this.logger.log(`adding product '${product.name}' to cart '${this.id}'`);

    this.products.push(product);

    this.analytics.track("Product Added To Cart", { id: product.id });
    this.metrics.gauge("shopping-cart-total", this.total());
    this.metrics.gauge("shopping-cart-size", this.products.length);
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

  applyDiscountCode(discountCode) {
    this.logger.log(`attempting to apply discount code: ${discountCode}`);

    let discount;
    try {
      discount = this.discountService.lookupDiscount(discountCode);
    } catch (error) {
      this.logger.error("discount lookup failed", error);
      this.metrics.increment("discount-lookup-failure", { code: discountCode });
      return 0;
    }
    this.metrics.increment("discount-lookup-success", { code: discountCode });

    const amountDiscounted = discount.applyToCart(this);
    this.logger.log(`Discount applied, of amount: ${amountDiscounted}`);
    this.analytics.track("Discount Code Applied", {
      code: discount.code,
      amountDiscounted,
    });
    return amountDiscounted;
  }
}
