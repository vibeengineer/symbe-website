/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig(
  {
    test: {
      globals: true,
      environment: "jsdom",
    },
  },
  {
    // Astro configuration overrides for Vitest
    // Provide a dummy site URL to satisfy Astro's config validation
    site: "http://localhost:4321",
  },
);
