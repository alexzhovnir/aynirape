import { $cart } from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { type RegionCountry } from "./AddressFields";
import { DeliveryStep } from "./DeliveryStep";
import { OrderSummary } from "./OrderSummary";
import { PaymentStep } from "./PaymentStep";
import { ShippingAddressStep } from "./ShippingAddressStep";

interface CheckoutPageProps {
  countryCode: string;
  countries: RegionCountry[];
}

type CheckoutStep = "address" | "delivery" | "payment";

const VALID_STEPS: CheckoutStep[] = ["address", "delivery", "payment"];

const stripePromise = import.meta.env.PUBLIC_STRIPE_KEY
  ? loadStripe(import.meta.env.PUBLIC_STRIPE_KEY)
  : null;

function readStepFromUrl(): CheckoutStep {
  const params = new URLSearchParams(window.location.search);
  const s = params.get("step");
  return VALID_STEPS.includes(s as CheckoutStep)
    ? (s as CheckoutStep)
    : "address";
}

function validateStep(
  step: CheckoutStep,
  cart: NonNullable<ReturnType<typeof $cart.get>>,
): CheckoutStep {
  const hasAddress = Boolean(cart.shipping_address?.first_name);
  const hasShippingMethod = Boolean(cart.shipping_methods?.length);

  if (step === "delivery" && !hasAddress) return "address";
  if (step === "payment" && !hasAddress) return "address";
  if (step === "payment" && !hasShippingMethod) return "delivery";
  return step;
}

export const CheckoutPage = ({ countryCode, countries }: CheckoutPageProps) => {
  const cart = useStore($cart);
  const [, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : "",
  );

  useEffect(() => {
    const onPopState = () => setSearch(window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goToStep = (next: CheckoutStep) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", next);
    history.pushState(null, "", url.toString());
    setSearch(url.search);
  };

  const step = cart ? validateStep(readStepFromUrl(), cart) : "address";

  if (!cart || !cart.items?.length) {
    return (
      <div className="max-w-md mx-auto my-16 p-12 bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl shadow-xl text-center space-y-4">
        <span className="text-4xl">🛍️</span>
        <h1 className="text-3xl font-serif-heading font-bold text-[var(--color-text-primary)]">Your Cart is Empty</h1>
        <p className="text-xs text-[var(--color-text-muted)]">Please add sacred items to your cart before checking out.</p>
        <a
          href={`/${countryCode}/store`}
          className="inline-block bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold py-3.5 px-8 rounded-full transition-all duration-300 uppercase tracking-wider text-xs shadow-md mt-2"
        >
          Explore Catalogue &rarr;
        </a>
      </div>
    );
  }

  const stripeSession = cart.payment_collection?.payment_sessions?.find((s) =>
    s.provider_id?.startsWith("pp_stripe_"),
  );
  const stripeClientSecret = stripeSession?.data?.client_secret as
    | string
    | undefined;

  const checkoutContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      <div className="lg:col-span-2 space-y-6">
        <ShippingAddressStep
          cart={cart}
          countries={countries}
          countryCode={countryCode}
          mode={step === "address" ? "edit" : "read"}
          onContinue={() => goToStep("delivery")}
          onEdit={() => goToStep("address")}
        />

        <DeliveryStep
          cart={cart}
          mode={
            step === "delivery"
              ? "edit"
              : step === "address"
                ? "inactive"
                : "read"
          }
          onContinue={() => goToStep("payment")}
          onEdit={() => goToStep("delivery")}
        />

        <PaymentStep
          cart={cart}
          countryCode={countryCode}
          mode={step === "payment" ? "edit" : "inactive"}
        />
      </div>

      <div className="lg:col-span-1">
        <OrderSummary cart={cart} />
      </div>
    </div>
  );

  return (
    <Elements
      key={stripeClientSecret ?? "no-stripe"}
      stripe={stripePromise}
      options={
        stripeClientSecret ? { clientSecret: stripeClientSecret } : undefined
      }
    >
      {checkoutContent}
    </Elements>
  );
};
