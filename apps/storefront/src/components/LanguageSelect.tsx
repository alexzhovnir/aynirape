import { useEffect, useRef, useState } from "react";

export interface CountryOption {
  iso_2: string;
  name: string;
  currency_code?: string;
}

const DEFAULT_COUNTRIES: CountryOption[] = [
  { iso_2: "de", name: "Germany", currency_code: "EUR" },
  { iso_2: "dk", name: "Denmark", currency_code: "DKK" },
  { iso_2: "fr", name: "France", currency_code: "EUR" },
  { iso_2: "es", name: "Spain", currency_code: "EUR" },
  { iso_2: "it", name: "Italy", currency_code: "EUR" },
  { iso_2: "se", name: "Sweden", currency_code: "SEK" },
  { iso_2: "gb", name: "United Kingdom", currency_code: "GBP" },
  { iso_2: "nl", name: "Netherlands", currency_code: "EUR" },
  { iso_2: "at", name: "Austria", currency_code: "EUR" },
  { iso_2: "pl", name: "Poland", currency_code: "PLN" },
  { iso_2: "be", name: "Belgium", currency_code: "EUR" },
  { iso_2: "ch", name: "Switzerland", currency_code: "CHF" },
  { iso_2: "us", name: "United States", currency_code: "USD" },
];

export function getFlagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return "🌐";
  const codePoints = iso2
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface LanguageSelectProps {
  countryCode: string;
  countries?: CountryOption[];
  className?: string;
}

export const LanguageSelect = ({
  countryCode,
  countries = DEFAULT_COUNTRIES,
  className = "",
}: LanguageSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedCode = countryCode ? countryCode.toLowerCase() : "de";

  // Ensure available countries list contains current country if missing
  const allCountries = [...countries];
  if (!allCountries.some((c) => c.iso_2.toLowerCase() === normalizedCode)) {
    allCountries.unshift({
      iso_2: normalizedCode,
      name: normalizedCode.toUpperCase(),
    });
  }

  const currentCountry =
    allCountries.find((c) => c.iso_2.toLowerCase() === normalizedCode) || {
      iso_2: normalizedCode,
      name: normalizedCode.toUpperCase(),
    };

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.iso_2.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectCountry = (newCode: string) => {
    setIsOpen(false);
    if (typeof window === "undefined") return;

    const targetCode = newCode.toLowerCase();
    if (targetCode === normalizedCode) return;

    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0 && segments[0].length === 2) {
      segments[0] = targetCode;
    } else {
      segments.unshift(targetCode);
    }

    const newPath =
      "/" +
      segments.join("/") +
      window.location.search +
      window.location.hash;

    window.location.href = newPath;
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-2.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent-gold)]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select region and language"
      >
        <span className="text-sm leading-none" role="img" aria-label={currentCountry.name}>
          {getFlagEmoji(currentCountry.iso_2)}
        </span>
        <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--color-text-primary)]">
          {currentCountry.iso_2}
        </span>
        {currentCountry.currency_code && (
          <span className="text-[10px] text-[var(--color-text-muted)] hidden xs:inline">
            ({currentCountry.currency_code})
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--color-accent-gold)]" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="p-2 border-b border-[var(--color-border-subtle)]">
            <input
              type="text"
              placeholder="Search region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border border-[var(--color-border-subtle)] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[var(--color-accent-gold)]"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--color-text-muted)] text-center">
                No region found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.iso_2.toLowerCase() === normalizedCode;
                return (
                  <button
                    key={c.iso_2}
                    type="button"
                    onClick={() => handleSelectCountry(c.iso_2)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-accent-gold)]/15 text-[var(--color-accent-gold)] font-medium"
                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent-gold)]"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm shrink-0 leading-none">
                        {getFlagEmoji(c.iso_2)}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-mono">
                        {c.iso_2}
                      </span>
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-[var(--color-accent-gold)]"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
