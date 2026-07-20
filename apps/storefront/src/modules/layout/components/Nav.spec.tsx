import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./Nav";
import { $cartItemCount } from "@lib/stores/cart";
import React from "react";

// Mock nanostores hook
vi.mock("@nanostores/react", () => ({
  useStore: (store: any) => {
    if (store === $cartItemCount) {
      return store.get();
    }
    return null;
  }
}));

// Mock stores functions
vi.mock("@lib/stores/cart", () => {
  const { atom } = require("nanostores");
  const countAtom = atom(0);
  return {
    $cartItemCount: countAtom,
    $regionId: { set: vi.fn() },
    initCart: vi.fn(),
    toggleCartSidebar: vi.fn()
  };
});

describe("Nav Component", () => {
  it("renders navigational links correctly", () => {
    render(<Nav countryCode="de" regionId="reg_123" />);

    expect(screen.getByText("Shop")).toBeDefined();
    expect(screen.getByText("About")).toBeDefined();
    expect(screen.getByText("Blog")).toBeDefined();
    expect(screen.getByText("Ayni Râpé")).toBeDefined();
  });

  it("renders default cart count as 0", () => {
    $cartItemCount.set(0);
    render(<Nav countryCode="de" regionId="reg_123" />);

    expect(screen.getByText("Cart (0)")).toBeDefined();
  });

  it("updates cart count display when cart store updates", () => {
    $cartItemCount.set(3);
    render(<Nav countryCode="de" regionId="reg_123" />);

    expect(screen.getByText("Cart (3)")).toBeDefined();
  });
});
