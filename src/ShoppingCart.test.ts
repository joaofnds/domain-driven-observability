import { DiscountService } from "./DiscountService";
import { Product } from "./Product";
import { ShoppingCart } from "./ShoppingCart";

describe(ShoppingCart, () => {
  const kinderBueno = new Product("Kinder Bueno", 1_00);
  const iPhone = new Product("iPhone", 1_000_00);
  const discountService = new DiscountService();

  describe("subtotal", () => {
    it("starts as 0", () => {
      const cart = new ShoppingCart(discountService);
      expect(cart.subtotal()).toBe(0);
    });

    describe("adding a product", () => {
      it("increases subtotal by product.value", () => {
        const cart = new ShoppingCart(discountService);

        cart.add(kinderBueno);
        cart.add(kinderBueno);
        cart.add(iPhone);

        expect(cart.subtotal()).toBe(kinderBueno.value * 2 + iPhone.value);
      });
    });
  });

  describe("applyDiscountCode", () => {
    let cart: ShoppingCart;

    beforeEach(() => {
      cart = new ShoppingCart(discountService);
      cart.add(iPhone);
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
    });
  });
});
