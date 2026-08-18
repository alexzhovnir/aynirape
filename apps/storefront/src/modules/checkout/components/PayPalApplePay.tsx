import { useEffect, useState } from "react";
import { convertToLocale } from "@lib/utils/money";
import type { StoreCart } from "@medusajs/types";

interface PayPalApplePayProps {
  cart: StoreCart;
  countryCode: string;
  isPlacing: boolean;
  onPlaceOrder: (skipValidation: boolean) => Promise<void>;
  onError: (msg: string) => void;
}

export const PayPalApplePay = ({
  cart,
  countryCode,
  isPlacing,
  onPlaceOrder,
  onError,
}: PayPalApplePayProps) => {
  const [isEligible, setIsEligible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is supported on this browser/device
    if (typeof window !== "undefined" && (window as any).ApplePaySession) {
      try {
        const canPay = (window as any).ApplePaySession.canMakePayments();
        setIsEligible(Boolean(canPay));
      } catch {
        setIsEligible(false);
      }
    }
  }, []);

  const handleApplePayClick = async () => {
    if (typeof window === "undefined" || !(window as any).ApplePaySession) {
      onError("Apple Pay is not supported on this device/browser.");
      return;
    }

    const win = window as any;
    if (!win.paypal?.Applepay) {
      onError("PayPal Apple Pay service is initializing. Please try again in a moment.");
      return;
    }

    setIsProcessing(true);

    try {
      const applepay = win.paypal.Applepay();
      const {
        isEligible: applePayEligible,
        countryCode: merchantCountry,
        currencyCode: merchantCurrency,
        merchantCapabilities,
        supportedNetworks,
      } = await applepay.config();

      if (!applePayEligible) {
        setIsProcessing(false);
        onError("Apple Pay is not eligible for this transaction.");
        return;
      }

      const totalAmount = Number(cart.total || 0).toFixed(2);
      const curr = (cart.currency_code || merchantCurrency || "EUR").toUpperCase();
      const country = (countryCode || merchantCountry || "DE").toUpperCase();

      const paymentRequest = {
        countryCode: country,
        currencyCode: curr,
        merchantCapabilities: merchantCapabilities || ["supports3DS"],
        supportedNetworks: supportedNetworks || ["visa", "masterCard", "amex", "discover", "maestro"],
        requiredBillingContactFields: ["name", "postalAddress"],
        total: {
          label: "Ayni Rapé",
          type: "final",
          amount: totalAmount,
        },
      };

      const session = new win.ApplePaySession(4, paymentRequest);

      session.onvalidatemerchant = async (event: any) => {
        try {
          const { merchantSession } = await applepay.validateMerchant({
            validationUrl: event.validationURL,
            displayName: "Ayni Rapé",
          });
          session.completeMerchantValidation(merchantSession);
        } catch (valErr) {
          console.error("Apple Pay Merchant Validation Error:", valErr);
          session.abort();
          setIsProcessing(false);
          onError("Apple Pay merchant validation failed. Please check domain registration.");
        }
      };

      session.onpaymentauthorized = async (event: any) => {
        try {
          // 1. Create PayPal Order
          const order = await win.paypal.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: curr,
                  value: totalAmount,
                },
              },
            ],
          });

          // 2. Confirm order with Apple Pay Token via PayPal
          await applepay.confirmOrder({
            orderId: order.id,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
          });

          session.completePayment(win.ApplePaySession.STATUS_SUCCESS);
          await onPlaceOrder(true);
        } catch (authErr) {
          console.error("Apple Pay Authorization Error:", authErr);
          session.completePayment(win.ApplePaySession.STATUS_FAILURE);
          setIsProcessing(false);
          onError("Apple Pay payment authorization failed. Please try another payment method.");
        }
      };

      session.oncancel = () => {
        setIsProcessing(false);
      };

      session.begin();
    } catch (err: any) {
      console.error("Failed to start Apple Pay session:", err);
      setIsProcessing(false);
      onError(err?.message || "Failed to start Apple Pay.");
    }
  };

  if (!isEligible) {
    return null;
  }

  const loading = isProcessing || isPlacing;

  return (
    <div className="pt-2 pb-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleApplePayClick}
        className="w-full h-12 bg-black hover:bg-stone-900 text-white font-medium rounded-full transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Pay with Apple Pay"
      >
        <span className="text-xl leading-none"></span>
        <span className="text-sm font-semibold tracking-wide">
          {loading
            ? "Processing..."
            : `Pay with Apple Pay (${convertToLocale({
                amount: cart.total || 0,
                currencyCode: cart.currency_code || "EUR",
              })})`}
        </span>
      </button>
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-[var(--color-border-subtle)]"></div>
        <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
          or pay with card below
        </span>
        <div className="flex-grow border-t border-[var(--color-border-subtle)]"></div>
      </div>
    </div>
  );
};
