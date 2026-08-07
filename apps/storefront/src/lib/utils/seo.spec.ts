import { describe, it, expect } from "vitest";

describe("SEO Redirects and URL Rules", () => {
  const DEFAULT_REGION = "us";

  function getRedirectDestination(pathname: string): { status: number; target: string } | null {
    // 1. Blog encoded Rapé normalization
    if (pathname.includes("/blog/") && (pathname.includes("rap%c3%a9") || pathname.includes("rapé"))) {
      const cleanPath = pathname.replace(/rap(%c3%a9|é)/gi, "rape");
      return { status: 301, target: cleanPath };
    }

    // 2. Legacy /shop/ redirects
    const shopSegments = pathname.split("/").filter(Boolean);
    if (shopSegments[0] === "shop") {
      if (shopSegments.length >= 3) {
        const productHandle = shopSegments[2];
        return { status: 301, target: `/${DEFAULT_REGION}/store/${productHandle}` };
      } else if (shopSegments.length === 2) {
        const categoryHandle = shopSegments[1] === "rape" ? "rap-e" : shopSegments[1];
        return { status: 301, target: `/${DEFAULT_REGION}/store/category/${categoryHandle}` };
      }
    }

    // 3. Legacy static pages
    const legacyStaticPages = ["about", "contact", "delivery-and-payment", "impressum", "privacy-policy", "terms"];
    if (legacyStaticPages.includes(shopSegments[0])) {
      return { status: 301, target: `/${DEFAULT_REGION}/${shopSegments[0]}` };
    }

    return null;
  }

  it("redirects legacy product URLs to /us/store/:productHandle with 301", () => {
    const res = getRedirectDestination("/shop/rape/nukini-sansara");
    expect(res).not.toBeNull();
    expect(res?.status).toBe(301);
    expect(res?.target).toBe("/us/store/nukini-sansara");
  });

  it("redirects legacy category URLs to /us/store/category/:cat with 301", () => {
    const res1 = getRedirectDestination("/shop/rape");
    expect(res1?.status).toBe(301);
    expect(res1?.target).toBe("/us/store/category/rap-e");

    const res2 = getRedirectDestination("/shop/aromatics");
    expect(res2?.status).toBe(301);
    expect(res2?.target).toBe("/us/store/category/aromatics");
  });

  it("normalizes encoded blog URLs with 301 redirect", () => {
    const res = getRedirectDestination("/blog/rap%c3%a9-ritual-preparation-how-to-set-intention-before-ceremony");
    expect(res?.status).toBe(301);
    expect(res?.target).toBe("/blog/rape-ritual-preparation-how-to-set-intention-before-ceremony");
  });

  it("redirects legacy static pages to regional prefix with 301", () => {
    expect(getRedirectDestination("/about")?.target).toBe("/us/about");
    expect(getRedirectDestination("/contact")?.target).toBe("/us/contact");
    expect(getRedirectDestination("/delivery-and-payment")?.target).toBe("/us/delivery-and-payment");
  });
});
