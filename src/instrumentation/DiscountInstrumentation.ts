import { Product } from "../Product";
import { ShoppingCart } from "../ShoppingCart";
import { Analytics } from "./Analytics";
import { Logger } from "./Logger";
import { Metrics } from "./Metrics";

export class DiscountInstrumentation implements DiscountInstrumentation {
  constructor(
    private readonly logger: Logger,
    private readonly metrics: Metrics,
    private readonly analytics: Analytics
  ) {}

  addingProductToCart(cart: ShoppingCart, product: Product) {
    this.logger.log(`adding product '${product.name}' to cart '${cart.id}'`);
  }

  addedProductToCart(cart: ShoppingCart, product: Product) {
    this.analytics.track("Product Added To Cart", { id: product.id });
    this.metrics.gauge("shopping-cart-total", cart.total());
    this.metrics.gauge("shopping-cart-size", cart.size());
  }

  applyingDiscountCode(discountCode: string) {
    this.logger.log(`attempting to apply discount code: ${discountCode}`);
  }

  discountCodeLookupFailed(discountCode: string, error: any) {
    this.logger.error("discount lookup failed", error);
    this.metrics.increment("discount-lookup-failure", { code: discountCode });
  }

  discountCodeLookupSucceeded(discountCode: string) {
    this.metrics.increment("discount-lookup-success", { code: discountCode });
  }

  discountApplied(code: string, amountDiscounted: number) {
    this.logger.log(`Discount applied, of amount: ${amountDiscounted}`);
    this.analytics.track("Discount Code Applied", {
      code: code,
      amountDiscounted: amountDiscounted,
    });
  }
}
