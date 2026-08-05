import { sdk } from "@lib/sdk";
import { addToCart } from "@lib/stores/cart";
import { isProductInStock } from "@lib/utils/is-product-in-stock";
import { convertToLocale } from "@lib/utils/money";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

type Variant = {
  id: string;
  options:
    | {
        id: string;
        option_id?: string | null;
      }[]
    | null;
  manage_inventory: boolean | null;
  allow_backorder: boolean | null;
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
  options,
  variants: initialVariants,
  productId,
  regionId,
  labels = { add_to_cart: "Add to Cart", adding: "Adding..." },
  productTitle,
  productThumbnail,
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAdding, setIsAdding] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  // Auto-select first value for each option on mount
  useEffect(() => {
    if (options && options.length > 0) {
      const initial: Record<string, string> = {};
      options.forEach(opt => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.id] = opt.values[0].id;
        }
      });
      setSelectedOptions(initial);
    }
  }, [options]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFreshVariants() {
      try {
        const { product } = await sdk.store.product.retrieve(productId, {
          region_id: regionId,
          fields:
            "+variants.inventory_quantity,*variants.options",
        });

        if (!cancelled && product?.variants) {
          setVariants(product.variants as Variant[]);
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
      return;
    }

    if (!options || !options.length || Object.keys(selectedOptions).length === 0) {
      return variants[0];
    }

    const matched = variants.find((variant) =>
      variant.options?.length &&
      variant.options.every(
        (optionValue) =>
          optionValue.id === selectedOptions[optionValue.option_id!] ||
          optionValue.option_id === selectedOptions[optionValue.id],
      ),
    );

    return matched || variants[0];
  }, [selectedOptions, variants, options]);

  // Update the static price in the DOM when the selected variant changes
  useEffect(() => {
    if (selectedVariant?.calculated_price) {
      const priceElement = document.getElementById("product-price");
      if (priceElement) {
        priceElement.textContent = convertToLocale({
          amount: selectedVariant.calculated_price.calculated_amount,
          currencyCode: selectedVariant.calculated_price.currency_code,
        });
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
        title: productTitle || "Sacred Medicine",
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

  // Filter options to only show those that have actual choices
  const visibleOptions = (options ?? []).filter(opt => {
    if (!opt.values || opt.values.length === 0) return false;
    if (opt.values.length === 1) {
      const val = opt.values[0].value.toLowerCase();
      if (val === "default" || val === "standard" || val === "normal") return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {visibleOptions.map((option) => (
        <div key={option.id} className="flex flex-col gap-2">
          <h2 className="text-lg font-serif-heading font-bold text-[var(--color-text-primary)]">{option.title}</h2>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => {
              const isSelected = selectedOptions[option.id] === value.id;
              return (
                <button
                  key={value.id}
                  className={clsx(
                    "py-2.5 px-5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 min-h-[44px] box-border border",
                    isSelected
                      ? "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold border-[var(--color-text-primary)] shadow-md"
                      : "bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)] hover:border-[var(--color-accent-gold)]"
                  )}
                  onClick={() => handleOptionSelect(option.id, value.id)}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        id="main-add-to-cart-btn"
        className={clsx(
          "bg-[var(--color-text-primary)] hover:bg-[var(--color-accent-gold)] text-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)] font-bold py-4 px-8 rounded-full cursor-pointer hover:shadow-md transition-all duration-300 uppercase tracking-wider text-xs shadow-md",
          {
            "opacity-50 cursor-not-allowed": isAddToCardButtonDisabled,
          },
        )}
        disabled={isAddToCardButtonDisabled}
        onClick={handleAddToCart}
      >
        {isAdding ? labels.adding : labels.add_to_cart}
      </button>
    </div>
  );
};
