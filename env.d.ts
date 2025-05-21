/// <reference path="./.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly CONTENT_VERSION: "draft" | "published";
  readonly SITE_URL: string;
  readonly STORYBLOK_TOKEN: string;
  readonly SITE_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
