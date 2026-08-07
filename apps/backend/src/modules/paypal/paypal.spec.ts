import PaypalProviderService from "./service";

describe("PaypalProviderService", () => {
  let service: PaypalProviderService;

  beforeEach(() => {
    service = new PaypalProviderService({}, {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      sandbox: true,
    });
  });

  it("initiates payment successfully", async () => {
    const res = await service.initiatePayment({ amount: 100 });
    expect(res.data).toBeDefined();
    expect(res.data.status).toBe("pending");
    expect(res.data.id).toMatch(/^paypal_order_/);
  });

  it("authorizes payment successfully", async () => {
    const res = await service.authorizePayment({ id: "paypal_123" });
    expect(res.status).toBe("authorized");
  });

  it("captures payment successfully", async () => {
    const res = await service.capturePayment({ id: "paypal_123" });
    expect(res.status).toBe("captured");
  });

  it("cancels payment successfully", async () => {
    const res = await service.cancelPayment({ id: "paypal_123" });
    expect(res.status).toBe("canceled");
  });
});
