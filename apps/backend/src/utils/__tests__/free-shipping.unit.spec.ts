import {
  buildFreeShippingContext,
  isFreeShippingEligible,
  FREE_SHIPPING_THRESHOLD,
} from "../free-shipping";

describe("isFreeShippingEligible", () => {
  it("is false below the threshold", () => {
    expect(isFreeShippingEligible(FREE_SHIPPING_THRESHOLD - 0.01)).toBe(false);
  });

  it("is true exactly at the threshold", () => {
    expect(isFreeShippingEligible(FREE_SHIPPING_THRESHOLD)).toBe(true);
  });

  it("is true above the threshold", () => {
    expect(isFreeShippingEligible(FREE_SHIPPING_THRESHOLD + 50)).toBe(true);
  });

  it("accepts numeric strings", () => {
    expect(isFreeShippingEligible("200")).toBe(true);
    expect(isFreeShippingEligible("20")).toBe(false);
  });

  it("is false for null, undefined and empty values", () => {
    expect(isFreeShippingEligible(null)).toBe(false);
    expect(isFreeShippingEligible(undefined)).toBe(false);
    expect(isFreeShippingEligible("")).toBe(false);
  });

  it("is false for values that are not numbers", () => {
    expect(isFreeShippingEligible("abc")).toBe(false);
    expect(isFreeShippingEligible(Number.NaN)).toBe(false);
  });

  it("is false for a zero subtotal", () => {
    expect(isFreeShippingEligible(0)).toBe(false);
  });
});

describe("buildFreeShippingContext", () => {
  it("returns the string 'true' for an eligible cart", () => {
    expect(buildFreeShippingContext({ item_total: 150 })).toEqual({
      free_shipping_eligible: "true",
    });
  });

  it("returns the string 'false' for a cart below the threshold", () => {
    expect(buildFreeShippingContext({ item_total: 149.99 })).toEqual({
      free_shipping_eligible: "false",
    });
  });

  it("returns 'false' when the cart has no subtotal at all", () => {
    expect(buildFreeShippingContext({})).toEqual({
      free_shipping_eligible: "false",
    });
    expect(buildFreeShippingContext(undefined)).toEqual({
      free_shipping_eligible: "false",
    });
  });
});
