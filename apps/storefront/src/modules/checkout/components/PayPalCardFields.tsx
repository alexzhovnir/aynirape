import {
  PayPalCardFieldsProvider,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  PayPalNameField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import { convertToLocale } from "@lib/utils/money";
import { LucideIcon } from "@components/icons/LucideIcons";
import { useState } from "react";

interface PayPalCardFieldsFormProps {
  cartTotal: number;
  currencyCode: string;
  isPlacing: boolean;
  onPlaceOrder: (skipStripe: boolean) => Promise<void>;
  onError: (msg: string) => void;
}

const CardSubmitButton = ({
  cartTotal,
  currencyCode,
  isPlacing,
}: {
  cartTotal: number;
  currencyCode: string;
  isPlacing: boolean;
}) => {
  const { cardFieldsForm } = usePayPalCardFields();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!cardFieldsForm) return;
    setIsSubmitting(true);
    try {
      await cardFieldsForm.submit();
    } catch (err) {
      console.error("Card submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting || isPlacing;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleSubmit}
      className="w-full py-4 mt-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2"
    >
      <span>
        {loading
          ? "Authorizing Card..."
          : `Pay ${convertToLocale({ amount: cartTotal, currencyCode })} with Card`}
      </span>
      <span>&rarr;</span>
    </button>
  );
};

export const PayPalCardFields = ({
  cartTotal,
  currencyCode,
  isPlacing,
  onPlaceOrder,
  onError,
}: PayPalCardFieldsFormProps) => {
  return (
    <PayPalCardFieldsProvider
      createOrder={async () => {
        const win = typeof window !== "undefined" ? (window as any) : null;
        if (win?.paypal?.order) {
          const order = await win.paypal.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: currencyCode.toUpperCase(),
                  value: Number(cartTotal || 0).toFixed(2),
                },
              },
            ],
          });
          return order.id;
        }
        return `pp_order_${Date.now()}`;
      }}
      onApprove={async () => {
        await onPlaceOrder(true);
      }}
      onError={(err) => {
        console.error("PayPal Card Fields Error:", err);
        onError(
          "Card processing error with PayPal. You can also place the order directly and receive payment instructions."
        );
      }}
      style={{
        input: {
          "font-size": "14px",
          "font-family": "system-ui, -apple-system, sans-serif",
          color: "inherit",
        },
        ":focus": {
          color: "#d4af37",
        },
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Cardholder Name
          </label>
          <div className="w-full bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-gold)] rounded-xl px-3.5 py-2.5 min-h-[44px] transition-colors flex items-center">
            <PayPalNameField className="w-full" placeholder="John Doe" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Card Number
          </label>
          <div className="w-full bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-gold)] rounded-xl px-3.5 py-2.5 min-h-[44px] transition-colors flex items-center">
            <PayPalNumberField className="w-full" placeholder="•••• •••• •••• ••••" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Expiry Date
            </label>
            <div className="w-full bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-gold)] rounded-xl px-3.5 py-2.5 min-h-[44px] transition-colors flex items-center">
              <PayPalExpiryField className="w-full" placeholder="MM/YY" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Security Code (CVV)
            </label>
            <div className="w-full bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-gold)] rounded-xl px-3.5 py-2.5 min-h-[44px] transition-colors flex items-center">
              <PayPalCVVField className="w-full" placeholder="CVC" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] pt-1">
          <LucideIcon name="lock" size={13} className="text-[var(--color-accent-gold)]" />
          <span>Secured with 256-bit SSL encryption via PayPal Card Services</span>
        </div>

        <CardSubmitButton
          cartTotal={cartTotal}
          currencyCode={currencyCode}
          isPlacing={isPlacing}
        />
      </div>
    </PayPalCardFieldsProvider>
  );
};
