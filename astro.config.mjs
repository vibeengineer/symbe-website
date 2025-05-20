// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { storyblok } from "@storyblok/astro";
import { getRedirects } from "./src/services/storyblok/redirects";

// Fetch redirects
import { loadEnv } from "vite";

//@ts-ignore
const { STORYBLOK_TOKEN, SITE_URL } = loadEnv(process.env, process.cwd(), "");

const redirects = await getRedirects(STORYBLOK_TOKEN);

// https://astro.build/config
export default defineConfig({
  redirects: redirects,
  integrations: [
    react(),
    sitemap(),
    storyblok({
      accessToken: STORYBLOK_TOKEN,
      livePreview: true,
      components: {
        // Content type blocks
        page: "layouts/page",
        article: "layouts/article",
        customerStory: "layouts/customer-story",
        firesideChat: "layouts/fireside-chat",
        // Nestable type blocks
        mainHero: "components/main-hero/index",
        bentoGrid: "components/bento-grid/index",
        stats: "components/stats/index",
        scrollingFeatures: "components/scrolling-features/index",
        testimonial: "components/testimonial",
        leftRightImage: "components/left-right-image/index",
        ctaSection: "components/cta-section",
        firesideChatsListings: "components/fireside-chats-listings/index",
        articleListings: "components/article-listings/index",
        customerStoryListings: "components/customer-story-listings/index",
      },
      enableFallbackComponent: true,
    }),
  ],
  site: SITE_URL,
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
