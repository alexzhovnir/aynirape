import { atom, computed } from "nanostores";

export interface FavoriteItem {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  price?: string | number;
  category?: string;
}

const FAVORITES_STORAGE_KEY = "ayni_favorites";

function loadFavoritesFromStorage(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load favorites from localStorage", e);
    return [];
  }
}

function saveFavoritesToStorage(favorites: FavoriteItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error("Failed to save favorites to localStorage", e);
  }
}

export const $favorites = atom<FavoriteItem[]>([]);

export const $favoritesCount = computed($favorites, (items) => items.length);

export function initFavorites(): void {
  if (typeof window === "undefined") return;
  const items = loadFavoritesFromStorage();
  $favorites.set(items);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  const current = $favorites.get();
  const exists = current.some((f) => f.id === item.id || f.handle === item.handle);
  let updated: FavoriteItem[];

  if (exists) {
    updated = current.filter((f) => f.id !== item.id && f.handle !== item.handle);
  } else {
    updated = [...current, item];
  }

  $favorites.set(updated);
  saveFavoritesToStorage(updated);
  return !exists;
}

export function isFavorite(idOrHandle: string): boolean {
  const current = $favorites.get();
  return current.some((f) => f.id === idOrHandle || f.handle === idOrHandle);
}

export function removeFavorite(idOrHandle: string): void {
  const current = $favorites.get();
  const updated = current.filter((f) => f.id !== idOrHandle && f.handle !== idOrHandle);
  $favorites.set(updated);
  saveFavoritesToStorage(updated);
}
