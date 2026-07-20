import { describe, it, expect } from "vitest";
import { isProductInStock } from "./is-product-in-stock";
import { getPercentageDiff } from "./get-percentage-diff";
import { isEmpty } from "./is-empty";

describe("isProductInStock", () => {
  it("returns true if manage_inventory is false", () => {
    expect(isProductInStock({ manage_inventory: false, allow_backorder: false })).toBe(true);
  });

  it("returns true if allow_backorder is true", () => {
    expect(isProductInStock({ manage_inventory: true, allow_backorder: true })).toBe(true);
  });

  it("returns true if inventory_quantity is greater than 0", () => {
    expect(isProductInStock({ manage_inventory: true, allow_backorder: false, inventory_quantity: 5 })).toBe(true);
  });

  it("returns false if manage_inventory is true, allow_backorder is false, and inventory_quantity is undefined/null/0", () => {
    expect(isProductInStock({ manage_inventory: true, allow_backorder: false, inventory_quantity: 0 })).toBe(false);
    expect(isProductInStock({ manage_inventory: true, allow_backorder: false, inventory_quantity: null })).toBe(false);
  });
});

describe("getPercentageDiff", () => {
  it("calculates percentage decrease correctly", () => {
    expect(getPercentageDiff(100, 80)).toBe("20");
    expect(getPercentageDiff(50, 25)).toBe("50");
  });
});

describe("isEmpty", () => {
  it("detects empty values", () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty("")).toBe(true);
    expect(isEmpty("   ")).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it("returns false for non-empty values", () => {
    expect(isEmpty("hello")).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(0)).toBe(false);
  });
});
