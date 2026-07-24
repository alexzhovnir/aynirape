import { zodResolver } from "@hookform/resolvers/zod";
import { updateCartAddress } from "@lib/stores/cart";
import type { StoreCart } from "@medusajs/types";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AddressFields,
  type AddressValues,
  type CheckoutFormValues,
  type RegionCountry,
} from "./AddressFields";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  company: z.string(),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  province: z.string(),
});

// Billing fields are bare strings — validated conditionally via superRefine
const billingSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  company: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  province: z.string(),
});

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Enter a valid email address",
      ),
    phone: z.string().min(1, "Phone number is required"),
    billingSameAsShipping: z.boolean(),
    shipping: addressSchema,
    billing: billingSchema,
  })
  .superRefine(({ billingSameAsShipping, billing }, ctx) => {
    if (billingSameAsShipping) return;

    const required: [keyof typeof billing, string][] = [
      ["firstName", "First name is required"],
      ["lastName", "Last name is required"],
      ["address", "Address is required"],
      ["postalCode", "Postal code is required"],
      ["city", "City is required"],
      ["country", "Country is required"],
    ];

    for (const [field, message] of required) {
      if (!billing[field].trim()) {
        ctx.addIssue({ code: "custom", path: ["billing", field], message });
      }
    }
  });

const EMPTY_ADDRESS: AddressValues = {
  firstName: "",
  lastName: "",
  address: "",
  company: "",
  postalCode: "",
  city: "",
  country: "",
  province: "",
};

function mapAddress(
  addr?: StoreCart["shipping_address"] | null,
): AddressValues {
  return {
    firstName: addr?.first_name ?? "",
    lastName: addr?.last_name ?? "",
    address: addr?.address_1 ?? "",
    company: addr?.company ?? "",
    postalCode: addr?.postal_code ?? "",
    city: addr?.city ?? "",
    country: addr?.country_code ?? "",
    province: addr?.province ?? "",
  };
}

function areSameAddress(
  a?: StoreCart["shipping_address"] | null,
  b?: StoreCart["billing_address"] | null,
): boolean {
  if (!a || !b) return false;

  const fields: (keyof NonNullable<StoreCart["shipping_address"]>)[] = [
    "first_name",
    "last_name",
    "address_1",
    "company",
    "postal_code",
    "city",
    "country_code",
    "province",
  ];

  return fields.every((f) => (a[f] ?? "") === (b[f] ?? ""));
}

const CheckCircle = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full shrink-0 border border-emerald-500/30 text-xs font-bold">
    ✓
  </span>
);

interface ShippingAddressStepProps {
  cart: StoreCart;
  countries: RegionCountry[];
  countryCode: string;
  mode: "edit" | "read";
  onContinue?: () => void;
  onEdit?: () => void;
}

const ReadOnlyView = ({
  cart,
  onEdit,
}: {
  cart: StoreCart;
  onEdit?: () => void;
}) => {
  const shipping = cart.shipping_address;
  const billing = cart.billing_address;
  const isBillingSame =
    !billing?.first_name || areSameAddress(shipping, billing);

  const shippingLines = [
    shipping?.first_name && shipping?.last_name
      ? `${shipping.first_name} ${shipping.last_name}`
      : null,
    shipping?.company ?? null,
    shipping?.address_1 ?? null,
    shipping?.postal_code && shipping?.city
      ? `${shipping.postal_code}, ${shipping.city}`
      : null,
    shipping?.country_code?.toUpperCase() ?? null,
  ].filter(Boolean) as string[];

  const billingLines = isBillingSame
    ? null
    : [
        billing?.first_name && billing?.last_name
          ? `${billing.first_name} ${billing.last_name}`
          : null,
        billing?.address_1 ?? null,
        billing?.postal_code && billing?.city
          ? `${billing.postal_code}, ${billing.city}`
          : null,
        billing?.country_code?.toUpperCase() ?? null,
      ].filter(Boolean) as string[];

  return (
    <div className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] mb-6">
        <h2 className="text-xl font-serif-heading font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <span>Shipping Address</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[var(--color-text-secondary)]">
        <div>
          <p className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[10px] mb-2">Shipping Details</p>
          {shippingLines.map((line, i) => (
            <p key={i} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>

        <div>
          <p className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[10px] mb-2">Contact Info</p>
          {cart.email && <p className="leading-relaxed font-mono">{cart.email}</p>}
        </div>

        <div>
          <p className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[10px] mb-2">Billing Address</p>
          {isBillingSame ? (
            <p className="leading-relaxed text-[var(--color-text-muted)]">
              Same as shipping address.
            </p>
          ) : (
            billingLines?.map((line, i) => (
              <p key={i} className="leading-relaxed">
                {line}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const ShippingAddressStep = ({
  cart,
  countries,
  countryCode,
  mode,
  onContinue,
  onEdit,
}: ShippingAddressStepProps) => {
  const [submitError, setSubmitError] = useState("");
  const cartInitialized = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: cart.email ?? "",
      phone: cart.shipping_address?.phone ?? "",
      billingSameAsShipping: true,
      shipping: mapAddress(cart.shipping_address),
      billing: EMPTY_ADDRESS,
    },
  });

  // Populate form from saved cart address on first load / after refresh
  useEffect(() => {
    if (!cart || cartInitialized.current) return;
    cartInitialized.current = true;

    const shipping = cart.shipping_address;
    if (!shipping?.first_name) return; // No saved address yet, keep empty defaults

    const billing = cart.billing_address;
    const billingSame =
      !billing?.first_name || areSameAddress(shipping, billing);

    reset({
      email: cart.email ?? "",
      phone: shipping.phone ?? "",
      billingSameAsShipping: billingSame,
      shipping: mapAddress(shipping),
      billing: billingSame ? mapAddress(shipping) : mapAddress(billing),
    });
  }, [cart, reset]);

  const billingSameAsShipping = watch("billingSameAsShipping");

  const onSubmit = async (data: CheckoutFormValues) => {
    setSubmitError("");
    try {
      const shippingAddress = {
        first_name: data.shipping.firstName,
        last_name: data.shipping.lastName,
        address_1: data.shipping.address,
        company: data.shipping.company || undefined,
        postal_code: data.shipping.postalCode,
        city: data.shipping.city,
        country_code: data.shipping.country,
        province: data.shipping.province || undefined,
        phone: data.phone || undefined,
      };

      await updateCartAddress({
        email: data.email,
        shipping_address: shippingAddress,
        billing_address: data.billingSameAsShipping
          ? shippingAddress
          : {
              first_name: data.billing.firstName,
              last_name: data.billing.lastName,
              address_1: data.billing.address,
              company: data.billing.company || undefined,
              postal_code: data.billing.postalCode,
              city: data.billing.city,
              country_code: data.billing.country,
              province: data.billing.province || undefined,
            },
      });

      onContinue?.();
    } catch (error) {
      console.error("Failed to update shipping address:", error);
      setSubmitError("Failed to save address. Please try again.");
    }
  };

  if (mode === "read" && cart) {
    return <ReadOnlyView cart={cart} onEdit={onEdit} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <span className="text-[var(--color-accent-gold)] font-bold tracking-[0.2em] text-[10px] uppercase block mb-1">
          STEP 1 OF 3 &bull; SHIPPING ADDRESS
        </span>
        <h2 className="text-2xl font-serif-heading font-bold text-[var(--color-text-primary)]">
          Where should we deliver?
        </h2>
      </div>

      <div className="space-y-6">
        <AddressFields
          prefix="shipping"
          register={register}
          errors={errors.shipping ?? {}}
          countries={countries}
        />

        {/* Billing same as shipping */}
        <label className="flex items-center gap-3 cursor-pointer select-none py-2">
          <input
            type="checkbox"
            {...register("billingSameAsShipping")}
            className="w-4 h-4 accent-[var(--color-accent-gold)] rounded cursor-pointer"
          />
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Billing address is the same as shipping address
          </span>
        </label>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="email"
              placeholder="Email address*"
              {...register("email")}
              className={`w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[var(--color-accent-gold)] transition-colors placeholder:text-[var(--color-text-muted)] ${
                errors.email ? "border-red-500/70" : "border-[var(--color-border-subtle)]"
              }`}
            />
            <p className="text-red-500 text-xs mt-1 min-h-4">
              {errors.email?.message ?? ""}
            </p>
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone number*"
              {...register("phone")}
              className={`w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[var(--color-accent-gold)] transition-colors placeholder:text-[var(--color-text-muted)] ${
                errors.phone ? "border-red-500/70" : "border-[var(--color-border-subtle)]"
              }`}
            />
            <p className="text-red-500 text-xs mt-1 min-h-4">
              {errors.phone?.message ?? ""}
            </p>
          </div>
        </div>

        {/* Billing address section */}
        {!billingSameAsShipping && (
          <div className="pt-6 border-t border-[var(--color-border-subtle)]">
            <h3 className="text-lg font-serif-heading font-bold text-[var(--color-text-primary)] mb-4">Billing Address</h3>
            <AddressFields
              prefix="billing"
              register={register}
              errors={errors.billing ?? {}}
              countries={countries}
            />
          </div>
        )}

        {submitError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-medium">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold rounded-full transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? "Saving..." : "Continue to Delivery"}</span>
          <span>&rarr;</span>
        </button>
      </div>
    </form>
  );
};
