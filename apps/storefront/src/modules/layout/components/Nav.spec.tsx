import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./Nav";
import React from "react";

let mockCartCount = 0;

vi.mock("@nanostores/react", () => ({
  useStore: () => mockCartCount,
}));

vi.mock("@lib/stores/cart", () => ({
  $cartItemCount: {},
  $regionId: { set: vi.fn() },
  initCart: vi.fn(),
  toggleCartSidebar: vi.fn(),
}));

describe("Nav Component", () => {
  it("renders navigational links correctly", () => {
    render(<Nav countryCode="de" regionId="reg_123" />);

    expect(screen.getByText("Shop")).toBeDefined();
    expect(screen.getByText("About")).toBeDefined();
    expect(screen.getByText("Blog")).toBeDefined();
    expect(screen.getByAltText("Ayni Rapé")).toBeDefined();
  });

  it("renders default cart count as 0", () => {
    mockCartCount = 0;
    render(<Nav countryCode="de" regionId="reg_123" />);

    expect(screen.getByText("Cart (0)")).toBeDefined();
  });

  it("updates cart count display when cart store updates", () => {
    mockCartCount = 3;
    render(<Nav countryCode="de" regionId="reg_123" />);

    expect(screen.getByText("Cart (3)")).toBeDefined();
  });
});
