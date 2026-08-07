import { describe, it, expect, beforeEach } from "vitest";
import { $isSearchOpen, openSearch, closeSearch, toggleSearch } from "./search";

describe("search store", () => {
  beforeEach(() => {
    $isSearchOpen.set(false);
  });

  it("initializes with closed search modal", () => {
    expect($isSearchOpen.get()).toBe(false);
  });

  it("openSearch sets state to true", () => {
    openSearch();
    expect($isSearchOpen.get()).toBe(true);
  });

  it("closeSearch sets state to false", () => {
    openSearch();
    expect($isSearchOpen.get()).toBe(true);
    closeSearch();
    expect($isSearchOpen.get()).toBe(false);
  });

  it("toggleSearch flips search state", () => {
    expect($isSearchOpen.get()).toBe(false);
    toggleSearch();
    expect($isSearchOpen.get()).toBe(true);
    toggleSearch();
    expect($isSearchOpen.get()).toBe(false);
  });
});
