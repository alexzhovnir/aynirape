import { sdk } from "@lib/sdk";
import { addToCart } from "@lib/stores/cart";
import { isProductInStock } from "@lib/utils/is-product-in-stock";
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
}

export const ProductActions = ({
  options,
  variants: initialVariants,
  productId,
  regionId,
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAdding, setIsAdding] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [isLoadingVariants, setIsLoadingVariants] = useState(true);

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
    if (
      !variants.length ||
      !options.length ||
      Object.keys(selectedOptions).length !== options.length
    ) {
      return;
    }

    return variants.find((variant) =>
      variant.options?.every(
        (optionValue) =>
          optionValue.id === selectedOptions[optionValue.option_id!],
      ),
    );
  }, [selectedOptions, variants, options]);

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
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

  // Filter options to only show those that have actual choices (more than 1 value, and not standard dummy values like 'Default')
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
          <h2 className="text-lg font-bold text-stone-900">{option.title}</h2>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => {
              const isSelected = selectedOptions[option.id] === value.id;
              return (
                <button
                  key={value.id}
                  className={clsx(
                    "py-2.5 px-5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 min-h-[44px] box-border border",
                    isSelected
                      ? "bg-[#1e2d24] text-white border-[#1e2d24] shadow-sm"
                      : "bg-stone-50 text-stone-750 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
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
        className={clsx(
          "bg-black text-white py-4 px-8 rounded-md cursor-pointer hover:shadow-md ease-in-out duration-200",
          {
            "opacity-50 cursor-not-allowed": isAddToCardButtonDisabled,
          },
        )}
        disabled={isAddToCardButtonDisabled}
        onClick={handleAddToCart}
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
};
