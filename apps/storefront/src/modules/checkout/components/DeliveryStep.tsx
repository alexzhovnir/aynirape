import { sdk } from "@lib/sdk";
import { addShippingMethod } from "@lib/stores/cart";
import { convertToLocale } from "@lib/utils/money";
import type {
  StoreCart,
  StoreCartShippingOptionWithServiceZone,
} from "@medusajs/types";
import { useCallback, useEffect, useState } from "react";

interface InPostPoint {
  name: string;
  [key: string]: unknown;
}

interface DeliveryStepProps {
  cart: StoreCart;
  mode: "edit" | "read" | "inactive";
  onContinue: () => void;
  onEdit?: () => void;
}

const CheckCircle = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full shrink-0 border border-emerald-500/30 text-xs font-bold">
    ✓
  </span>
);

function isInPostLockerOption(
  option: StoreCartShippingOptionWithServiceZone,
): boolean {
  const data = (option as unknown as Record<string, unknown>).data as
    | Record<string, unknown>
    | undefined;
  return data?.id === "inpost_locker_standard";
}

export const DeliveryStep = ({
  cart,
  mode,
  onContinue,
  onEdit,
}: DeliveryStepProps) => {
  const [shippingOptions, setShippingOptions] = useState<
    StoreCartShippingOptionWithServiceZone[]
  >([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [selectedLockerPoint, setSelectedLockerPoint] =
    useState<InPostPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit") return;

    const fetchOptions = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { shipping_options } =
          await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id });
        setShippingOptions(shipping_options);

        const existingMethodId = cart.shipping_methods?.[0]?.shipping_option_id;
        if (existingMethodId) {
          setSelectedOptionId(existingMethodId);
        } else if (shipping_options.length > 0) {
          handleOptionChange(shipping_options[0].id);
        }
      } catch (err) {
        console.error("Failed to load shipping options:", err);
        setError("Failed to load shipping options. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [mode, cart.id, cart.shipping_methods]);

  const handleInPostPoint = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<InPostPoint>;
      if (customEvent.detail) {
        setSelectedLockerPoint(customEvent.detail);
        if (selectedOptionId) {
          addShippingMethod(
            selectedOptionId,
            { target_point: customEvent.detail.name }
          ).catch(console.error);
        }
      }
    },
    [selectedOptionId],
  );

  useEffect(() => {
    document.addEventListener("inpost:point-selected", handleInPostPoint);
    return () =>
      document.removeEventListener("inpost:point-selected", handleInPostPoint);
  }, [handleInPostPoint]);

  const handleOptionChange = async (optionId: string) => {
    if (isSaving) return;
    setSelectedOptionId(optionId);
    setIsSaving(true);
    setError("");

    try {
      const option = shippingOptions.find((o) => o.id === optionId);
      const isLocker = option ? isInPostLockerOption(option) : false;

      const data =
        isLocker && selectedLockerPoint
          ? { target_point: selectedLockerPoint.name }
          : undefined;

      await addShippingMethod(optionId, data);
    } catch (err) {
      console.error("Failed to set shipping option:", err);
      setError("Failed to set shipping option. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedOption = shippingOptions.find(
    (o) => o.id === selectedOptionId,
  );
  const needsLocker = selectedOption
    ? isInPostLockerOption(selectedOption)
    : false;

  if (mode === "inactive") {
    return (
      <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 opacity-60">
        <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-muted)]">
          Step 2 &bull; Delivery Method
        </h2>
      </div>
    );
  }

  if (mode === "read") {
    const method = cart.shipping_methods?.[0];
    const currencyCode = cart.currency_code || "USD";

    return (
      <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] mb-6">
          <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <span>Delivery Method</span>
            <CheckCircle />
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-accent-gold)] hover:border-[var(--color-accent-gold)] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>

        {method && (
          <div className="text-xs text-[var(--color-text-secondary)]">
            <p className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[10px] mb-2">Selected Option</p>
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">
              {method.name}
              {" — "}
              <span className="text-[var(--color-accent-gold)]">
                {method.amount === 0
                  ? "Free"
                  : convertToLocale({ amount: method.amount, currencyCode })}
              </span>
            </p>
            {(() => {
              const data = method.data as Record<string, unknown> | undefined;
              const targetPoint = data?.target_point as string | undefined;
              return targetPoint ? (
                <p className="text-[var(--color-text-muted)] mt-1">Locker Point: {targetPoint}</p>
              ) : null;
            })()}
          </div>
        )}
      </div>
    );
  }

  const currencyCode = cart.currency_code || "USD";

  return (
    <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <span className="text-[var(--color-accent-gold)] font-bold tracking-[0.2em] text-[10px] uppercase block mb-1">
          STEP 2 OF 3 &bull; DELIVERY METHOD
        </span>
        <h2 className="text-2xl font-serif-heading font-bold text-[var(--color-text-primary)]">
          Select Delivery Option
        </h2>
      </div>

      <div className="space-y-6">
        {isLoading && (
          <p className="text-xs text-[var(--color-text-muted)] animate-pulse">
            Loading available shipping options...
          </p>
        )}

        {!isLoading && shippingOptions.length === 0 && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">
            No shipping options available for your delivery address.
          </p>
        )}

        {!isLoading && shippingOptions.length > 0 && (
          <div className="space-y-3">
            {shippingOptions.map((option) => {
              const isLocker = isInPostLockerOption(option);
              const isSelected = selectedOptionId === option.id;

              return (
                <div key={option.id}>
                  <label
                    className={`flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[var(--color-accent-gold)] bg-[var(--color-bg-surface)] shadow-sm"
                        : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-text-muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping_option"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleOptionChange(option.id)}
                        className="w-4 h-4 accent-[var(--color-accent-gold)] cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{option.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-accent-gold)]">
                      {option.amount === 0
                        ? "FREE"
                        : convertToLocale({
                            amount: option.amount,
                            currencyCode,
                          })}
                    </span>
                  </label>

                  {isLocker && isSelected && (
                    <div className="mt-3 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
                      {selectedLockerPoint ? (
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-primary)] mb-2">
                          <span className="font-bold">Selected Locker:</span>
                          <span>{selectedLockerPoint.name}</span>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          document.dispatchEvent(new CustomEvent("inpost:open"))
                        }
                        className="text-xs font-bold text-[var(--color-accent-gold)] hover:underline cursor-pointer"
                      >
                        {selectedLockerPoint
                          ? "Change Parcel Locker"
                          : "Choose Parcel Locker →"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={
            !selectedOptionId ||
            isSaving ||
            (needsLocker && !selectedLockerPoint)
          }
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2"
        >
          <span>{isSaving ? "Saving..." : "Continue to Payment"}</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
