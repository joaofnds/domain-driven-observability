import { Discount } from "./Discount";

class DiscountNotFoundError extends Error {}

export class DiscountService {
  private readonly discounts = [
    new Discount("10", 10 / 100),
    new Discount("20", 20 / 100),
  ];

  lookupDiscount(code: string): Discount {
    const discount = this.discounts.find((d) => d.code === code);
    if (!discount) throw new DiscountNotFoundError(code);
    return discount;
  }
}
