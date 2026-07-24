import { LanguageSelect } from "@components/LanguageSelect";
import { ThemeToggle } from "@components/ThemeToggle";
import {
  $cartItemCount,
  $regionId,
  initCart,
  toggleCartSidebar,
} from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

interface NavProps {
  countryCode: string;
  regionId: string | null;
}

const NAV_LINKS = (countryCode: string) => [
  {
    href: `/${countryCode}/store`,
    label: "Shop",
    icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  },
  {
    href: `/${countryCode}/about`,
    label: "About",
    icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  },
  {
    href: `/blog`,
    label: "Blog",
    icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.987 8.987 0 0 0-6 2.292m0-14.25v14.25",
  },
];

export const Nav = ({ countryCode, regionId }: NavProps) => {
  const cartItemCount = useStore($cartItemCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = NAV_LINKS(countryCode);

  useEffect(() => {
    if (regionId) {
      $regionId.set(regionId);
      initCart();
    }
  }, [regionId]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCartClick = () => {
    setMobileMenuOpen(false);
    toggleCartSidebar();
  };

  return (
    <header className="sticky top-0 z-40 glass-nav w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-20 flex items-center justify-between">
        {/* Desktop left links */}
        <div className="hidden md:flex items-center gap-4 md:gap-6 flex-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-9 h-9 -ml-2 text-[var(--color-text-primary)] cursor-pointer"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>

        <a
          href={`/${countryCode}`}
          className="text-xl md:text-2xl font-serif-heading italic text-[var(--color-text-primary)] hover:text-[var(--color-accent-gold)] transition-colors flex items-center gap-2.5 shrink-0"
        >
          <svg
            className="w-7 h-7 text-[var(--color-accent-gold)]"
            viewBox="0 0 100 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 15 C55 35, 65 45, 85 50 C65 55, 55 65, 50 85 C45 65, 35 55, 15 50 C35 45, 45 35, 50 15 Z" />
            <circle cx="50" cy="50" r="8" fill="var(--color-bg-primary)" />
            <circle cx="50" cy="50" r="3" fill="var(--color-accent-gold)" />
            <circle cx="50" cy="28" r="2.5" />
            <circle cx="50" cy="72" r="2.5" />
            <circle cx="28" cy="50" r="2.5" />
            <circle cx="72" cy="50" r="2.5" />
          </svg>
          <span className="hidden xs:inline">Ayni Râpé</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 flex-1 justify-end">
          <div className="hidden md:flex items-center gap-3 sm:gap-4 md:gap-5">
            <LanguageSelect countryCode={countryCode} />
            <ThemeToggle />

            <a
              href={`/${countryCode}/profile`}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] transition-colors flex items-center gap-1.5"
              aria-label="View user profile account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span className="hidden sm:inline">Account</span>
            </a>
          </div>

          <button
            onClick={handleCartClick}
            className="text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-accent-gold)] hover:text-white border border-[var(--color-border-subtle)] px-2.5 sm:px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0"
            aria-label={`Shopping cart with ${cartItemCount} item${cartItemCount !== 1 ? "s" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <span aria-live="polite" aria-atomic="true">
              Cart ({cartItemCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] transition-colors flex items-center gap-2.5 py-2.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                <span>{link.label}</span>
              </a>
            ))}
            <a
              href={`/${countryCode}/profile`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] transition-colors flex items-center gap-2.5 py-2.5"
              aria-label="View user profile account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Account</span>
            </a>
          </div>
          <div className="flex items-center gap-4 pt-3 mt-2 border-t border-[var(--color-border-subtle)]">
            <LanguageSelect countryCode={countryCode} />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
};
