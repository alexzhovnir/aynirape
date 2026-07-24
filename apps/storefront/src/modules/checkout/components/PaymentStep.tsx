import { sdk } from "@lib/sdk";
import { completeCart, initPaymentSession } from "@lib/stores/cart";
import type { StoreCart, StorePaymentProvider } from "@medusajs/types";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

interface PaymentStepProps {
  cart: StoreCart;
  countryCode: string;
  mode: "edit" | "inactive";
  onEdit?: () => void;
}

const CardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-[var(--color-accent-gold)]"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

function isStripeProvider(providerId: string): boolean {
  return providerId.startsWith("pp_stripe_");
}

function formatProviderName(providerId: string): string {
  if (providerId === "pp_system_default") return "Manual Payment";
  if (isStripeProvider(providerId)) return "Credit Card (Stripe)";
  return providerId
    .replace(/^pp_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isTestProvider(providerId: string): boolean {
  return providerId === "pp_system_default";
}

export const PaymentStep = ({
  cart,
  countryCode,
  mode,
}: PaymentStepProps) => {
  const [paymentProviders, setPaymentProviders] = useState<StorePaymentProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
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
        setPaymentProviders(payment_providers);

        const existingProviderId =
          cart.payment_collection?.payment_sessions?.[0]?.provider_id;
        if (existingProviderId) {
          setSelectedProviderId(existingProviderId);
        }
      } catch (err) {
        console.error("Failed to load payment providers:", err);
        setError("Failed to load payment options. Please try again.");
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
      await initPaymentSession(providerId);
    } catch (err) {
      console.error("Failed to initialize payment session:", err);
      setError("Failed to set payment method. Please try again.");
      const savedProviderId =
        cart.payment_collection?.payment_sessions?.[0]?.provider_id ?? "";
      setSelectedProviderId(savedProviderId);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setError("");
    try {
      if (isStripeProvider(selectedProviderId) && stripe && elements) {
        const { error: stripeError } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });
        if (stripeError) {
          setError(stripeError.message ?? "Payment failed. Please try again.");
          return;
        }
      }

      // Save cart snapshot before completion so the fallback confirmation
      // page can still display items, addresses, and totals on a 409.
      try {
        sessionStorage.setItem("medusa_cart_snapshot", JSON.stringify(cart));
      } catch {}

      const result = await completeCart();
      if (result.type === "order" || result.type === "already_completed") {
        window.location.href = `/${countryCode}/order/confirmed`;
      } else {
        setError(result.error.message || "Failed to place order. Please try again.");
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

        {!isLoading && paymentProviders.length === 0 && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">
            No payment options available.
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
                  {isTestProvider(provider.id) && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                      Test Mode
                    </span>
                  )}
                </div>
                <CardIcon />
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

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!selectedProviderId || isSaving || isPlacing}
          onClick={handlePlaceOrder}
          className="w-full py-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2"
        >
          <span>{isPlacing ? "Processing Order..." : "Place Sacred Order"}</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
