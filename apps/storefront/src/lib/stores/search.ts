import { atom } from "nanostores";

export const $isSearchOpen = atom<boolean>(false);

export function openSearch(): void {
  $isSearchOpen.set(true);
}

export function closeSearch(): void {
  $isSearchOpen.set(false);
}

export function toggleSearch(): void {
  $isSearchOpen.set(!$isSearchOpen.get());
}
