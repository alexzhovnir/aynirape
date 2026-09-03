import {
  aggregateInventorySales,
  mapInventoryItemToRow,
  mapOrdersToSales,
  type InventoryItemRow,
  type LineItemSale,
} from "../inventory-sales";

const item = (overrides: Partial<InventoryItemRow> = {}): InventoryItemRow => ({
  id: "iitem_1",
  sku: "SKU-1",
  title: "Default",
  reserved_quantity: 0,
  stocked_quantity: 100,
  weight: "10g",
  product_title: "Product",
  category_id: "cat_1",
  category_name: "Category",
  ...overrides,
});

describe("aggregateInventorySales", () => {
  it("sums shipped quantities per SKU into sold_quantity", () => {
    const items = [item({ sku: "SKU-1" })];
    const sales: LineItemSale[] = [
      { variant_sku: "SKU-1", shipped_quantity: 2 },
      { variant_sku: "SKU-1", shipped_quantity: 3 },
    ];

    const { rows } = aggregateInventorySales(items, sales);

    expect(rows[0].sold_quantity).toBe(5);
  });

  it("defaults sold_quantity to 0 when no sales match the SKU", () => {
    const items = [item({ sku: "SKU-1" })];

    const { rows } = aggregateInventorySales(items, []);

    expect(rows[0].sold_quantity).toBe(0);
  });

  it("ignores sales with a null variant_sku", () => {
    const items = [item({ sku: "SKU-1" })];
    const sales: LineItemSale[] = [{ variant_sku: null, shipped_quantity: 5 }];

    const { rows } = aggregateInventorySales(items, sales);

    expect(rows[0].sold_quantity).toBe(0);
  });

  it("filters rows by category_id", () => {
    const items = [
      item({ id: "a", sku: "SKU-A", category_id: "cat_1" }),
      item({ id: "b", sku: "SKU-B", category_id: "cat_2" }),
    ];

    const { rows } = aggregateInventorySales(items, [], { categoryId: "cat_2" });

    expect(rows.map((r) => r.id)).toEqual(["b"]);
  });

  it("filters rows by weight", () => {
    const items = [
      item({ id: "a", sku: "SKU-A", weight: "5g" }),
      item({ id: "b", sku: "SKU-B", weight: "10g" }),
    ];

    const { rows } = aggregateInventorySales(items, [], { weight: "5g" });

    expect(rows.map((r) => r.id)).toEqual(["a"]);
  });

  it("combines category and weight filters", () => {
    const items = [
      item({ id: "a", sku: "SKU-A", category_id: "cat_1", weight: "5g" }),
      item({ id: "b", sku: "SKU-B", category_id: "cat_1", weight: "10g" }),
      item({ id: "c", sku: "SKU-C", category_id: "cat_2", weight: "5g" }),
    ];

    const { rows } = aggregateInventorySales(items, [], {
      categoryId: "cat_1",
      weight: "5g",
    });

    expect(rows.map((r) => r.id)).toEqual(["a"]);
  });

  it("computes totals across reserved, stocked, and sold quantities", () => {
    const items = [
      item({ id: "a", sku: "SKU-A", reserved_quantity: 1, stocked_quantity: 100 }),
      item({ id: "b", sku: "SKU-B", reserved_quantity: 2, stocked_quantity: 200 }),
    ];
    const sales: LineItemSale[] = [
      { variant_sku: "SKU-A", shipped_quantity: 4 },
      { variant_sku: "SKU-B", shipped_quantity: 6 },
    ];

    const { totals } = aggregateInventorySales(items, sales);

    expect(totals).toEqual({ reserved: 3, stocked: 300, sold: 10 });
  });

  it("computes totals only across the filtered rows", () => {
    const items = [
      item({ id: "a", sku: "SKU-A", category_id: "cat_1", reserved_quantity: 1, stocked_quantity: 100 }),
      item({ id: "b", sku: "SKU-B", category_id: "cat_2", reserved_quantity: 2, stocked_quantity: 200 }),
    ];

    const { totals } = aggregateInventorySales(items, [], { categoryId: "cat_1" });

    expect(totals).toEqual({ reserved: 1, stocked: 100, sold: 0 });
  });

  it("does not mutate the input items array", () => {
    const items = [item({ sku: "SKU-1" })];
    const snapshot = JSON.parse(JSON.stringify(items));

    aggregateInventorySales(items, [{ variant_sku: "SKU-1", shipped_quantity: 5 }]);

    expect(items).toEqual(snapshot);
  });
});

describe("mapInventoryItemToRow", () => {
  it("pulls weight, product title, and category from the first variant", () => {
    const row = mapInventoryItemToRow({
      id: "iitem_1",
      sku: "RAPE-NUKINI-5G",
      title: "5g",
      reserved_quantity: 2,
      stocked_quantity: 100,
      variants: [
        {
          title: "5g",
          product: {
            title: "Nukini Sansara",
            categories: [{ id: "cat_1", name: "Rapé" }],
          },
        },
      ],
    });

    expect(row).toEqual({
      id: "iitem_1",
      sku: "RAPE-NUKINI-5G",
      title: "5g",
      reserved_quantity: 2,
      stocked_quantity: 100,
      weight: "5g",
      product_title: "Nukini Sansara",
      category_id: "cat_1",
      category_name: "Rapé",
    });
  });

  it("defaults missing fields to null or 0 when no variant is linked", () => {
    const row = mapInventoryItemToRow({ id: "iitem_1" });

    expect(row).toEqual({
      id: "iitem_1",
      sku: null,
      title: null,
      reserved_quantity: 0,
      stocked_quantity: 0,
      weight: null,
      product_title: null,
      category_id: null,
      category_name: null,
    });
  });

  it("defaults category fields to null when the product has no categories", () => {
    const row = mapInventoryItemToRow({
      id: "iitem_1",
      variants: [{ title: "10g", product: { title: "Product", categories: [] } }],
    });

    expect(row.category_id).toBeNull();
    expect(row.category_name).toBeNull();
  });
});

describe("mapOrdersToSales", () => {
  it("flattens line items across multiple orders", () => {
    const sales = mapOrdersToSales([
      {
        items: [
          { variant_sku: "SKU-A", detail: { shipped_quantity: 2 } },
          { variant_sku: "SKU-B", detail: { shipped_quantity: 1 } },
        ],
      },
      {
        items: [{ variant_sku: "SKU-A", detail: { shipped_quantity: 3 } }],
      },
    ]);

    expect(sales).toEqual([
      { variant_sku: "SKU-A", shipped_quantity: 2 },
      { variant_sku: "SKU-B", shipped_quantity: 1 },
      { variant_sku: "SKU-A", shipped_quantity: 3 },
    ]);
  });

  it("defaults shipped_quantity to 0 when detail is missing", () => {
    const sales = mapOrdersToSales([{ items: [{ variant_sku: "SKU-A" }] }]);

    expect(sales).toEqual([{ variant_sku: "SKU-A", shipped_quantity: 0 }]);
  });

  it("returns an empty array for orders with no items", () => {
    const sales = mapOrdersToSales([{}, { items: [] }]);

    expect(sales).toEqual([]);
  });
});
