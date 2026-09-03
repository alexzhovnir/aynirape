import { describe, expect, it } from "vitest";
import { getShippingDisplay } from "./shipping-display";

describe("getShippingDisplay", () => {
  it("is pending when no shipping method has been selected", () => {
    expect(getShippingDisplay({ shipping_methods: [], shipping_total: 0 })).toEqual({
      kind: "pending",
    });
  });

  it("is pending when shipping_methods is undefined", () => {
    expect(getShippingDisplay({ shipping_total: 0 })).toEqual({ kind: "pending" });
  });

  it("is pending when shipping_methods is null", () => {
    expect(getShippingDisplay({ shipping_methods: null })).toEqual({
      kind: "pending",
    });
  });

  it("stays pending even if a total somehow exists without a method", () => {
    expect(
      getShippingDisplay({ shipping_methods: [], shipping_total: 12 })
    ).toEqual({ kind: "pending" });
  });

  it("is free when a method is selected and costs nothing", () => {
    expect(
      getShippingDisplay({ shipping_methods: [{}], shipping_total: 0 })
    ).toEqual({ kind: "free" });
  });

  it("is free when a method is selected and the total is missing", () => {
    expect(getShippingDisplay({ shipping_methods: [{}] })).toEqual({
      kind: "free",
    });
  });

  it("reports the amount when a paid method is selected", () => {
    expect(
      getShippingDisplay({ shipping_methods: [{}], shipping_total: 12 })
    ).toEqual({ kind: "amount", amount: 12 });
  });
});
