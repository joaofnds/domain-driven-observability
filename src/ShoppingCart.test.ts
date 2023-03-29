import { DiscountNotFoundError, DiscountService } from "./DiscountService";
import { Analytics } from "./instrumentation/Analytics";
import { DiscountInstrumentation } from "./instrumentation/DiscountInstrumentation";
import { Logger } from "./instrumentation/Logger";
import { Metrics } from "./instrumentation/Metrics";
import { Product } from "./Product";
import { ShoppingCart } from "./ShoppingCart";

describe(ShoppingCart, () => {
  const kinderBueno = new Product("Kinder Bueno", 1_00);
  const iPhone = new Product("iPhone", 1_000_00);

  const discountService = new DiscountService();
  const logger: Logger = { log: jest.fn(), error: jest.fn() };
  const metrics: Metrics = { gauge: jest.fn(), increment: jest.fn() };
  const analytics: Analytics = { track: jest.fn() };
  const instrumentation = new DiscountInstrumentation(
    logger,
    metrics,
    analytics
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const newShoppingCart = () =>
    new ShoppingCart(discountService, instrumentation);

  describe("subtotal", () => {
    it("is 0 when empty", () => {
      const cart = newShoppingCart();
      expect(cart.subtotal()).toBe(0);
    });

    describe("adding a product", () => {
      it("increases subtotal by product.value", () => {
        const cart = newShoppingCart();

        cart.add(kinderBueno);
        cart.add(kinderBueno);
        cart.add(iPhone);

        expect(cart.subtotal()).toBe(kinderBueno.value * 2 + iPhone.value);
      });

      it("logs", () => {
        const cart = newShoppingCart();
        cart.add(iPhone);
        expect(logger.log).toHaveBeenCalledWith(
          `adding product '${iPhone.name}' to cart '${cart.id}'`
        );
      });

      it("tracks", () => {
        const cart = newShoppingCart();
        cart.add(iPhone);
        expect(analytics.track).toHaveBeenCalledWith("Product Added To Cart", {
          id: iPhone.id,
        });
      });

      it("emits metrics", () => {
        const cart = newShoppingCart();
        cart.add(iPhone);

        expect(metrics.gauge).toHaveBeenNthCalledWith(
          1,
          "shopping-cart-total",
          iPhone.value
        );
        expect(metrics.gauge).toHaveBeenNthCalledWith(
          2,
          "shopping-cart-size",
          1
        );
      });
    });
  });

  describe("applyDiscountCode", () => {
    let cart: ShoppingCart;

    beforeEach(() => {
      cart = newShoppingCart();
      cart.add(iPhone);
    });

    it("logs the discount", () => {
      cart.applyDiscountCode("10");
      expect(logger.log).toHaveBeenCalledWith(
        "attempting to apply discount code: 10"
      );
    });

    describe("when applied", () => {
      it("logs", () => {
        const discount = cart.applyDiscountCode("10");
        expect(logger.log).toHaveBeenCalledWith(
          "Discount applied, of amount: " + discount
        );
      });

      it("emits metrics", () => {
        const discount = cart.applyDiscountCode("10");
        expect(metrics.increment).toHaveBeenCalledWith(
          "discount-lookup-success",
          { code: "10" }
        );
      });

      it("tracks", () => {
        const discount = cart.applyDiscountCode("10");
        expect(analytics.track).toHaveBeenCalledWith("Discount Code Applied", {
          code: "10",
          amountDiscounted: discount,
        });
      });
    });

    describe("when code is '10'", () => {
      it("discounts 10%", () => {
        expect(cart.applyDiscountCode("10")).toEqual(100_00);
      });

      it("decreases total by 10%", () => {
        cart.applyDiscountCode("10");
        expect(cart.total()).toEqual(900_00);
      });
    });

    describe("when code is '20'", () => {
      it("discounts 20 percent", () => {
        expect(cart.applyDiscountCode("20")).toEqual(200_00);
      });

      it("decreases total by 20%", () => {
        cart.applyDiscountCode("20");
        expect(cart.total()).toEqual(800_00);
      });
    });

    describe("when discount is not found", () => {
      it("returns 0", () => {
        expect(cart.applyDiscountCode("does not exist")).toEqual(0);
      });

      it("does not decrease total", () => {
        cart.applyDiscountCode("does not exist");
        expect(cart.total()).toEqual(1_000_00);
      });

      it("logs", () => {
        cart.applyDiscountCode("does not exist");
        expect(logger.error).toHaveBeenCalledWith(
          "discount lookup failed",
          expect.any(DiscountNotFoundError)
        );
      });
    });
  });
});
