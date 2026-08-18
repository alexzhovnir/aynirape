import { useEffect, useState } from "react";

interface ProductDescriptionDrawerProps {
  title: string;
  thumbnail?: string;
  price?: string;
  shortDescription: string;
  fullDescription: string;
  fullDescriptionHtml?: string;
  ingredients?: string;
  keyCharacteristics?: string[];
  tribalName?: string;
  readMoreText?: string;
  drawerTitle?: string;
}

export const ProductDescriptionDrawer = ({
  title,
  thumbnail,
  price,
  shortDescription,
  fullDescription,
  fullDescriptionHtml,
  ingredients,
  keyCharacteristics = [],
  tribalName,
  readMoreText = "Read full description...",
  drawerTitle = "Product Description & Sacred Wisdom",
}: ProductDescriptionDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Short snippet logic: if shortDescription is longer than 220 chars, truncate with ellipsis
  const maxLength = 220;
  const isLongText = (fullDescription || shortDescription || "").length > maxLength || Boolean(fullDescriptionHtml);
  const displayedSnippet =
    shortDescription.length > maxLength
      ? `${shortDescription.slice(0, maxLength).trim()}...`
      : shortDescription;

  // Handle ESC key and lock body scrolling when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2">
      {/* Excerpt Box */}
      <div className="bg-[var(--color-bg-surface)] p-5 rounded-2xl border border-[var(--color-border-subtle)] space-y-3 shadow-inner">
        <p className="font-medium text-xs sm:text-sm text-[var(--color-text-primary)] leading-relaxed">
          {displayedSnippet}
        </p>

        {isLongText && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold-hover)] transition-colors cursor-pointer pt-1.5 border-t border-[var(--color-border-subtle)]/60 w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.987 8.987 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span className="underline underline-offset-4 font-semibold">{readMoreText}</span>
            <span className="text-xs font-normal text-[var(--color-text-muted)]">&rarr;</span>
          </button>
        )}
      </div>

      {/* Slide-over Drawer / Modal Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-black/65 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <aside
            className="w-full max-w-xl bg-[var(--color-bg-surface-elevated)] border-l border-[var(--color-border-subtle)] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-12 h-12 rounded-xl object-cover border border-[var(--color-border-subtle)] shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] flex items-center justify-center shrink-0 border border-[var(--color-border-subtle)] font-serif-heading font-bold text-lg">
                    🌿
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-gold)] block truncate">
                    {drawerTitle}
                  </span>
                  <h3 id="drawer-title" className="text-lg font-serif-heading font-bold text-[var(--color-text-primary)] truncate">
                    {title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-accent-gold)]/20 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close description drawer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[var(--color-text-primary)]">
              {/* Tribal Lineage Badge if available */}
              {tribalName && (
                <div className="bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/30 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-xl">🌎</span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent-gold)] block">
                      Ancestral Origin
                    </span>
                    <p className="text-xs font-bold text-[var(--color-text-primary)] mt-0.5">
                      {tribalName}
                    </p>
                  </div>
                </div>
              )}

              {/* Ingredients Box */}
              {ingredients && (
                <div className="bg-[var(--color-bg-surface)] p-5 rounded-2xl border border-[var(--color-border-subtle)] space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent-gold)] block">
                    100% Natural Botanical Ingredients
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
                    {ingredients}
                  </p>
                </div>
              )}

              {/* Key Characteristics Badges */}
              {keyCharacteristics.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent-gold)] block">
                    Key Botanical Characteristics
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {keyCharacteristics.map((char, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-[var(--color-bg-surface)] p-3 rounded-xl border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] font-medium"
                      >
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span>{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Narrative Text */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent-gold)] block">
                  Full Botanical Overview
                </span>

                {fullDescriptionHtml ? (
                  <div
                    className="prose prose-invert max-w-none text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3 bg-[var(--color-bg-surface)] p-5 rounded-2xl border border-[var(--color-border-subtle)]"
                    dangerouslySetInnerHTML={{ __html: fullDescriptionHtml }}
                  />
                ) : (
                  <div className="bg-[var(--color-bg-surface)] p-5 rounded-2xl border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3 whitespace-pre-line">
                    {fullDescription || shortDescription}
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-muted)] space-y-1">
                <p className="font-bold text-[var(--color-text-primary)]">Ethnobotanical Notice:</p>
                <p className="leading-relaxed">
                  Supplied exclusively as authentic ethnographic botanical specimens and ceremonial artifacts. Packaged with deep respect for Amazonian indigenous heritage.
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between gap-4">
              {price && (
                <div>
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                    Price
                  </span>
                  <span className="text-xl font-extrabold text-[var(--color-accent-gold)] font-serif-heading">
                    {price}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-colors cursor-pointer shrink-0 ml-auto"
              >
                Close Drawer &rarr;
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
