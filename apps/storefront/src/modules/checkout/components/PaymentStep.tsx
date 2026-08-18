import { sdk } from "@lib/sdk";
import { completeCart, initPaymentSession } from "@lib/stores/cart";
import { convertToLocale } from "@lib/utils/money";
import type { StoreCart, StorePaymentProvider } from "@medusajs/types";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { LucideIcon, type IconName } from "@components/icons/LucideIcons";
import { PayPalCardFields } from "./PayPalCardFields";
import { useEffect, useState } from "react";

interface PaymentStepProps {
  cart: StoreCart;
  countryCode: string;
  mode: "edit" | "inactive";
  onEdit?: () => void;
}

const ALL_PAYMENT_PROVIDERS: StorePaymentProvider[] = [
  { id: "paypal_card", is_enabled: true } as StorePaymentProvider,
  { id: "paypal", is_enabled: true } as StorePaymentProvider,
  { id: "bank-transfer", is_enabled: true } as StorePaymentProvider,
  { id: "pp_system_default", is_enabled: true } as StorePaymentProvider,
];

function isPayPalCardProvider(providerId: string): boolean {
  return providerId === "paypal_card" || providerId.startsWith("pp_stripe_");
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
  if (isPayPalCardProvider(providerId)) return "Credit / Debit Card (Visa, Mastercard, Amex)";
  if (isPayPalProvider(providerId)) return "PayPal Express (Account & Pay Later)";
  if (isBankTransferProvider(providerId)) return "Bank Transfer (SEPA / SWIFT)";
  if (isSystemDefaultProvider(providerId)) return "Direct Order / Invoice Payment";
  return providerId
    .replace(/^pp_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getProviderIconName(providerId: string): IconName {
  if (isPayPalCardProvider(providerId)) return "credit-card";
  if (isPayPalProvider(providerId)) return "wallet";
  if (isBankTransferProvider(providerId)) return "landmark";
  if (isSystemDefaultProvider(providerId)) return "file-text";
  return "credit-card";
}

export const PaymentStep = ({
  cart,
  countryCode,
  mode,
}: PaymentStepProps) => {
  const [paymentProviders, setPaymentProviders] = useState<StorePaymentProvider[]>(ALL_PAYMENT_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("paypal_card");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");

  const paypalClientId =
    import.meta.env.PUBLIC_PAYPAL_CLIENT_ID ||
    import.meta.env.PAYPAL_CLIENT_ID ||
    "test";
  const currencyCode = (cart.currency_code || "EUR").toUpperCase();

  useEffect(() => {
    if (mode !== "edit") return;

    const fetchProviders = async () => {
      setIsLoading(true);
      setError("");
      try {
        await sdk.store.payment.listPaymentProviders({
          region_id: cart.region_id!,
        });

        setPaymentProviders(ALL_PAYMENT_PROVIDERS);

        const existingProviderId =
          cart.payment_collection?.payment_sessions?.[0]?.provider_id;
        if (existingProviderId && ALL_PAYMENT_PROVIDERS.some((p) => p.id === existingProviderId)) {
          setSelectedProviderId(existingProviderId);
        } else {
          setSelectedProviderId("paypal_card");
          handleProviderChange("paypal_card");
        }
      } catch (err) {
        console.warn("Using standard payment options:", err);
        setPaymentProviders(ALL_PAYMENT_PROVIDERS);
        setSelectedProviderId("paypal_card");
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
      const targetProvider = (isBankTransferProvider(providerId) || isPayPalProvider(providerId) || isPayPalCardProvider(providerId))
        ? "pp_system_default"
        : providerId;
      await initPaymentSession(targetProvider);
    } catch (err) {
      console.warn("Payment session notice:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceOrder = async (skipValidation = false) => {
    setIsPlacing(true);
    setError("");
    try {
      if (!cart.payment_collection?.payment_sessions?.length) {
        try {
          await initPaymentSession("pp_system_default");
        } catch (e) {
          console.warn("Auto init payment session notice:", e);
        }
      }

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
            {paymentProviders.map((provider) => {
              const isSelected = selectedProviderId === provider.id;
              return (
                <label
                  key={provider.id}
                  className={`flex items-center justify-between border rounded-2xl p-4.5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/5 shadow-md ring-1 ring-[var(--color-accent-gold)]"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-accent-gold)]/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? "border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]"
                        : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-slate-950" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment_provider"
                      value={provider.id}
                      checked={isSelected}
                      onChange={() => handleProviderChange(provider.id)}
                      className="sr-only"
                    />
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {formatProviderName(provider.id)}
                    </span>
                  </div>
                  <LucideIcon name={getProviderIconName(provider.id)} size={20} className="text-[var(--color-text-secondary)] shrink-0" />
                </label>
              );
            })}
          </div>
        )}

        {/* Option 1: Credit / Debit Card via PayPal Hosted Fields */}
        {isPayPalCardProvider(selectedProviderId) && (
          <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center shrink-0 border border-[var(--color-accent-gold)]/20">
                  <LucideIcon name="credit-card" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    Card Payment (Visa, Mastercard, Amex)
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Enter your card details securely directly on this page
                  </p>
                </div>
              </div>
            </div>

            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                currency: currencyCode,
                intent: "capture",
                components: "buttons,card-fields",
              }}
            >
              <PayPalCardFields
                cartTotal={cart.total || 0}
                currencyCode={currencyCode}
                isPlacing={isPlacing}
                onPlaceOrder={handlePlaceOrder}
                onError={(msg) => setError(msg)}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Option 2: PayPal Express Checkout (Smart Buttons) */}
        {isPayPalProvider(selectedProviderId) && (
          <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center shrink-0 border border-[var(--color-accent-gold)]/20">
                  <LucideIcon name="wallet" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">PayPal Express Checkout</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Pay securely using your PayPal account, balance or linked cards</p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <PayPalScriptProvider
                options={{
                  clientId: paypalClientId,
                  currency: currencyCode,
                  intent: "capture",
                  components: "buttons,card-fields",
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical", shape: "pill", color: "gold", height: 45 }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            currency_code: currencyCode,
                            value: Number(cart.total || 0).toFixed(2),
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
                    setError("PayPal notice: Click 'Place Sacred Order' below to proceed with order.");
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}

        {/* Option 3: Bank Transfer (SEPA / SWIFT) */}
        {isBankTransferProvider(selectedProviderId) && (
          <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center shrink-0 border border-[var(--color-accent-gold)]/20">
                <LucideIcon name="landmark" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Bank Transfer (SEPA / SWIFT)</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Transfer payment directly to our Revolut Business account</p>
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-xs bg-[var(--color-bg-surface-elevated)] rounded-2xl p-5 border border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)] font-medium">Bank Name:</span>
              <span className="text-[var(--color-text-primary)] font-bold">Revolut Business</span>

              <span className="text-[var(--color-text-muted)] font-medium">Account Holder:</span>
              <span className="text-[var(--color-text-primary)] font-bold">Ayni Rapé</span>

              <span className="text-[var(--color-text-muted)] font-medium">IBAN:</span>
              <span className="text-[var(--color-text-primary)] font-mono font-bold tracking-wide">LT60 3250 0867 2850 7633</span>

              <span className="text-[var(--color-text-muted)] font-medium">SWIFT / BIC:</span>
              <span className="text-[var(--color-text-primary)] font-mono font-bold">REVOLT21</span>

              <span className="text-[var(--color-text-muted)] font-medium">Total Amount:</span>
              <span className="text-[var(--color-accent-gold)] font-extrabold text-sm">
                {convertToLocale({ amount: cart.total || 0, currencyCode: cart.currency_code || "EUR" })}
              </span>

              <span className="text-[var(--color-text-muted)] font-medium">Payment Reference:</span>
              <span className="text-[var(--color-text-primary)] font-mono font-bold">{cart.id?.slice(-8)?.toUpperCase() || "—"}</span>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200">
              <LucideIcon name="alert-triangle" size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">
                <strong>Important:</strong> Please include the reference number <strong>{cart.id?.slice(-8)?.toUpperCase() || "—"}</strong> in your transfer memo. Orders ship upon payment verification.
              </p>
            </div>
          </div>
        )}

        {/* Option 4: Direct Order / Invoice Payment */}
        {isSystemDefaultProvider(selectedProviderId) && (
          <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center shrink-0 border border-[var(--color-accent-gold)]/20">
                <LucideIcon name="file-text" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Direct Order / Invoice Payment</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Place your order directly and receive payment instructions by email</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Main CTA button for non-card methods (or manual fallback) */}
        {!isPayPalCardProvider(selectedProviderId) && (
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
