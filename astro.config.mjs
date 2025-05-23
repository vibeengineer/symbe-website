// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { storyblok } from "@storyblok/astro";
import { getRedirects } from "./src/services/storyblok/get-redirects";

// Fetch redirects
import { loadEnv } from "vite";

import node from "@astrojs/node";

const { STORYBLOK_TOKEN, SITE_URL, CONTENT_VERSION } = loadEnv(
  //@ts-ignore
  process.env,
  process.cwd(),
  "",
);

const redirects = await getRedirects(STORYBLOK_TOKEN, CONTENT_VERSION);

// https://astro.build/config
export default defineConfig({
  redirects: redirects,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    react(),
    sitemap(),
    storyblok({
      accessToken: STORYBLOK_TOKEN,
      livePreview: true,
      bridge: {
        resolveLinks: "url",
      },
      components: {
        // Content type blocks
        page: "layouts/page",
        article: "layouts/article",
        customerStory: "layouts/customer-story",
        firesideChat: "layouts/fireside-chat",
        finePrint: "layouts/fine-print",
        demo: "layouts/demo",
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
        contactUs: "components/contact-us",
        leftRightHero: "components/left-right-hero",
        benefits: "components/benefits/index",
        fullWidthBentoGrid: "components/full-width-bento-grid",
        relatedContent: "components/related-content",
        faqList: "components/faq-list/index",
        pricingHero: "components/pricing-hero/index",
        centreHero: "components/centre-hero",
        team: "components/team/index",
        values: "components/values/index",
        partners: "components/partners",
      },
      enableFallbackComponent: true,
    }),
  ],
  site: SITE_URL,
  adapter: node({
    mode: "standalone",
  }),
  output: "server",
  experimental: {
    fonts: [
      {
        name: "DM Sans",
        cssVariable: "--font-dm-sans",
        provider: "local",
        variants: [
          {
            src: ["./src/assets/fonts/dm-sans-variable.ttf"],
            weight: "100 200 300 400 500 600 700 800 900",
            style: "normal",
          },
        ],
      },
      {
        name: "Bagos Condensed",
        cssVariable: "--font-bagos-condensed",
        provider: "local",
        variants: [
          {
            src: ["./src/assets/fonts/bagos-condensed-medium.woff2"],
            weight: "500",
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/bagos-condensed-semibold.woff2"],
            weight: "600",
            style: "normal",
          },
        ],
      },
    ],
  },
  server: {
    // to allow node to accept traffic, if not configured a 502 error is returned
    host: "0.0.0.0",
    allowedHosts: ["drop-unavailable-titled-sentence.trycloudflare.com"],
  },
  vite: {
    //@ts-ignore
    plugins: [tailwindcss()],
  },
});
