import { useEffect, useRef, useState } from "react";

export interface CountryOption {
  iso_2: string;
  name: string;
  currency_code?: string;
}

const DEFAULT_COUNTRIES: CountryOption[] = [
  { iso_2: "gb", name: "English", currency_code: "GBP" },
  { iso_2: "de", name: "Deutsch", currency_code: "EUR" },
  { iso_2: "fr", name: "Français", currency_code: "EUR" },
  { iso_2: "it", name: "Italiano", currency_code: "EUR" },
];

const DROPDOWN_WIDTH_PX = 176; // w-44
const DROPDOWN_MARGIN_PX = 8;

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
  const [openUpward, setOpenUpward] = useState(false);
  const [alignLeft, setAlignLeft] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const normalizedCode = countryCode ? countryCode.toLowerCase() : "gb";

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

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedHeight = allCountries.length * 40 + 16;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < estimatedHeight && spaceAbove > spaceBelow);

      // alignLeft = anchor the dropdown's left edge to the button (grows
      // rightward). Prefer that when there's room; only grow leftward
      // (alignLeft = false) when growing rightward would overflow but
      // growing leftward fits.
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      const requiredSpace = DROPDOWN_WIDTH_PX + DROPDOWN_MARGIN_PX;
      const fitsRight = spaceRight >= requiredSpace;
      const fitsLeft = spaceLeft >= requiredSpace;
      setAlignLeft(fitsRight || (!fitsLeft && spaceRight >= spaceLeft));
    }
    setIsOpen((v) => !v);
  };

  const handleSelectCountry = (newCode: string) => {
    setIsOpen(false);
    if (typeof window === "undefined") return;

    const targetCode = newCode.toLowerCase();
    if (targetCode === normalizedCode) return;

    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean);

    // If on keystatic admin, redirect to new region home
    if (segments.length > 0 && segments[0] === "keystatic") {
      window.location.href = `/${targetCode}`;
      return;
    }

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
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="text-xs font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent-gold)] bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] h-10 px-3.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span className="text-sm leading-none" role="img" aria-label={currentCountry.name}>
          {getFlagEmoji(currentCountry.iso_2)}
        </span>
        <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--color-text-primary)]">
          {currentCountry.iso_2}
        </span>
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
          className={`absolute ${alignLeft ? "left-0" : "right-0"} ${
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          } w-44 rounded-2xl bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5`}
          role="listbox"
        >
          {allCountries.map((c) => {
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

                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 text-[var(--color-accent-gold)] shrink-0 ml-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
