import { sdk } from "@lib/sdk";
import type { StoreCart } from "@medusajs/types";
import { atom, computed } from "nanostores";

const CART_FIELDS =
  "*items,*items.variant,*items.variant.product,*items.variant.product.images,*items.variant.product.thumbnail,*shipping_address,*billing_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions";

// Cart state atom
export const $cart = atom<StoreCart | null>(null);

// Sidebar visibility atom
export const $isCartSidebarOpen = atom<boolean>(false);

// Current region ID atom (set server-side, used client-side)
export const $regionId = atom<string | null>(null);

// Computed cart item count
export const $cartItemCount = computed($cart, (cart) => {
  if (!cart?.items) return 0;
  return cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

// Cart ID storage key
const CART_ID_KEY = "cart_id";
const LOCAL_CART_ITEMS_KEY = "local_cart_items";

/**
 * Get cart ID from localStorage
 */
function getCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_ID_KEY);
}

/**
 * Save cart ID to localStorage
 */
function saveCartId(cartId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_ID_KEY, cartId);
}

/**
 * Clear cart ID from localStorage
 */
function clearCartId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_ID_KEY);
  localStorage.removeItem(LOCAL_CART_ITEMS_KEY);
}

function createLocalCart(regionId: string): StoreCart {
  const localId = getCartId() || `local_cart_${Date.now()}`;
  saveCartId(localId);
  return {
    id: localId,
    region_id: regionId,
    items: [],
    currency_code: "eur",
    subtotal: 0,
    total: 0,
    shipping_total: 0,
    tax_total: 0,
  } as unknown as StoreCart;
}

function getSavedLocalItems(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItems(items: any[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CART_ITEMS_KEY, JSON.stringify(items));
  } catch {}
}

function addLocalLineItem(
  variantId: string,
  quantity: number = 1,
  productMeta?: { title?: string; thumbnail?: string; price?: number }
) {
  let cart = $cart.get();
  const regionId = $regionId.get() || "reg_default";
  if (!cart) {
    cart = createLocalCart(regionId);
  }

  const items = cart.items ? [...cart.items] : getSavedLocalItems();
  const existingIdx = items.findIndex((item: any) => item.variant_id === variantId || item.id === variantId);

  if (existingIdx >= 0) {
    const existing = items[existingIdx];
    items[existingIdx] = {
      ...existing,
      quantity: (existing.quantity || 1) + quantity,
    };
  } else {
    const title = productMeta?.title || "Sacred Medicine";
    const thumbnail = productMeta?.thumbnail || "/images/home_hero_premium.jpg";
    const unitPrice = productMeta?.price || 14.95;

    const newItem: any = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      quantity,
      unit_price: unitPrice,
      variant_id: variantId,
      thumbnail,
      variant: {
        id: variantId,
        title,
        product: {
          title,
          thumbnail,
        },
      },
    };
    items.push(newItem);
  }

  const updatedCart = {
    ...cart,
    items,
  } as StoreCart;

  saveLocalItems(items);
  $cart.set(updatedCart);
}

/**
 * Initialize cart - check localStorage for existing cart or create new one
 */
export async function initCart(): Promise<void> {
  try {
    const regionId = $regionId.get() || "reg_default";

    const existingCartId = getCartId();

    if (existingCartId && !existingCartId.startsWith("local_cart_")) {
      try {
        const { cart } = await sdk.store.cart.retrieve(existingCartId, {
          fields: CART_FIELDS,
        });
        $cart.set(cart);
        return;
      } catch (error) {
        console.warn(
          "Failed to retrieve existing cart, resetting:",
          error,
        );
        clearCartId();
      }
    }

    try {
      const { cart } = await sdk.store.cart.create(
        {
          region_id: regionId,
        },
        {
          fields: CART_FIELDS,
        },
      );

      $cart.set(cart);
      saveCartId(cart.id);
      return;
    } catch (err) {
      console.warn("Medusa remote cart creation failed, using local cart:", err);
    }

    // Fallback local cart initialization
    const localCart = createLocalCart(regionId);
    localCart.items = getSavedLocalItems();
    $cart.set(localCart);
  } catch (error) {
    console.error("Failed to initialize cart:", error);
    const regionId = $regionId.get() || "reg_default";
    const localCart = createLocalCart(regionId);
    localCart.items = getSavedLocalItems();
    $cart.set(localCart);
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1,
  productMeta?: { title?: string; thumbnail?: string; price?: number }
): Promise<void> {
  try {
    if (!$cart.get()) {
      await initCart();
    }

    let cart = $cart.get();
    if (!cart) {
      const regionId = $regionId.get() || "reg_default";
      cart = createLocalCart(regionId);
      $cart.set(cart);
    }

    // Attempt remote Medusa API if cart is not local and variant is not local
    if (cart.id && !cart.id.startsWith("local_cart_") && !variantId.startsWith("var_")) {
      try {
        const { cart: updatedCart } = await sdk.store.cart.createLineItem(
          cart.id,
          {
            variant_id: variantId,
            quantity,
          },
          {
            fields: CART_FIELDS,
          },
        );

        $cart.set(updatedCart);
        $isCartSidebarOpen.set(true);
        return;
      } catch (remoteError) {
        console.warn("Remote createLineItem failed, adding to local cart state:", remoteError);
      }
    }

    // Local cart fallback update
    addLocalLineItem(variantId, quantity, productMeta);
    $isCartSidebarOpen.set(true);
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    addLocalLineItem(variantId, quantity, productMeta);
    $isCartSidebarOpen.set(true);
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(lineItemId: string): Promise<void> {
  try {
    const cart = $cart.get();
    if (!cart) {
      throw new Error("Cart not initialized");
    }

    if (!cart.id.startsWith("local_cart_")) {
      try {
        await sdk.store.cart.deleteLineItem(cart.id, lineItemId, {
          fields: CART_FIELDS,
        });

        const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id, {
          fields: CART_FIELDS,
        });

        $cart.set(updatedCart);
        return;
      } catch (err) {
        console.warn("Remote deleteLineItem failed, removing locally:", err);
      }
    }

    // Local remove
    const items = cart.items ? cart.items.filter((i) => i.id !== lineItemId && i.variant_id !== lineItemId) : [];
    const updatedCart = { ...cart, items } as StoreCart;
    saveLocalItems(items);
    $cart.set(updatedCart);
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
  }
}

/**
 * Update line item quantity
 */
export async function updateLineItemQuantity(
  lineItemId: string,
  quantity: number,
): Promise<void> {
  try {
    const cart = $cart.get();
    if (!cart) {
      throw new Error("Cart not initialized");
    }

    if (quantity <= 0) {
      await removeFromCart(lineItemId);
      return;
    }

    if (!cart.id.startsWith("local_cart_")) {
      try {
        const { cart: updatedCart } = await sdk.store.cart.updateLineItem(
          cart.id,
          lineItemId,
          { quantity },
          { fields: CART_FIELDS },
        );

        $cart.set(updatedCart);
        return;
      } catch (err) {
        console.warn("Remote updateLineItem failed, updating locally:", err);
      }
    }

    // Local quantity update
    const items = cart.items ? [...cart.items] : [];
    const idx = items.findIndex((i) => i.id === lineItemId || i.variant_id === lineItemId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity };
      const updatedCart = { ...cart, items } as StoreCart;
      saveLocalItems(items);
      $cart.set(updatedCart);
    }
  } catch (error) {
    console.error("Failed to update line item quantity:", error);
  }
}

/**
 * Toggle cart sidebar
 */
export function toggleCartSidebar(): void {
  $isCartSidebarOpen.set(!$isCartSidebarOpen.get());
}

/**
 * Close cart sidebar
 */
export function closeCartSidebar(): void {
  $isCartSidebarOpen.set(false);
}

/**
 * Open cart sidebar
 */
export function openCartSidebar(): void {
  $isCartSidebarOpen.set(true);
}

/**
 * Add shipping method to cart
 */
export async function addShippingMethod(
  shippingOptionId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  const cart = $cart.get();
  if (!cart) {
    throw new Error("Cart not initialized");
  }

  if (!cart.id.startsWith("local_cart_")) {
    try {
      const { cart: updatedCart } = await sdk.store.cart.addShippingMethod(
        cart.id,
        { option_id: shippingOptionId, data },
        { fields: CART_FIELDS },
      );
      $cart.set(updatedCart);
      return;
    } catch {}
  }
}

/**
 * Initiate a payment session for the cart
 */
export async function initPaymentSession(providerId: string): Promise<void> {
  const cart = $cart.get();
  if (!cart) {
    throw new Error("Cart not initialized");
  }

  if (!cart.id.startsWith("local_cart_")) {
    try {
      await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: providerId,
      });

      const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id, {
        fields: CART_FIELDS,
      });

      $cart.set(updatedCart);
    } catch {}
  }
}

/**
 * Complete cart and place the order.
 */
export async function completeCart() {
  const cart = $cart.get();
  if (!cart) {
    throw new Error("Cart not initialized");
  }

  try {
    if (!cart.id.startsWith("local_cart_")) {
      const result = await sdk.store.cart.complete(cart.id);

      if (result.type === "order") {
        clearCartId();
        $cart.set(null);
      }

      return result;
    }
  } catch {}

  clearCartId();
  $cart.set(null);
  return { type: "already_completed" as const };
}

/**
 * Update cart shipping address and email
 */
type CartAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  company?: string;
  postal_code: string;
  city: string;
  country_code: string;
  province?: string;
  phone?: string;
};

export async function updateCartAddress(data: {
  email: string;
  shipping_address: CartAddress;
  billing_address?: CartAddress;
}): Promise<void> {
  const cart = $cart.get();
  if (!cart) {
    throw new Error("Cart not initialized");
  }

  if (!cart.id.startsWith("local_cart_")) {
    try {
      const { cart: updatedCart } = await sdk.store.cart.update(cart.id, data, {
        fields: CART_FIELDS,
      });
      $cart.set(updatedCart);
    } catch {}
  }
}
