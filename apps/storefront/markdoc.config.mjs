import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

// Custom Markdoc tags usable inside blog posts, e.g.:
//   {% product-cta handle="rape-forca" label="Shop this rapé" /%}
export default defineMarkdocConfig({
  tags: {
    "product-cta": {
      render: component("./src/components/blog/ProductCTA.astro"),
      attributes: {
        handle: { type: String, required: true },
        label: { type: String, required: false },
      },
    },
  },
});
