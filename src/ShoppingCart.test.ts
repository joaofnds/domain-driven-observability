import { DiscountNotFoundError, DiscountService } from "./DiscountService";
import { DiscountInstrumentation } from "./instrumentation/DiscountInstrumentation";
import { Product } from "./Product";
import { ShoppingCart } from "./ShoppingCart";

describe(ShoppingCart, () => {
  const kinderBueno = new Product("Kinder Bueno", 1_00);
  const iPhone = new Product("iPhone", 1_000_00);

  const discountService = new DiscountService();
  const instrumentation = {
    addingProductToCart: jest.fn(),
    addedProductToCart: jest.fn(),
    applyingDiscountCode: jest.fn(),
    discountCodeLookupFailed: jest.fn(),
    discountCodeLookupSucceeded: jest.fn(),
    discountApplied: jest.fn(),
  } as unknown as DiscountInstrumentation;

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

      it("reports", () => {
        const cart = newShoppingCart();

        cart.add(iPhone);

        expect(instrumentation.addingProductToCart).toHaveBeenCalledWith(
          cart,
          iPhone
        );
        expect(instrumentation.addedProductToCart).toHaveBeenCalledWith(
          cart,
          iPhone
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

    it("reports attempt", () => {
      cart.applyDiscountCode("10");
      expect(instrumentation.applyingDiscountCode).toHaveBeenCalledWith("10");
    });

    describe("when applied", () => {
      it("reports discount", () => {
        const discount = cart.applyDiscountCode("10");

        expect(
          instrumentation.discountCodeLookupSucceeded
        ).toHaveBeenCalledWith("10");

        expect(instrumentation.discountApplied).toHaveBeenCalledWith(
          "10",
          discount
        );
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

      it("does not change total", () => {
        const totalBefore = cart.total();

        cart.applyDiscountCode("does not exist");

        expect(cart.total()).toEqual(totalBefore);
      });

      it("reports error", () => {
        cart.applyDiscountCode("does not exist");
        expect(instrumentation.discountCodeLookupFailed).toHaveBeenCalledWith(
          "does not exist",
          expect.any(DiscountNotFoundError)
        );
      });
    });
  });
});
