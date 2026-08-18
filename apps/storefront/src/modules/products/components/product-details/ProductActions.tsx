import { FavoriteButton } from "@components/FavoriteButton";
import { sdk } from "@lib/sdk";
import { addToCart } from "@lib/stores/cart";
import { isProductInStock } from "@lib/utils/is-product-in-stock";
import { convertToLocale } from "@lib/utils/money";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

type Variant = {
  id: string;
  title?: string | null;
  sku?: string | null;
  size?: string | null;
  options?:
    | {
        id: string;
        option_id?: string | null;
        value?: string;
      }[]
    | null;
  manage_inventory?: boolean | null;
  allow_backorder?: boolean | null;
  inventory_quantity?: number | null;
  calculated_price?: {
    calculated_amount: number;
    currency_code: string;
  };
};

interface Props {
  options: {
    id: string;
    title: string;
    values?: {
      id: string;
      value: string;
    }[];
  }[];
  variants: Variant[];
  productId: string;
  regionId: string;
  labels?: {
    add_to_cart: string;
    adding: string;
  };
  productTitle?: string;
  productThumbnail?: string;
}

export const ProductActions = ({
  options: initialOptions,
  variants: initialVariants,
  productId,
  regionId,
  labels = { add_to_cart: "Add to Cart", adding: "Adding..." },
  productTitle,
  productThumbnail,
}: Props) => {
  const [options, setOptions] = useState(initialOptions ?? []);
  const [variants, setVariants] = useState<Variant[]>(initialVariants ?? []);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  // Compute effective options (either from API/props or synthesized from variants)
  const effectiveOptions = useMemo(() => {
    const valid = (options ?? []).filter((opt) => {
      if (!opt.values || opt.values.length === 0) return false;
      if (opt.values.length === 1) {
        const val = opt.values[0].value.toLowerCase();
        if (val === "default" || val === "standard" || val === "normal") return false;
      }
      return true;
    });

    if (valid.length > 0) {
      return valid;
    }

    // If options are missing or single standard, but we have multiple variants (e.g. 10g, 20g, 50g)
    if (variants && variants.length > 1) {
      return [
        {
          id: "opt_weight_size",
          title: "Weight",
          values: variants.map((v, idx) => ({
            id: v.id || `var_${idx}`,
            value: v.title || (v as any).size || `Option ${idx + 1}`,
          })),
        },
      ];
    }

    return [];
  }, [options, variants]);

  // Auto-select first value for each option on mount or when effectiveOptions change
  useEffect(() => {
    if (effectiveOptions.length > 0) {
      setSelectedOptions((prev) => {
        const updated = { ...prev };
        let hasChanges = false;
        effectiveOptions.forEach((opt) => {
          if (!updated[opt.id] && opt.values && opt.values.length > 0) {
            updated[opt.id] = opt.values[0].id;
            hasChanges = true;
          }
        });
        return hasChanges ? updated : prev;
      });
    }
  }, [effectiveOptions]);

  // Fetch fresh variants and options from Medusa API
  useEffect(() => {
    let cancelled = false;

    async function fetchFreshVariants() {
      try {
        const { product } = await sdk.store.product.retrieve(productId, {
          region_id: regionId,
          fields:
            "+variants.inventory_quantity,*variants.options,*options,*options.values",
        });

        if (!cancelled && product) {
          if (product.variants && product.variants.length > 0) {
            setVariants(product.variants as Variant[]);
          }
          if (product.options && product.options.length > 0) {
            setOptions(product.options as any[]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fresh variant data:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingVariants(false);
        }
      }
    }

    fetchFreshVariants();

    return () => {
      cancelled = true;
    };
  }, [productId, regionId]);

  const selectedVariant = useMemo(() => {
    if (!variants || !variants.length) {
      return undefined;
    }

    if (effectiveOptions.length === 0 || Object.keys(selectedOptions).length === 0) {
      return variants[0];
    }

    // 1. Synthesized option match (where value.id is variant.id)
    const synthesizedVal = selectedOptions["opt_weight_size"];
    if (synthesizedVal) {
      const matchByVar = variants.find(
        (v) => v.id === synthesizedVal || v.title === synthesizedVal || (v as any).sku === synthesizedVal
      );
      if (matchByVar) return matchByVar;
    }

    // 2. Standard Medusa variant options match
    const matched = variants.find((variant) => {
      if (variant.options && variant.options.length > 0) {
        return variant.options.every((optionValue) => {
          const optId = optionValue.option_id || optionValue.id;
          const chosenValId = selectedOptions[optId] || selectedOptions[optionValue.id];
          return (
            optionValue.id === chosenValId ||
            optionValue.option_id === chosenValId ||
            (optionValue as any).value === chosenValId ||
            (optionValue as any).value === selectedOptions[optionValue.option_id!]
          );
        });
      }
      return Object.values(selectedOptions).some(
        (val) => val === variant.id || val === variant.title
      );
    });

    return matched || variants[0];
  }, [selectedOptions, variants, effectiveOptions]);

  // Update the static price and SKU in the DOM when the selected variant changes
  useEffect(() => {
    if (selectedVariant) {
      if (selectedVariant.calculated_price) {
        const priceElement = document.getElementById("product-price");
        if (priceElement) {
          priceElement.textContent = convertToLocale({
            amount: selectedVariant.calculated_price.calculated_amount,
            currencyCode: selectedVariant.calculated_price.currency_code,
          });
        }
      }
      const skuElement = document.getElementById("product-sku");
      if (skuElement && (selectedVariant as any).sku) {
        skuElement.textContent = (selectedVariant as any).sku;
      }
    }
  }, [selectedVariant]);

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, 1, {
        title: `${productTitle || "Sacred Medicine"}${selectedVariant.title && selectedVariant.title !== "Standard" ? ` (${selectedVariant.title})` : ""}`,
        thumbnail: productThumbnail,
        price: selectedVariant.calculated_price?.calculated_amount,
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const isAddToCardButtonDisabled =
    !selectedVariant ||
    isLoadingVariants ||
    !isProductInStock(selectedVariant) ||
    isAdding;

  const favoriteItem = {
    id: productId,
    title: productTitle || "Sacred Medicine",
    handle: productId,
    thumbnail: productThumbnail,
    price: selectedVariant?.calculated_price?.calculated_amount,
  };

  return (
    <div className="flex flex-col gap-6">
      {effectiveOptions.map((option) => {
        const currentSelectedVal = option.values?.find(
          (v) => selectedOptions[option.id] === v.id || selectedOptions[option.id] === v.value
        );

        return (
          <div key={option.id} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-text-secondary)]">
                {option.title || "Weight / Size"}:
              </span>
              {currentSelectedVal && (
                <span className="text-xs font-bold text-[var(--color-accent-gold)]">
                  {currentSelectedVal.value}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {option.values?.map((value) => {
                const isSelected =
                  selectedOptions[option.id] === value.id ||
                  selectedOptions[option.id] === value.value;
                return (
                  <button
                    key={value.id}
                    type="button"
                    className={clsx(
                      "py-2.5 px-6 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 min-h-[44px] box-border border flex items-center justify-center gap-1.5",
                      isSelected
                        ? "bg-[var(--color-accent-gold)] text-slate-950 border-[var(--color-accent-gold)] shadow-md font-bold scale-[1.02] ring-2 ring-[var(--color-accent-gold)]/30"
                        : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)] hover:border-[var(--color-accent-gold)] hover:bg-[var(--color-bg-surface-elevated)]"
                    )}
                    onClick={() => handleOptionSelect(option.id, value.id)}
                  >
                    <span>{value.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3 items-center pt-1">
        <button
          id="main-add-to-cart-btn"
          className={clsx(
            "flex-1 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/90 text-slate-950 font-extrabold py-4 px-8 rounded-full cursor-pointer hover:shadow-lg transition-all duration-300 uppercase tracking-wider text-xs shadow-md active:scale-[0.99]",
            {
              "opacity-50 cursor-not-allowed": isAddToCardButtonDisabled,
            },
          )}
          disabled={isAddToCardButtonDisabled}
          onClick={handleAddToCart}
        >
          {isAdding ? labels.adding : labels.add_to_cart}
        </button>

        <FavoriteButton
          item={favoriteItem}
          className="h-12 w-12 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-bg-surface)] shrink-0 flex items-center justify-center shadow-xs"
        />
      </div>
    </div>
  );
};

