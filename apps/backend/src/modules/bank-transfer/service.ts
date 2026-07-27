// @ts-nocheck
import { AbstractPaymentProvider } from "@medusajs/framework/utils";

export interface BankTransferOptions {
  bankName?: string;
  iban?: string;
  swift?: string;
  accountHolder?: string;
}

export default class BankTransferProviderService extends AbstractPaymentProvider<BankTransferOptions> {
  static identifier = "bank-transfer";
  protected options_: BankTransferOptions;

  constructor(container: any, options: BankTransferOptions) {
    super(container, options);
    this.options_ = options;
  }

  async capturePayment(input: any): Promise<any> {
    return {
      ...input,
      status: "captured",
    };
  }

  async authorizePayment(input: any): Promise<any> {
    // Bank transfers are authorized manually after receiving the funds.
    // We mark the payment as "authorized" immediately so the order can be created,
    // and the merchant will capture it manually once the transfer arrives.
    return {
      status: "authorized",
      data: {
        ...input,
        bank_transfer_pending: true,
      },
    };
  }

  async cancelPayment(input: any): Promise<any> {
    return {
      ...input,
      status: "canceled",
    };
  }

  async initiatePayment(input: any): Promise<any> {
    return {
      data: {
        id: `bank_transfer_${Date.now()}`,
        status: "pending",
        bank_name: this.options_.bankName || "",
        iban: this.options_.iban || "",
        swift: this.options_.swift || "",
        account_holder: this.options_.accountHolder || "",
      },
    };
  }

  async deletePayment(input: any): Promise<any> {
    return {
      ...input,
      status: "deleted",
    };
  }

  async getPaymentStatus(input: any): Promise<any> {
    return "pending";
  }

  async refundPayment(input: any): Promise<any> {
    return {
      ...input,
      status: "refunded",
    };
  }

  async retrievePayment(input: any): Promise<any> {
    return input;
  }

  async updatePayment(input: any): Promise<any> {
    return {
      data: {
        ...input,
      },
    };
  }

  async getWebhookActionAndData(input: any): Promise<any> {
    return {
      action: "not_supported",
    };
  }
}
