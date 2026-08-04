import {
  $cart,
  removeFromCart,
  updateLineItemQuantity,
} from "@lib/stores/cart";
import { convertToLocale } from "@lib/utils/money";
import { useStore } from "@nanostores/react";

interface CartPageProps {
  countryCode: string;
}

export const CartPage = ({ countryCode }: CartPageProps) => {
  const cart = useStore($cart);

  const handleRemoveItem = async (lineItemId: string) => {
    try {
      await removeFromCart(lineItemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleQuantityChange = async (
    lineItemId: string,
    newQuantity: number,
  ) => {
    try {
      await updateLineItemQuantity(lineItemId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const itemCount = cart?.items?.length ?? 0;
  const isEmpty = itemCount === 0;
  const currencyCode = cart?.currency_code || "USD";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-[var(--color-text-primary)]">
      {isEmpty ? (
        <div className="text-center py-16 bg-[var(--color-bg-surface-elevated)] rounded-3xl border border-[var(--color-border-subtle)] p-8">
          <h1 className="text-3xl font-serif-heading font-bold mb-4 text-[var(--color-text-primary)]">Your cart is empty</h1>
          <p className="text-[var(--color-text-muted)] mb-6">Start adding items to your cart</p>
          <a
            href={`/${countryCode}/store`}
            className="inline-block bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold py-3.5 px-8 rounded-full transition-all duration-300 uppercase tracking-wider text-xs shadow-md"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Cart items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-serif-heading font-bold mb-6 text-[var(--color-text-primary)]">Cart</h1>

            {/* Cart items table */}
            <div className="border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden bg-[var(--color-bg-surface-elevated)] shadow-sm">
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {cart?.items?.map((item) => {
                const thumbnailUrl =
                  item.variant?.product?.thumbnail ||
                  item.variant?.product?.images?.[0]?.url;
                const productTitle = item.variant?.product?.title || "Product";
                const variantTitle = item.variant?.title || "";
                const unitPrice = item.unit_price || 0;
                const quantity = item.quantity || 1;
                const lineTotal = unitPrice * quantity;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-border-subtle)] last:border-0 items-center"
                  >
                    {/* Item */}
                    <div className="col-span-12 md:col-span-5 flex gap-4 items-center">
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={productTitle}
                          className="w-16 h-16 object-cover rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 text-[var(--color-text-primary)]">{productTitle}</h3>
                        {variantTitle && (
                          <p className="text-xs text-[var(--color-text-muted)]">
                            Variant: {variantTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-6 md:col-span-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, quantity - 1)
                          }
                          className="w-10 h-10 shrink-0 flex items-center justify-center border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] rounded-lg hover:border-[var(--color-accent-gold)] text-[var(--color-text-primary)] transition-colors cursor-pointer text-lg"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <select
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="h-10 w-16 px-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-lg text-center font-medium cursor-pointer outline-none focus:border-[var(--color-accent-gold)]"
                          aria-label="Quantity"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ),
                          )}
                        </select>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, quantity + 1)
                          }
                          className="w-10 h-10 shrink-0 flex items-center justify-center border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] rounded-lg hover:border-[var(--color-accent-gold)] text-[var(--color-text-primary)] transition-colors cursor-pointer text-lg"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-3 md:col-span-2 text-right text-sm text-[var(--color-text-secondary)]">
                      {convertToLocale({
                        amount: unitPrice,
                        currencyCode,
                      })}
                    </div>

                    {/* Total */}
                    <div className="col-span-3 md:col-span-2 text-right font-bold text-[var(--color-accent-gold)]">
                      {convertToLocale({
                        amount: lineTotal,
                        currencyCode,
                      })}
                    </div>

                    {/* Remove */}
                    <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        aria-label={`Remove ${productTitle} from cart`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <h2 className="text-2xl font-serif-heading font-bold mb-6 text-[var(--color-text-primary)]">Summary</h2>

              <div className="border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Subtotal (excl. shipping & taxes)
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {convertToLocale({
                        amount: cart?.item_subtotal || 0,
                        currencyCode,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Shipping</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {convertToLocale({
                        amount: cart?.shipping_total || 0,
                        currencyCode,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Taxes</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {convertToLocale({
                        amount: cart?.tax_total || 0,
                        currencyCode,
                      })}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[var(--color-text-primary)]">Total</span>
                      <span className="text-[var(--color-accent-gold)]">
                        {convertToLocale({
                          amount: cart?.total || 0,
                          currencyCode,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`/${countryCode}/checkout`}
                  className="w-full block text-center bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold py-4 px-6 rounded-full transition-all duration-300 mt-6 uppercase tracking-wider text-xs shadow-md"
                >
                  Go to checkout
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
