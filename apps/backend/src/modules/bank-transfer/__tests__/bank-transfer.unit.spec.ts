import BankTransferProviderService from "../service";

describe("BankTransferProviderService", () => {
  let service: BankTransferProviderService;

  beforeEach(() => {
    service = new BankTransferProviderService({}, {
      bankName: "Revolut Business",
      iban: "LT60 3250 0867 2850 7633",
      swift: "REVOLT21",
      accountHolder: "Ayni Rapé",
    });
  });

  it("initiates bank transfer payment with bank details", async () => {
    const res = await service.initiatePayment({ amount: 50 });
    expect(res.data).toBeDefined();
    expect(res.data.bank_name).toBe("Revolut Business");
    expect(res.data.iban).toBe("LT60 3250 0867 2850 7633");
    expect(res.data.swift).toBe("REVOLT21");
    expect(res.data.account_holder).toBe("Ayni Rapé");
    expect(res.data.status).toBe("pending");
  });

  it("authorizes bank transfer payment with pending flag", async () => {
    const res = await service.authorizePayment({ id: "bank_123" });
    expect(res.status).toBe("authorized");
    expect(res.data.bank_transfer_pending).toBe(true);
  });

  it("captures payment when transfer is confirmed", async () => {
    const res = await service.capturePayment({ id: "bank_123" });
    expect(res.status).toBe("captured");
  });
});
