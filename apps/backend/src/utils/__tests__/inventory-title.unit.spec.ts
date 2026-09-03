import {
  buildInventoryItemTitle,
  formatVariantOptions,
} from "../inventory-title";

describe("buildInventoryItemTitle", () => {
  it("combines product and variant titles", () => {
    expect(buildInventoryItemTitle("Nukini Sansara", "20g")).toBe(
      "Nukini Sansara — 20g"
    );
  });

  it("drops a placeholder 'Default' variant title", () => {
    expect(buildInventoryItemTitle("Kuripe Standard", "Default")).toBe(
      "Kuripe Standard"
    );
    expect(buildInventoryItemTitle("Kuripe Standard", "default")).toBe(
      "Kuripe Standard"
    );
  });

  it("falls back to the product title when the variant title is missing", () => {
    expect(buildInventoryItemTitle("Palo Santo", null)).toBe("Palo Santo");
    expect(buildInventoryItemTitle("Palo Santo", "  ")).toBe("Palo Santo");
  });

  it("falls back to the variant title when the product title is missing", () => {
    expect(buildInventoryItemTitle(null, "20g")).toBe("20g");
  });

  it("returns null when neither title is available", () => {
    expect(buildInventoryItemTitle(null, null)).toBeNull();
    expect(buildInventoryItemTitle("", "")).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(buildInventoryItemTitle("  Huni Kuin  ", "  5g  ")).toBe(
      "Huni Kuin — 5g"
    );
  });
});

describe("formatVariantOptions", () => {
  it("renders a single labelled option", () => {
    expect(
      formatVariantOptions([{ value: "20g", option: { title: "Weight" } }])
    ).toBe("Weight: 20g");
  });

  it("joins several options", () => {
    expect(
      formatVariantOptions([
        { value: "20g", option: { title: "Weight" } },
        { value: "Red", option: { title: "Color" } },
        { value: "Teak", option: { title: "Material" } },
      ])
    ).toBe("Weight: 20g · Color: Red · Material: Teak");
  });

  it("falls back to the bare value when the option has no title", () => {
    expect(formatVariantOptions([{ value: "20g" }])).toBe("20g");
  });

  it("skips options without a value", () => {
    expect(
      formatVariantOptions([
        { value: "20g", option: { title: "Weight" } },
        { value: null, option: { title: "Color" } },
        { value: "  ", option: { title: "Material" } },
      ])
    ).toBe("Weight: 20g");
  });

  it("returns an empty string when there are no options", () => {
    expect(formatVariantOptions([])).toBe("");
    expect(formatVariantOptions(null)).toBe("");
    expect(formatVariantOptions(undefined)).toBe("");
  });
});
