import { convertToLocale } from "@lib/utils/money";
import type { StoreCart } from "@medusajs/types";

interface OrderSummaryProps {
  cart: StoreCart;
}

export const OrderSummary = ({ cart }: OrderSummaryProps) => {
  const currencyCode = cart.currency_code || "USD";

  return (
    <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-8">
      <div>
        <span className="text-[var(--color-accent-gold)] font-bold tracking-[0.2em] text-[10px] uppercase block mb-1">
          SUMMARY
        </span>
        <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-primary)]">
          In Your Cart
        </h2>
      </div>

      <div className="space-y-3 pb-4 border-b border-[var(--color-border-subtle)] text-xs">
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Subtotal (excl. shipping & taxes)</span>
          <span className="font-semibold text-[var(--color-text-primary)]">
            {convertToLocale({ amount: cart.item_subtotal || 0, currencyCode })}
          </span>
        </div>

        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Shipping</span>
          <span className="font-semibold text-[var(--color-text-primary)]">
            {cart.shipping_total === 0 ? (
              <span className="text-[var(--color-accent-gold)] font-bold">FREE</span>
            ) : (
              convertToLocale({
                amount: cart.shipping_total || 0,
                currencyCode,
              })
            )}
          </span>
        </div>

        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Taxes</span>
          <span className="font-semibold text-[var(--color-text-primary)]">
            {convertToLocale({ amount: cart.tax_total || 0, currencyCode })}
          </span>
        </div>

        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex justify-between items-baseline font-bold text-base">
          <span className="text-[var(--color-text-primary)] font-serif-heading text-lg">Total</span>
          <span className="text-xl font-bold text-[var(--color-accent-gold)] font-serif-heading">
            {convertToLocale({ amount: cart.total || 0, currencyCode })}
          </span>
        </div>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto scrollbar-none pr-1">
        {cart.items?.map((item) => {
          const thumbnailUrl =
            item.variant?.product?.thumbnail ||
            item.variant?.product?.images?.[0]?.url;
          const productTitle = item.variant?.product?.title || "Product";
          const variantTitle = item.variant?.title || "";
          const unitPrice = item.unit_price || 0;
          const quantity = item.quantity || 1;
          const lineTotal = unitPrice * quantity;

          return (
            <div key={item.id} className="flex gap-3 bg-[var(--color-bg-surface)] p-3 rounded-2xl border border-[var(--color-border-subtle)] items-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={productTitle}
                  className="w-14 h-14 object-cover rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 bg-[var(--color-bg-surface-elevated)] rounded-xl border border-[var(--color-border-subtle)] shrink-0 flex items-center justify-center text-[var(--color-accent-gold)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925-3.546 5.974 5.974 0 0 0-2.133-1A3.75 3.75 0 0 0 4.5 12a3.75 3.75 0 0 0 3.75 3.75h3.75Z" />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[var(--color-text-primary)] truncate">{productTitle}</p>
                {variantTitle && (
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    Variant: {variantTitle}
                  </p>
                )}
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-[var(--color-text-muted)]">
                    {quantity}x{" "}
                    {convertToLocale({ amount: unitPrice, currencyCode })}
                  </span>
                  <span className="font-bold text-[var(--color-accent-gold)]">
                    {convertToLocale({ amount: lineTotal, currencyCode })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
