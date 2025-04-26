// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { storyblok } from "@storyblok/astro";
console.log(import.meta.env);
// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    sitemap(),
    storyblok({
      accessToken: import.meta.env.STORYBLOK_TOKEN,
      apiOptions: {},
    }),
  ],
  site: import.meta.env.BASE_URL,
  adapter: cloudflare({
    imageService: "cloudflare",
    platformProxy: {
      enabled: true,
      configPath: "wrangler.jsonc",
    },
  }),
  output: "server",
  experimental: {
    fonts: [
      {
        provider: "local",
        variants: [
          {
            src: ["./src/assets/fonts/dm-sans-variable.ttf"],
            weight: "100 200 300 400 500 600 700 800 900",
            style: "normal",
          },
        ],
        name: "DM Sans",
        cssVariable: "--font-dm-sans",
      },
    ],
  },
  vite: {
    //@ts-ignore
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : {},
    },
  },
});
