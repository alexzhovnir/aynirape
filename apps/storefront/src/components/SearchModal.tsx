import { useStore } from "@nanostores/react";
import { $isSearchOpen, closeSearch } from "@lib/stores/search";
import { useEffect, useRef, useState } from "react";

interface SearchModalProps {
  countryCode: string;
}

interface SearchItem {
  id: string;
  title: string;
  handle: string;
  type: "product" | "blog";
  category?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
}

const CATALOG_ITEMS: SearchItem[] = [
  // Products
  { id: "p1", title: "Nukini Sansara Rapé", handle: "nukini-sansara", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/nukini-sansara-0.webp", description: "Sacred Nukini blend with Sansara leaves for spiritual strength, grounding, and clarity." },
  { id: "p2", title: "Huni Kuin Rapé", handle: "huni-kuin", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/huni-kuin-0.webp", description: "Traditional Huni Kuin blend for deep forest energy and ritual focus." },
  { id: "p3", title: "Emburana Rapé", handle: "emburana", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/emburana-0.webp", description: "Authentic Amazonian Emburana rapé powder, traditional ceremonial quality." },
  { id: "p4", title: "Caboclo Parica Rapé", handle: "caboclo-parica", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/caboclo-parica-0.webp", description: "Deeply grounding Caboclo Parica blend from indigenous artisans." },
  { id: "p5", title: "Spiritual Cleanse Rapé", handle: "spiritual-cleanse", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/spiritual-cleanse-0.webp", description: "Purifying ceremonial blend designed for aura cleansing and alignment." },
  { id: "p6", title: "Forca Feminina Rapé", handle: "forca-feminina", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/forca-feminina-0.webp", description: "Empowering sacred blend honoring divine feminine energy." },
  { id: "p7", title: "Katukina Eucalipto Rapé", handle: "katukina-eucalipto", type: "product", category: "Rapé", price: 14.95, thumbnail: "/images/products/katukina-eucalipto-0.webp", description: "Refreshing Katukina blend infused with wild Amazonian eucalyptus." },
  { id: "p8", title: "Kuripe Amethyst Crystal Applicator", handle: "kuripe-amethyst", type: "product", category: "Tepi & Kuripe", price: 49.95, thumbnail: "/images/products/kuripe-amethyst-0.webp", description: "Handcrafted kuripe with authentic Amethyst crystal for self-application." },
  { id: "p9", title: "Kuripe Turquoise Crystal Applicator", handle: "kuripe-turquoise", type: "product", category: "Tepi & Kuripe", price: 49.95, thumbnail: "/images/products/kuripe-turquoise-0.webp", description: "Hand-carved hardwood kuripe adorned with natural Turquoise." },
  { id: "p10", title: "Kuripe Colibri Teak Wood", handle: "kuripe-colibri-teak", type: "product", category: "Tepi & Kuripe", price: 34.95, thumbnail: "/images/products/kuripe-colibri-teak-0.webp", description: "Carved Teak wood kuripe featuring hummingbird totem symbolism." },
  { id: "p11", title: "Kuripe Jaguar Hardwood", handle: "kuripe-jaguar-crocodile", type: "product", category: "Tepi & Kuripe", price: 39.95, thumbnail: "/images/products/kuripe-jaguar-crocodile-0.webp", description: "Fierce Jaguar spirit wooden kuripe applicator." },
  { id: "p12", title: "Tepi Double Cobra Ceremonial", handle: "tepi-colibri-crocodile", type: "product", category: "Tepi & Kuripe", price: 69.95, thumbnail: "/images/products/tepi-colibri-crocodile-0.webp", description: "Long ceremonial Tepi applicator for serving rapé during rituals." },
  { id: "p13", title: "Silver Kuripe Double Cobra with Kyanite", handle: "silver-kuripe-double-cobra-with-chain-and-kyanite", type: "product", category: "Tepi & Kuripe", price: 149.95, thumbnail: "/images/products/silver-kuripe-double-cobra-with-chain-and-kyanite-0.webp", description: "Sterling silver 925 ceremonial kuripe with double cobra & blue Kyanite." },
  { id: "p14", title: "Agua de Florida Cologne (270ml)", handle: "agua-de-florida", type: "product", category: "Aromatics", price: 18.95, thumbnail: "/images/products/agua-de-florida-0.webp", description: "Authentic Peruvian Agua de Florida for energy clearing and aura cleansing." },
  { id: "p15", title: "Palo Santo Sacred Wood Sticks", handle: "palo-santo", type: "product", category: "Aromatics", price: 12.95, thumbnail: "/images/products/palo-santo-0.webp", description: "Sustainably harvested Peruvian Palo Santo sticks for space purification." },
  { id: "p16", title: "Maca Root Powder Organic", handle: "maca-root-powder", type: "product", category: "Supplements", price: 16.95, thumbnail: "/images/products/maca-root-powder-0.webp", description: "100% organic Peruvian Maca root powder for vitality and stamina." },
  { id: "p17", title: "Pure Açaí Berry Powder", handle: "pure-acai-powder", type: "product", category: "Supplements", price: 19.95, thumbnail: "/images/products/pure-acai-powder-0.webp", description: "Wild-harvested Amazonian Acai berry superfood powder." },
  { id: "p18", title: "Guaraná Seed Powder", handle: "guarana-seed-powder", type: "product", category: "Supplements", price: 15.95, thumbnail: "/images/products/guarana-seed-powder-0.webp", description: "Natural energizing Guaraná seed powder directly from Brazil." },
  { id: "p19", title: "Ceremonial Carpet Sacred Plant", handle: "ceremonial-carpet-sacred-plant", type: "product", category: "Ornaments", price: 45.00, thumbnail: "/images/products/ceremonial-carpet-sacred-plant-0.webp", description: "Handwoven altar carpet featuring Sacred Plant geometry." },
  { id: "p20", title: "Huayruro Seeds Protection Bracelet", handle: "huayruro-seeds-bracelet", type: "product", category: "Ornaments", price: 14.95, thumbnail: "/images/products/huayruro-seeds-bracelet-0.webp", description: "Traditional Peruvian Huayruro seed bracelet for good luck and protection." },

  // Blog Posts
  { id: "b1", title: "How to Clean and Care for Your Tepi and Kuripe Applicators", handle: "how-to-clean-and-care-for-your-tepi-and-kuripe-applicators", type: "blog", category: "Guide", description: "Essential maintenance guide for long-lasting sacred wood and crystal applicators." },
  { id: "b2", title: "Tepi vs. Kuripe: What's the Difference?", handle: "tepi-vs-kuripe-whats-the-difference-and-which-rape-applicator-should-you-choose", type: "blog", category: "Guide", description: "Understanding self-application (kuripe) vs ceremonial serving (tepi)." },
  { id: "b3", title: "Agua de Florida Cologne: What It Is and How to Use It", handle: "agua-de-florida-cologne-what-it-is-and-how-to-use-it-in-spiritual-and-daily-rituals", type: "blog", category: "Ritual", description: "Complete guide to ceremonial aura cleansing with shamanic cologne." },
  { id: "b4", title: "Rapé Ritual Preparation: Setting Intentions Before Ceremony", handle: "rape-ritual-preparation-how-to-set-intention-before-ceremony", type: "blog", category: "Ceremony", description: "How to create sacred space and align mind & body prior to application." },
  { id: "b5", title: "Maca Root Powder: Benefits, Uses, and Safety", handle: "maca-root-powder-benefits-uses-and-how-to-take-it-safely", type: "blog", category: "Wellness", description: "Exploring Peruvian maca for energy, mood balance, and hormonal health." }
];

export const SearchModal = ({ countryCode }: SearchModalProps) => {
  const isOpen = useStore($isSearchOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          $isSearchOpen.set(true);
        }
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        $isSearchOpen.set(true);
      } else if (e.key === "Escape" && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? CATALOG_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category?.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const products = results.filter((r) => r.type === "product");
  const blogPosts = results.filter((r) => r.type === "blog");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={closeSearch}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0 ml-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, tribes, or blog articles..."
            className="w-full bg-transparent px-3 text-base text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none font-medium"
            id="search-modal-title"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors rounded-full"
              aria-label="Clear search query"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-md font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Results area */}
        <div className="overflow-y-auto p-4 flex-1 space-y-6">
          {!query && (
            <div className="text-center py-8 text-[var(--color-text-tertiary)]">
              <p className="text-sm font-medium">Type to search sacred Amazonian supplies, kuripes, or articles...</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Nukini", "Kuripe", "Palo Santo", "Agua de Florida", "Maca"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] hover:bg-[var(--color-accent-gold-soft,#fef3c7)] hover:text-[var(--color-accent-gold)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] transition-colors cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-10 text-[var(--color-text-tertiary)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-2 text-[var(--color-text-tertiary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">No results found</p>
              <p className="text-sm mt-1">No items matching &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {/* Products section */}
          {products.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-gold)] mb-3 flex items-center gap-2">
                <span>Products</span>
                <span className="text-[10px] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)]">
                  {products.length}
                </span>
              </div>
              <div className="space-y-2">
                {products.map((item) => (
                  <a
                    key={item.id}
                    href={`/${countryCode}/store/${item.handle}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[var(--color-bg-surface)] transition-all duration-200 group border border-transparent hover:border-[var(--color-border-subtle)]"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover bg-[var(--color-bg-surface)] shrink-0 border border-[var(--color-border-subtle)] group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-surface)] flex items-center justify-center shrink-0 border border-[var(--color-border-subtle)]">
                        🍃
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-gold)] truncate transition-colors">
                          {item.title}
                        </h4>
                        {item.category && (
                          <span className="text-[10px] font-semibold text-[var(--color-accent-gold)] bg-[var(--color-bg-surface-elevated)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)] shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {item.price && (
                      <div className="text-sm font-bold text-[var(--color-text-primary)] shrink-0">
                        €{item.price.toFixed(2)}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Blog posts section */}
          {blogPosts.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-gold)] mb-3 flex items-center gap-2">
                <span>Blog Articles</span>
                <span className="text-[10px] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)]">
                  {blogPosts.length}
                </span>
              </div>
              <div className="space-y-2">
                {blogPosts.map((item) => (
                  <a
                    key={item.id}
                    href={`/${countryCode}/blog/${item.handle}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-surface)] transition-all duration-200 group border border-transparent hover:border-[var(--color-border-subtle)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-surface)] flex items-center justify-center text-base shrink-0 border border-[var(--color-border-subtle)]">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-gold)] truncate transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[11px] text-[var(--color-text-tertiary)] flex items-center justify-between">
          <span>Search aynirape.com catalog</span>
          <button
            onClick={closeSearch}
            className="hover:text-[var(--color-text-primary)] transition-colors font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
