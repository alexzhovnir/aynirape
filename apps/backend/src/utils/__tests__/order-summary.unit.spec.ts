import { toOrderSummary } from "../order-summary";

describe("toOrderSummary", () => {
  it("maps the raw order fields onto the summary shape", () => {
    const summary = toOrderSummary({
      id: "order_1",
      display_id: 42,
      email: "buyer@example.com",
      status: "pending",
      fulfillment_status: "shipped",
      payment_status: "captured",
    });

    expect(summary).toEqual({
      id: "order_1",
      display_id: 42,
      email: "buyer@example.com",
      status: "pending",
      fulfillment_status: "shipped",
      payment_status: "captured",
    });
  });

  it("defaults email to null when missing", () => {
    const summary = toOrderSummary({
      id: "order_1",
      display_id: 1,
      status: "pending",
    });

    expect(summary.email).toBeNull();
  });

  it("defaults fulfillment_status to not_fulfilled when missing", () => {
    const summary = toOrderSummary({
      id: "order_1",
      display_id: 1,
      status: "pending",
    });

    expect(summary.fulfillment_status).toBe("not_fulfilled");
  });

  it("defaults payment_status to not_paid when missing", () => {
    const summary = toOrderSummary({
      id: "order_1",
      display_id: 1,
      status: "pending",
    });

    expect(summary.payment_status).toBe("not_paid");
  });
});
