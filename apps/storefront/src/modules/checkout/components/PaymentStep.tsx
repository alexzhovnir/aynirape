import { sdk } from "@lib/sdk";
import { completeCart, initPaymentSession } from "@lib/stores/cart";
import type { StoreCart, StorePaymentProvider } from "@medusajs/types";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";

interface PaymentStepProps {
  cart: StoreCart;
  countryCode: string;
  mode: "edit" | "inactive";
  onEdit?: () => void;
}

const DEFAULT_PAYMENT_PROVIDERS: StorePaymentProvider[] = [
  { id: "pp_system_default", is_enabled: true } as StorePaymentProvider,
  { id: "bank-transfer", is_enabled: true } as StorePaymentProvider,
  { id: "pp_stripe_stripe", is_enabled: true } as StorePaymentProvider,
  { id: "paypal", is_enabled: true } as StorePaymentProvider,
];

function isStripeProvider(providerId: string): boolean {
  return providerId.startsWith("pp_stripe_");
}

function isPayPalProvider(providerId: string): boolean {
  return providerId === "paypal";
}

function isBankTransferProvider(providerId: string): boolean {
  return providerId === "bank-transfer";
}

function isSystemDefaultProvider(providerId: string): boolean {
  return providerId === "pp_system_default";
}

function formatProviderName(providerId: string): string {
  if (isStripeProvider(providerId)) return "Credit / Debit Card (Stripe)";
  if (isPayPalProvider(providerId)) return "PayPal Express";
  if (isBankTransferProvider(providerId)) return "Bank Transfer (SEPA / SWIFT)";
  if (isSystemDefaultProvider(providerId)) return "Direct Order / Invoice Payment";
  return providerId
    .replace(/^pp_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getProviderIcon(providerId: string) {
  if (isStripeProvider(providerId)) return "💳";
  if (isPayPalProvider(providerId)) return "🅿️";
  if (isBankTransferProvider(providerId)) return "🏦";
  if (isSystemDefaultProvider(providerId)) return "📜";
  return "💰";
}

export const PaymentStep = ({
  cart,
  countryCode,
  mode,
}: PaymentStepProps) => {
  const [paymentProviders, setPaymentProviders] = useState<StorePaymentProvider[]>(DEFAULT_PAYMENT_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("pp_system_default");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (mode !== "edit") return;

    const fetchProviders = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { payment_providers } = await sdk.store.payment.listPaymentProviders({
          region_id: cart.region_id!,
        });

        let available = payment_providers && payment_providers.length > 0
          ? payment_providers
          : DEFAULT_PAYMENT_PROVIDERS;

        // Ensure bank-transfer & system-default are always options for seamless checkout
        if (!available.some((p) => p.id === "bank-transfer")) {
          available = [...available, { id: "bank-transfer", is_enabled: true } as StorePaymentProvider];
        }
        if (!available.some((p) => p.id === "pp_system_default")) {
          available = [{ id: "pp_system_default", is_enabled: true } as StorePaymentProvider, ...available];
        }

        setPaymentProviders(available);

        const existingProviderId =
          cart.payment_collection?.payment_sessions?.[0]?.provider_id;
        if (existingProviderId && available.some((p) => p.id === existingProviderId)) {
          setSelectedProviderId(existingProviderId);
        } else {
          const defaultId = available[0]?.id || "pp_system_default";
          setSelectedProviderId(defaultId);
          handleProviderChange(defaultId);
        }
      } catch (err) {
        console.error("Failed to load payment providers from backend, using fallbacks:", err);
        setPaymentProviders(DEFAULT_PAYMENT_PROVIDERS);
        setSelectedProviderId("pp_system_default");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [mode, cart.region_id]);

  const handleProviderChange = async (providerId: string) => {
    if (isSaving) return;
    setSelectedProviderId(providerId);
    setIsSaving(true);
    setError("");
    try {
      // Map custom frontend options to system payment session provider
      const targetProvider = isBankTransferProvider(providerId) ? "pp_system_default" : providerId;
      await initPaymentSession(targetProvider);
    } catch (err) {
      console.warn("Payment session init notice:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceOrder = async (skipStripe = false) => {
    setIsPlacing(true);
    setError("");
    try {
      if (!skipStripe && isStripeProvider(selectedProviderId) && stripe && elements) {
        const { error: stripeError } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });
        if (stripeError) {
          setError(stripeError.message ?? "Payment failed. Please try again.");
          return;
        }
      }

      // Ensure a payment session is active on cart before completing
      if (!cart.payment_collection?.payment_sessions?.length) {
        try {
          await initPaymentSession("pp_system_default");
        } catch (e) {
          console.warn("Auto init payment session notice:", e);
        }
      }

      // Save cart snapshot before completion
      try {
        sessionStorage.setItem("medusa_cart_snapshot", JSON.stringify(cart));
      } catch {}

      const result = await completeCart();
      if (result.type === "order" || result.type === "already_completed") {
        window.location.href = `/${countryCode}/order/confirmed`;
      } else {
        setError((result as any).error?.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Failed to place order:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (mode === "inactive") {
    return (
      <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 opacity-60">
        <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-muted)]">
          Step 3 &bull; Payment Details
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <span className="text-[var(--color-accent-gold)] font-bold tracking-[0.2em] text-[10px] uppercase block mb-1">
          STEP 3 OF 3 &bull; PAYMENT METHOD
        </span>
        <h2 className="text-2xl font-serif-heading font-bold text-[var(--color-text-primary)]">
          Complete Sacred Order
        </h2>
      </div>

      <div className="space-y-6">
        {isLoading && (
          <p className="text-xs text-[var(--color-text-muted)] animate-pulse">
            Loading payment options...
          </p>
        )}

        {!isLoading && paymentProviders.length > 0 && (
          <div className="space-y-3">
            {paymentProviders.map((provider) => (
              <label
                key={provider.id}
                className={`flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-all ${
                  selectedProviderId === provider.id
                    ? "border-[var(--color-accent-gold)] bg-[var(--color-bg-surface)] shadow-sm"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-text-muted)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_provider"
                    value={provider.id}
                    checked={selectedProviderId === provider.id}
                    onChange={() => handleProviderChange(provider.id)}
                    className="w-4 h-4 accent-[var(--color-accent-gold)] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatProviderName(provider.id)}
                  </span>
                </div>
                <span className="text-lg" aria-hidden="true">{getProviderIcon(provider.id)}</span>
              </label>
            ))}
          </div>
        )}

        {isStripeProvider(selectedProviderId) &&
          cart.payment_collection?.payment_sessions?.some(
            (s) => s.provider_id === selectedProviderId,
          ) && (
            <div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl">
              <PaymentElement />
            </div>
          )}

        {isPayPalProvider(selectedProviderId) && (
          <div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl z-10 relative">
            <PayPalScriptProvider
              options={{
                clientId: import.meta.env.PUBLIC_PAYPAL_CLIENT_ID || "test",
                currency: "USD",
                intent: "capture"
              }}
            >
              <PayPalButtons
                style={{ layout: "vertical", shape: "pill", color: "gold" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "USD",
                          value: ((cart.total || 0) / 100).toFixed(2),
                        },
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    await actions.order.capture();
                  }
                  await handlePlaceOrder(true);
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  setError("PayPal payment failed. Please try again.");
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {isBankTransferProvider(selectedProviderId) && (
          <div className="p-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏦</span>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Bank Transfer Details</h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Please transfer the total amount to the following bank account. Your order will be processed once we confirm receipt of the payment (usually within 1–2 business days).
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs bg-stone-950/30 rounded-xl p-4 border border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)] font-medium">Bank:</span>
              <span className="text-[var(--color-text-primary)] font-semibold">Revolut Business</span>
              <span className="text-[var(--color-text-muted)] font-medium">Account Holder:</span>
              <span className="text-[var(--color-text-primary)] font-semibold">Ayni Rapé</span>
              <span className="text-[var(--color-text-muted)] font-medium">IBAN:</span>
              <span className="text-[var(--color-text-primary)] font-mono font-semibold tracking-wide">LT60 3250 0867 2850 7633</span>
              <span className="text-[var(--color-text-muted)] font-medium">SWIFT/BIC:</span>
              <span className="text-[var(--color-text-primary)] font-mono font-semibold">REVOLT21</span>
              <span className="text-[var(--color-text-muted)] font-medium">Amount:</span>
              <span className="text-[var(--color-accent-gold)] font-bold">€{((cart.total || 0) / 100).toFixed(2)}</span>
              <span className="text-[var(--color-text-muted)] font-medium">Reference:</span>
              <span className="text-[var(--color-text-primary)] font-mono font-semibold">{cart.id?.slice(-8)?.toUpperCase() || "—"}</span>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
              <p className="text-[10px] text-amber-300/80 leading-relaxed">
                <strong>Important:</strong> Please include the reference number in your transfer. Orders without a reference may experience delays.
              </p>
            </div>
          </div>
        )}

        {isSystemDefaultProvider(selectedProviderId) && (
          <div className="p-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📜</span>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Direct Invoice / Order Confirmation</h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Place your order directly. Our team will verify availability and send payment instructions or an invoice via email.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {!isPayPalProvider(selectedProviderId) && (
          <button
            type="button"
            disabled={!selectedProviderId || isSaving || isPlacing}
            onClick={() => handlePlaceOrder(false)}
            className="w-full py-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >
            <span>{isPlacing ? "Processing Order..." : "Place Sacred Order"}</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
};
