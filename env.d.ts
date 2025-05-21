/// <reference path="./.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly CONTENT_VERSION: "draft" | "published";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
