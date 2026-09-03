import { collectPaymentMethods, formatPaymentMethod } from "../payment-method";

describe("formatPaymentMethod", () => {
  it("labels the PayPal provider", () => {
    expect(formatPaymentMethod("pp_paypal_paypal")).toBe("PayPal");
    expect(formatPaymentMethod("paypal")).toBe("PayPal");
  });

  it("labels the bank transfer provider", () => {
    expect(formatPaymentMethod("pp_bank-transfer_bank-transfer")).toBe(
      "Bank transfer"
    );
  });

  it("labels the built-in system provider", () => {
    expect(formatPaymentMethod("pp_system_default")).toBe("Manual");
  });

  it("prettifies an unknown provider id", () => {
    expect(formatPaymentMethod("pp_stripe_card")).toBe("Stripe Card");
  });

  it("returns a dash for missing values", () => {
    expect(formatPaymentMethod(null)).toBe("—");
    expect(formatPaymentMethod(undefined)).toBe("—");
    expect(formatPaymentMethod("  ")).toBe("—");
  });
});

describe("collectPaymentMethods", () => {
  it("lists the method of a single payment", () => {
    expect(
      collectPaymentMethods([
        { payments: [{ provider_id: "pp_paypal_paypal" }] },
      ])
    ).toBe("PayPal");
  });

  it("deduplicates repeated methods", () => {
    expect(
      collectPaymentMethods([
        {
          payments: [
            { provider_id: "pp_paypal_paypal" },
            { provider_id: "pp_paypal_paypal" },
          ],
        },
      ])
    ).toBe("PayPal");
  });

  it("joins distinct methods across collections", () => {
    expect(
      collectPaymentMethods([
        { payments: [{ provider_id: "pp_paypal_paypal" }] },
        { payments: [{ provider_id: "pp_bank-transfer_bank-transfer" }] },
      ])
    ).toBe("PayPal, Bank transfer");
  });

  it("returns a dash when there are no payments", () => {
    expect(collectPaymentMethods([])).toBe("—");
    expect(collectPaymentMethods([{ payments: [] }])).toBe("—");
    expect(collectPaymentMethods(null)).toBe("—");
    expect(collectPaymentMethods(undefined)).toBe("—");
  });

  it("skips payments without a provider", () => {
    expect(
      collectPaymentMethods([{ payments: [{ provider_id: null }] }])
    ).toBe("—");
  });
});
