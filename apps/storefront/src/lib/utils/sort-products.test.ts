import { describe, it, expect } from "vitest";
import { sortProductsByDisplayOrder } from "./sort-products";

type FixtureProduct = {
  id: string;
  metadata?: Record<string, unknown> | null;
};

describe("sortProductsByDisplayOrder", () => {
  it("sorts products with distinct numeric sort_order values ascending", () => {
    const products: FixtureProduct[] = [
      { id: "c", metadata: { sort_order: 3 } },
      { id: "a", metadata: { sort_order: 1 } },
      { id: "b", metadata: { sort_order: 2 } },
    ];

    const result = sortProductsByDisplayOrder(products);

    expect(result.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("treats a numeric string sort_order the same as a number", () => {
    const products: FixtureProduct[] = [
      { id: "b", metadata: { sort_order: "2" } },
      { id: "a", metadata: { sort_order: 1 } },
      { id: "c", metadata: { sort_order: "3" } },
    ];

    const result = sortProductsByDisplayOrder(products);

    expect(result.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("preserves original relative order for equal sort_order values (stability)", () => {
    const products: FixtureProduct[] = [
      { id: "first", metadata: { sort_order: 5 } },
      { id: "other", metadata: { sort_order: 1 } },
      { id: "second", metadata: { sort_order: 5 } },
    ];

    const result = sortProductsByDisplayOrder(products);

    expect(result.map((p) => p.id)).toEqual(["other", "first", "second"]);
  });

  it("pushes missing/null/undefined/empty-string/non-numeric sort_order to the end, preserving their original relative order", () => {
    const products: FixtureProduct[] = [
      { id: "no-metadata" },
      { id: "null-metadata", metadata: null },
      { id: "null-sort-order", metadata: { sort_order: null } },
      { id: "undefined-sort-order", metadata: { sort_order: undefined } },
      { id: "empty-string-sort-order", metadata: { sort_order: "" } },
      { id: "non-numeric-sort-order", metadata: { sort_order: "abc" } },
      { id: "ranked", metadata: { sort_order: 10 } },
    ];

    const result = sortProductsByDisplayOrder(products);

    expect(result.map((p) => p.id)).toEqual([
      "ranked",
      "no-metadata",
      "null-metadata",
      "null-sort-order",
      "undefined-sort-order",
      "empty-string-sort-order",
      "non-numeric-sort-order",
    ]);
  });

  it("sorts a realistic mix of ranked and unranked products", () => {
    const products: FixtureProduct[] = [
      { id: "unranked-1" },
      { id: "ranked-20", metadata: { sort_order: 20 } },
      { id: "unranked-2", metadata: { sort_order: "" } },
      { id: "ranked-5", metadata: { sort_order: "5" } },
      { id: "ranked-10", metadata: { sort_order: 10 } },
      { id: "unranked-3", metadata: { sort_order: "not-a-number" } },
    ];

    const result = sortProductsByDisplayOrder(products);

    expect(result.map((p) => p.id)).toEqual([
      "ranked-5",
      "ranked-10",
      "ranked-20",
      "unranked-1",
      "unranked-2",
      "unranked-3",
    ]);
  });

  it("returns an empty array for empty input", () => {
    const result = sortProductsByDisplayOrder([]);

    expect(result).toEqual([]);
  });

  it("does not mutate the input array or its elements", () => {
    const products: FixtureProduct[] = [
      { id: "c", metadata: { sort_order: 3 } },
      { id: "a", metadata: { sort_order: 1 } },
      { id: "b", metadata: { sort_order: 2 } },
    ];
    const originalCopy = products.map((p) => ({ ...p }));

    const result = sortProductsByDisplayOrder(products);

    expect(products).toEqual(originalCopy);
    expect(result).not.toBe(products);
  });
});
