import { describe, it, expect, beforeEach } from "vitest";
import {
  $favorites,
  $favoritesCount,
  initFavorites,
  toggleFavorite,
  isFavorite,
  removeFavorite,
  type FavoriteItem,
} from "./favorites";

describe("favorites store", () => {
  const sampleItem: FavoriteItem = {
    id: "prod_nukini_1",
    title: "Nukini Sansara Rapé",
    handle: "nukini-sansara",
    thumbnail: "/images/products/nukini-sansara-0.webp",
    price: 14.95,
    category: "Rapé",
  };

  const sampleItem2: FavoriteItem = {
    id: "prod_kuripe_1",
    title: "Kuripe Amethyst",
    handle: "kuripe-amethyst",
    thumbnail: "/images/products/kuripe-amethyst-0.webp",
    price: 49.95,
    category: "Tepi & Kuripe",
  };

  beforeEach(() => {
    localStorage.clear();
    $favorites.set([]);
  });

  it("initializes with empty array by default", () => {
    initFavorites();
    expect($favorites.get()).toEqual([]);
    expect($favoritesCount.get()).toBe(0);
  });

  it("adds item to favorites when toggleFavorite is called", () => {
    const isNowFav = toggleFavorite(sampleItem);
    expect(isNowFav).toBe(true);
    expect($favorites.get()).toHaveLength(1);
    expect($favorites.get()[0].title).toBe("Nukini Sansara Rapé");
    expect($favoritesCount.get()).toBe(1);
    expect(isFavorite("nukini-sansara")).toBe(true);
    expect(isFavorite("prod_nukini_1")).toBe(true);
  });

  it("removes item from favorites when toggleFavorite is called again", () => {
    toggleFavorite(sampleItem);
    expect($favoritesCount.get()).toBe(1);

    const isNowFav = toggleFavorite(sampleItem);
    expect(isNowFav).toBe(false);
    expect($favorites.get()).toEqual([]);
    expect($favoritesCount.get()).toBe(0);
    expect(isFavorite("nukini-sansara")).toBe(false);
  });

  it("allows removing item via removeFavorite helper", () => {
    toggleFavorite(sampleItem);
    toggleFavorite(sampleItem2);
    expect($favoritesCount.get()).toBe(2);

    removeFavorite("prod_nukini_1");
    expect($favoritesCount.get()).toBe(1);
    expect($favorites.get()[0].id).toBe("prod_kuripe_1");
  });

  it("persists favorites to localStorage", () => {
    toggleFavorite(sampleItem);
    const stored = localStorage.getItem("ayni_favorites");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].handle).toBe("nukini-sansara");
  });
});
