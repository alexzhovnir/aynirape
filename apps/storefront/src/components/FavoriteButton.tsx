import { useStore } from "@nanostores/react";
import { $favorites, initFavorites, toggleFavorite, type FavoriteItem } from "@lib/stores/favorites";
import { useEffect } from "react";

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  showText?: boolean;
}

export const FavoriteButton = ({ item, className = "", showText = false }: FavoriteButtonProps) => {
  const favorites = useStore($favorites);

  useEffect(() => {
    initFavorites();
  }, []);

  const isFav = favorites.some((f) => f.id === item.id || f.handle === item.handle);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] ${
        isFav
          ? "text-red-500 hover:text-red-600"
          : "text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-[var(--color-bg-surface-elevated)]"
      } ${className}`}
      aria-label={isFav ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
      title={isFav ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
        className="w-5 h-5 transition-transform active:scale-125"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      {showText && (
        <span className="text-sm font-semibold">
          {isFav ? "In Favorites" : "Add to Favorites"}
        </span>
      )}
    </button>
  );
};
