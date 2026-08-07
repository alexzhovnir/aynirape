import { convertToLocale } from "@lib/utils/money";
import type { StoreCart } from "@medusajs/types";
import { useEffect, useState } from "react";

interface ConfirmedFallbackPageProps {
  countryCode: string;
}

function formatProviderName(providerId: string): string {
  if (providerId === "pp_system_default") return "Manual Payment";
  return providerId
    .replace(/^pp_/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const ConfirmedFallbackPage = ({
  countryCode,
}: ConfirmedFallbackPageProps) => {
  const [cart, setCart] = useState<StoreCart | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("medusa_cart_snapshot");
      if (raw) {
        setCart(JSON.parse(raw));
        sessionStorage.removeItem("medusa_cart_snapshot");
      }
    } catch {}
  }, []);

  const currency = cart?.currency_code ?? "usd";
  const paymentProviderId =
    cart?.payment_collection?.payment_sessions?.[0]?.provider_id;
  const shippingMethod = cart?.shipping_methods?.[0];
  const sameAddress =
    cart?.shipping_address &&
    cart?.billing_address &&
    cart.shipping_address.address_1 === cart.billing_address.address_1 &&
    cart.shipping_address.postal_code === cart.billing_address.postal_code;

  return (
    <main
      className="max-w-2xl mx-auto px-4 md:px-8 py-16 text-[var(--color-text-primary)]"
      aria-label="Order confirmation"
    >
      {/* Success header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-accent-gold)] rounded-full mb-6 shadow-md"
          aria-hidden="true"
        >
          <svg className="w-8 h-8 text-stone-950" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-serif-heading font-bold mb-3 text-[var(--color-text-primary)]">
          Thank you for your order!
        </h1>

        <p className="text-sm text-[var(--color-text-muted)]">
          Your order has been placed successfully.
          {cart?.email && (
            <>
              {" "}
              A confirmation email has been sent to{" "}
              <span className="font-medium text-[var(--color-text-secondary)]">
                {cart.email}
              </span>
            </>
          )}
        </p>
      </div>

      {cart && (
        <>
          {/* Order items */}
          <section aria-labelledby="items-heading" className="mb-8">
            <h2
              id="items-heading"
              className="text-lg font-serif-heading font-bold mb-4 text-[var(--color-text-primary)]"
            >
              Order Items
            </h2>
            <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] rounded-2xl overflow-hidden shadow-sm">
              {cart.items?.map((item) => {
                const thumbnailUrl =
                  item.variant?.product?.thumbnail ||
                  item.variant?.product?.images?.[0]?.url;

                const lineTotal = (item.unit_price ?? 0) * (item.quantity ?? 1);
                return (
                  <div key={item.id} className="flex gap-4 p-4">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] shrink-0 flex items-center justify-center text-lg">
                        🌿
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-[var(--color-text-primary)]">
                        {item.title}
                      </p>
                      {item.variant_title && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {item.variant_title}
                        </p>
                      )}
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-[var(--color-text-muted)]">
                          {item.quantity} ×{" "}
                          {convertToLocale({
                            amount: item.unit_price ?? 0,
                            currencyCode: currency,
                          })}
                        </span>
                        <span className="font-bold text-[var(--color-accent-gold)]">
                          {convertToLocale({
                            amount: lineTotal,
                            currencyCode: currency,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order summary */}
          <section aria-labelledby="summary-heading" className="mb-8">
            <h2
              id="summary-heading"
              className="text-lg font-serif-heading font-bold mb-4 text-[var(--color-text-primary)]"
            >
              Order Summary
            </h2>
            <div className="border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] rounded-2xl p-4 space-y-2 text-sm shadow-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {convertToLocale({
                    amount: cart.subtotal ?? 0,
                    currencyCode: currency,
                  })}
                </span>
              </div>

              {shippingMethod && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Shipping ({shippingMethod.name})
                  </span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {convertToLocale({
                      amount: cart.shipping_total ?? 0,
                      currencyCode: currency,
                    })}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Taxes</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {convertToLocale({
                    amount: cart.tax_total ?? 0,
                    currencyCode: currency,
                  })}
                </span>
              </div>

              {(cart.discount_total ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>
                    −
                    {convertToLocale({
                      amount: cart.discount_total ?? 0,
                      currencyCode: currency,
                    })}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-between items-baseline font-bold text-base">
                <span className="text-[var(--color-text-primary)] font-serif-heading text-lg">
                  Total
                </span>
                <span className="text-xl text-[var(--color-accent-gold)] font-serif-heading">
                  {convertToLocale({
                    amount: cart.total ?? 0,
                    currencyCode: currency,
                  })}
                </span>
              </div>
            </div>
          </section>

          {/* Delivery & payment */}
          <section aria-labelledby="delivery-heading" className="mb-8">
            <h2
              id="delivery-heading"
              className="text-lg font-serif-heading font-bold mb-4 text-[var(--color-text-primary)]"
            >
              Delivery &amp; Payment
            </h2>
            <div className="border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] rounded-2xl divide-y divide-[var(--color-border-subtle)] text-sm shadow-sm">
              {cart.shipping_address && (
                <div className="p-4">
                  <p className="font-semibold mb-1 text-[var(--color-text-primary)]">
                    Shipping Address
                  </p>
                  <address className="text-[var(--color-text-secondary)] not-italic leading-relaxed">
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                    <br />
                    {cart.shipping_address.address_1}
                    {cart.shipping_address.address_2 && (
                      <>
                        <br />
                        {cart.shipping_address.address_2}
                      </>
                    )}
                    <br />
                    {cart.shipping_address.postal_code},{" "}
                    {cart.shipping_address.city}
                    <br />
                    {(
                      cart.shipping_address as {
                        country?: { display_name?: string };
                      }
                    ).country?.display_name ??
                      cart.shipping_address.country_code?.toUpperCase()}
                  </address>
                </div>
              )}

              {cart.billing_address && (
                <div className="p-4">
                  <p className="font-semibold mb-1 text-[var(--color-text-primary)]">
                    Billing Address
                  </p>
                  {sameAddress ? (
                    <p className="text-[var(--color-text-secondary)]">
                      Same as shipping address
                    </p>
                  ) : (
                    <address className="text-[var(--color-text-secondary)] not-italic leading-relaxed">
                      {cart.billing_address.first_name}{" "}
                      {cart.billing_address.last_name}
                      <br />
                      {cart.billing_address.address_1}
                      <br />
                      {cart.billing_address.postal_code},{" "}
                      {cart.billing_address.city}
                    </address>
                  )}
                </div>
              )}

              {paymentProviderId && (
                <div className="p-4">
                  <p className="font-semibold mb-1 text-[var(--color-text-primary)]">
                    Payment
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    {formatProviderName(paymentProviderId)}
                  </p>
                  {paymentProviderId === "bank-transfer" && (
                    <div className="mt-4 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-accent-gold)]/40 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🏦</span>
                        <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                          Bank Transfer Details (SEPA / SWIFT)
                        </h4>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs bg-[var(--color-bg-surface-elevated)] p-3.5 rounded-xl border border-[var(--color-border-subtle)] font-mono">
                        <span className="text-[var(--color-text-muted)]">Bank Name:</span>
                        <span className="text-[var(--color-text-primary)] font-bold">Revolut Business</span>
                        <span className="text-[var(--color-text-muted)]">Holder:</span>
                        <span className="text-[var(--color-text-primary)] font-bold">Ayni Rapé</span>
                        <span className="text-[var(--color-text-muted)]">IBAN:</span>
                        <span className="text-[var(--color-text-primary)] font-bold">LT60 3250 0867 2850 7633</span>
                        <span className="text-[var(--color-text-muted)]">SWIFT/BIC:</span>
                        <span className="text-[var(--color-text-primary)] font-bold">REVOLT21</span>
                        <span className="text-[var(--color-text-muted)]">Memo Ref:</span>
                        <span className="text-[var(--color-accent-gold)] font-bold">{cart?.id?.slice(-8)?.toUpperCase() || "AYNI-ORDER"}</span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                        ⚠️ Please include reference <strong>{cart?.id?.slice(-8)?.toUpperCase() || "AYNI-ORDER"}</strong> in your bank memo. Your order will be dispatched as soon as payment is verified.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* What's next */}
          <section aria-labelledby="next-heading" className="mb-10">
            <h2
              id="next-heading"
              className="text-lg font-serif-heading font-bold mb-4 text-[var(--color-text-primary)]"
            >
              What happens next?
            </h2>
            <ol className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-gold)]/10 border border-[var(--color-border-accent)] text-[var(--color-accent-gold)] font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  <strong className="text-[var(--color-text-primary)]">
                    Order Processing
                  </strong>{" "}
                  — We&apos;re preparing your items for shipment.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-gold)]/10 border border-[var(--color-border-accent)] text-[var(--color-accent-gold)] font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  <strong className="text-[var(--color-text-primary)]">
                    Shipment Notification
                  </strong>{" "}
                  — You&apos;ll receive an email with tracking information when
                  your order ships.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-gold)]/10 border border-[var(--color-border-accent)] text-[var(--color-accent-gold)] font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  <strong className="text-[var(--color-text-primary)]">
                    Delivery
                  </strong>{" "}
                  — Your package will arrive at your shipping address.
                </span>
              </li>
            </ol>
          </section>
        </>
      )}

      {/* CTA */}
      <div className="text-center">
        <a
          href={`/${countryCode}/store`}
          className="inline-block bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold py-3.5 px-10 rounded-full transition-all duration-300 uppercase tracking-wider text-xs shadow-md"
        >
          Continue Shopping
        </a>
      </div>
    </main>
  );
};
