import {
  $cartItemCount,
  $regionId,
  initCart,
  toggleCartSidebar,
} from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

interface NavProps {
  countryCode: string;
  regionId: string | null;
}

export const Nav = ({ countryCode, regionId }: NavProps) => {
  const cartItemCount = useStore($cartItemCount);

  useEffect(() => {
    if (regionId) {
      $regionId.set(regionId);
      initCart();
    }
  }, [regionId]);

  const handleCartClick = () => {
    toggleCartSidebar();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-100/80 flex items-center w-full px-8 h-20">
      <div className="flex items-center gap-6 flex-1">
        <a href={`/${countryCode}/store`} className="text-sm hover:text-amber-700 transition-colors flex items-center gap-1.5 text-stone-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span>Shop</span>
        </a>
        <a href={`/${countryCode}/about`} className="text-sm hover:text-amber-700 transition-colors flex items-center gap-1.5 text-stone-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>About</span>
        </a>
        <a href={`/blog`} className="text-sm hover:text-amber-700 transition-colors flex items-center gap-1.5 text-stone-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.987 8.987 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <span>Blog</span>
        </a>
      </div>
      
      <a
        href={`/${countryCode}`}
        className="text-2xl font-serif italic text-stone-750 hover:opacity-85 transition-opacity flex items-center gap-2.5"
      >
        <svg
          className="w-7 h-7 text-[#9db0ba]"
          viewBox="0 0 100 100"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* A unique tribal geometric flower/leaf emblem */}
          <path d="M50 15 C55 35, 65 45, 85 50 C65 55, 55 65, 50 85 C45 65, 35 55, 15 50 C35 45, 45 35, 50 15 Z" />
          <circle cx="50" cy="50" r="8" className="text-white" fill="currentColor" />
          <circle cx="50" cy="50" r="3" className="text-[#9db0ba]" fill="currentColor" />
          {/* Subtle surrounding tribal dots */}
          <circle cx="50" cy="28" r="2.5" />
          <circle cx="50" cy="72" r="2.5" />
          <circle cx="28" cy="50" r="2.5" />
          <circle cx="72" cy="50" r="2.5" />
        </svg>
        <span>Ayni Râpé</span>
      </a>

      <div className="flex items-center gap-6 flex-1 justify-end">
        <a
          href={`/${countryCode}/profile`}
          className="text-sm hover:text-[#7a5c00] transition-colors flex items-center gap-1.5 text-stone-700"
          aria-label="View user profile account"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span>Account</span>
        </a>

        <button
          onClick={handleCartClick}
          className="text-sm hover:text-[#7a5c00] transition-colors flex items-center gap-1.5 text-stone-700 cursor-pointer"
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
    </header>
  );
};
