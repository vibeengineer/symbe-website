# Symbe Website Starter

This starter kit provides a foundation for building a website using Astro, Storyblok, and deploying to Cloudflare Workers.

## ✨ Features

- **Framework:** [Astro](https://astro.build/)
- **CMS:** [Storyblok](https://www.storyblok.com/)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/) (via `@astrojs/cloudflare` adapter)
- **UI Framework:** [React](https://react.dev/) (via Astro integration)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Testing:** [Vitest](https://vitest.dev/) for unit/integration tests
- **Linting:** [Biome](https://biomejs.dev/)
- **Formatting:** [Prettier](https://prettier.io/) (via Biome)
- **SEO:** Basic SEO setup with `astro-seo` and Sitemap generation via `@astrojs/sitemap`
- **Typescript:** Strict typing throughout

## 🛠️ Getting Started

1.  **Update Project Name:**
    - Change the `name` field in `package.json`.
    - Change the `name` field in `wrangler.jsonc`.
2.  **Configure Astro (`astro.config.mjs`):**
    - Set your production `site` URL. This is crucial for SEO and sitemap generation.
    - Ensure the `storyblok` integration is configured with your `accessToken` (set via `STORYBLOK_TOKEN` in your environment variables). Optionally, set the `region` if your space isn't in the EU.
    - Configure `storyblok` `components` mapping if you want to map Storyblok component names to local Astro component paths.
    - Configure local fonts under `experimental.fonts` if needed. Place font files in `src/assets/fonts/` (or update the path) and ensure the configuration matches your files.
3.  **Configure Cloudflare (`wrangler.jsonc`):**
    - Define **non-secret**, **runtime** variables for your deployed Worker here (under the `vars` section).
    - `BASE_URL`: Your final production domain (e.g., `https://yourdomain.com`).
    - `SITE_NAME`: Used for SEO/metadata.
    - `SITE_DESCRIPTION`: Used for SEO/metadata.
4.  **Set Up Environment Variables:**
    - **`.env` (Build-time & Local Secrets):**
      - Create a `.env` file (gitignored) by copying `.env.example`.
      - Add **secret** variables needed during the **build process** or for **local development** here.
      - `STORYBLOK_TOKEN`: Your Storyblok preview token. Required by the Astro integration (build-time) and Storyblok CLI.
    - **`.dev.vars` (Local Runtime - Optional):**
      - If you need specific **runtime** secrets or variables _only_ for local development via `pnpm dev` (which uses `wrangler dev`), create a `.dev.vars` file (gitignored).
      - These variables are injected directly into the local Cloudflare Worker environment and are _not_ used during the build.
      - _Note:_ For this starter, `STORYBLOK_TOKEN` is needed in `.env` for the build. If other _runtime_ secrets are needed locally, `.dev.vars` is the place.
5.  **Configure Storyblok Space ID:**
    - Open `package.json`.
    - In the `scripts` section, find `pull-sb-components` and `generate-sb-types`.
    - Replace `YOUR_SPACE_ID` in both scripts with your actual Storyblok Space ID.
6.  **Install Dependencies:**
    ```sh
    pnpm install
    ```
7.  **Generate Storyblok Types:**
    - Run `pnpm pull-sb-components` to download your space's component schema.
    - Run `pnpm generate-sb-types` to create TypeScript definitions (`src/component-types-sb.d.ts`).
    - Re-run these commands whenever you update your Storyblok component definitions.
8.  **Run Development Server:**
    ```sh
    pnpm dev
    ```

## 🎨 Customization

- **Open Graph Image:** Replace the `public/og.png` file with your desired image (recommended size: 1200x630px).
- **Favicon:**
  1.  Generate a new set of favicons using [realfavicongenerator.net](https://realfavicongenerator.net/).
  2.  Place the downloaded files directly into the `public/` directory, replacing the existing `favicon.svg` and any other related files.
  3.  Update the favicon link in `src/layouts/base.astro` if the filename or type changes from the default (`/favicon.svg`).

## 📁 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/         # Static assets (fonts, images, etc.)
│   └── favicon.svg
├── src/
│   ├── assets/       # Project assets (images, icons, etc.) processed by Astro
│   ├── components/   # Reusable UI components (.astro, .jsx, .tsx)
│   ├── layouts/      # Page layouts
│   ├── pages/        # Astro pages and API endpoints
│   ├── services/     # Business logic, external API integrations
│   └── styles/       # Global styles and Tailwind configuration
├── .astro/         # Astro build cache and types (auto-generated)
├── .dev.vars       # Local runtime secrets/variables for wrangler dev (optional, gitignored)
├── .env              # Build-time / Local development secrets (gitignored)
├── .env.example      # Example environment variables for .env
├── .gitignore
├── .npmrc            # PNPM configuration for hoisting
├── astro.config.mjs  # Astro configuration file
├── biome.json        # Biome (linting, formatting) configuration
├── package.json      # Project dependencies and scripts
├── pnpm-lock.yaml
├── tsconfig.json     # TypeScript configuration
└── wrangler.jsonc    # Cloudflare Workers configuration
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                           |
| :------------------------ | :--------------------------------------------------------------- |
| `pnpm install`            | Installs dependencies                                            |
| `pnpm dev`                | Starts local dev server at `localhost:4321`                      |
| `pnpm build`              | Build your production site to `./dist/`                          |
| `pnpm preview`            | Preview your build locally, before deploying                     |
| `pnpm test`               | Runs unit and integration tests with Vitest                      |
| `pnpm format`             | Formats code using Biome                                         |
| `pnpm types`              | Generates Cloudflare Worker types                                |
| `pnpm pull-sb-components` | Downloads component schema from Storyblok (requires login/token) |
| `pnpm generate-sb-types`  | Generates TypeScript types from downloaded Storyblok schema      |
| `pnpm astro ...`          | Run CLI commands like `astro add`, `astro check`                 |
| `pnpm astro -- --help`    | Get help using the Astro CLI                                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 📝 Notes

- **PNPM & Storyblok:** This starter uses `pnpm`. An `.npmrc` file is included to ensure Storyblok dependencies are hoisted correctly, which is sometimes required for the Storyblok SDKs to function properly with `pnpm`.
