import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

import node from "@astrojs/node";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";

const { PUBLIC_MEDUSA_BACKEND_URL, S3_DOMAIN } = loadEnv(
  process.env.NODE_ENV ?? "",
  process.cwd(),
  "",
);

const medusaBackendDomain = PUBLIC_MEDUSA_BACKEND_URL
  ? new URL(PUBLIC_MEDUSA_BACKEND_URL).hostname
  : undefined;

// https://astro.build/config
export default defineConfig({
  // Absolute URLs for canonical tags, sitemap and RSS. Override per environment.
  site: process.env.PUBLIC_SITE_URL ?? "https://aynirape.com",
  // Node adapter (was Cloudflare): Keystatic's admin/API need a Node runtime, which
  // the Cloudflare edge dev runtime doesn't provide ("module is not defined").
  adapter: node({ mode: "standalone" }),
  // Order matters: react → markdoc → keystatic (per Keystatic's Astro guide).
  integrations: [react(), markdoc(), keystatic(), sitemap()],
  server: {
    port: 8000,
    host: true,
  },
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    plugins: [tailwindcss()],
  },
  image: {
    domains: [
      "medusa-public-images.s3.eu-west-1.amazonaws.com",
      ...(medusaBackendDomain ? [medusaBackendDomain] : []),
      ...(S3_DOMAIN ? [S3_DOMAIN] : []),
    ],
  },
});
