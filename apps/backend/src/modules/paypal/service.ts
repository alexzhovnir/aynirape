// @ts-nocheck
import { AbstractPaymentProvider } from "@medusajs/framework/utils";

export interface PaypalOptions {
  clientId: string;
  clientSecret: string;
  sandbox?: boolean;
}

export default class PaypalProviderService extends AbstractPaymentProvider<PaypalOptions> {
  static identifier = "paypal";
  protected options_: PaypalOptions;

  constructor(container: any, options: PaypalOptions) {
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
    return {
      status: "authorized",
      data: {
        ...input,
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
        id: `paypal_order_${Date.now()}`,
        status: "pending",
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

