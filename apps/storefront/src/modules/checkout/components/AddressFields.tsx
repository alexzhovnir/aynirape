import type { FieldErrors, Path, UseFormRegister } from "react-hook-form";

export interface RegionCountry {
  iso_2: string;
  display_name?: string;
  name?: string;
}

export interface AddressValues {
  firstName: string;
  lastName: string;
  address: string;
  company: string;
  postalCode: string;
  city: string;
  country: string;
  province: string;
}

export interface CheckoutFormValues {
  email: string;
  phone: string;
  billingSameAsShipping: boolean;
  shipping: AddressValues;
  billing: AddressValues;
}

const INPUT_BASE =
  "w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border rounded-2xl px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-gold)] transition-colors placeholder:text-[var(--color-text-muted)]";
const ERROR = "text-red-500 text-xs mt-1 min-h-4";
const SPACER = "min-h-4 mt-1";

interface AddressFieldsProps {
  prefix: "shipping" | "billing";
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<AddressValues>;
  countries: RegionCountry[];
}

export const AddressFields = ({
  prefix,
  register,
  errors,
  countries,
}: AddressFieldsProps) => {
  const f = (name: keyof AddressValues) =>
    `${prefix}.${name}` as Path<CheckoutFormValues>;

  return (
    <div className="space-y-4">
      {/* Row 1: First name / Last name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="First name*"
            {...register(f("firstName"))}
            className={`${INPUT_BASE} ${errors.firstName ? "border-red-500/70" : "border-[var(--color-border-subtle)]"}`}
          />
          <p className={ERROR}>{errors.firstName?.message ?? ""}</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Last name*"
            {...register(f("lastName"))}
            className={`${INPUT_BASE} ${errors.lastName ? "border-red-500/70" : "border-[var(--color-border-subtle)]"}`}
          />
          <p className={ERROR}>{errors.lastName?.message ?? ""}</p>
        </div>
      </div>

      {/* Row 2: Address / Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Address*"
            {...register(f("address"))}
            className={`${INPUT_BASE} ${errors.address ? "border-red-500/70" : "border-[var(--color-border-subtle)]"}`}
          />
          <p className={ERROR}>{errors.address?.message ?? ""}</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Company"
            {...register(f("company"))}
            className={`${INPUT_BASE} border-[var(--color-border-subtle)]`}
          />
          <p className={SPACER} />
        </div>
      </div>

      {/* Row 3: Postal code / City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Postal code*"
            {...register(f("postalCode"))}
            className={`${INPUT_BASE} ${errors.postalCode ? "border-red-500/70" : "border-[var(--color-border-subtle)]"}`}
          />
          <p className={ERROR}>{errors.postalCode?.message ?? ""}</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="City*"
            {...register(f("city"))}
            className={`${INPUT_BASE} ${errors.city ? "border-red-500/70" : "border-[var(--color-border-subtle)]"}`}
          />
          <p className={ERROR}>{errors.city?.message ?? ""}</p>
        </div>
      </div>

      {/* Row 4: Country / State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <select
            {...register(f("country"))}
            className={`${INPUT_BASE} ${errors.country ? "border-red-500/70" : "border-[var(--color-border-subtle)]"}`}
          >
            <option disabled value="">
              Country
            </option>
            {countries.map((c) => (
              <option key={c.iso_2} value={c.iso_2} className="bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-primary)]">
                {c.display_name ?? c.name}
              </option>
            ))}
          </select>
          <p className={ERROR}>{errors.country?.message ?? ""}</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="State / Province"
            {...register(f("province"))}
            className={`${INPUT_BASE} border-[var(--color-border-subtle)]`}
          />
          <p className={SPACER} />
        </div>
      </div>
    </div>
  );
};
