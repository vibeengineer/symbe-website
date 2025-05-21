/// <reference path="./.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
interface ImportMetaEnv {
  PUBLIC_CONTENT_VERSION: string;
  SITE_URL: string;
  STORYBLOK_TOKEN: string;
}

interface ImportMetaEnv {
  readonly CONTENT_VERSION: "draft" | "published";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
