import StoryblokClient from "storyblok-js-client";
import type { RedirectConfig, ValidRedirectStatus } from "astro";
import type { RedirectsListStoryblok } from "@storyblok/types";
import { getStoryResponseSchema } from "./schemas";
import { z } from "zod";

const versionSchema = z.enum(["draft", "published"]).default("published");

/**
 * Fetch the `globals/redirects-list` singleton and convert it into an object
 * that Astro expects in its `redirects` adapter hook.
 */
export async function getRedirects(
  storyblokApiKey: string,
  version: string,
): Promise<Record<string, RedirectConfig>> {
  const sbApi = new StoryblokClient({ accessToken: storyblokApiKey });

  try {
    const parsedVersion = versionSchema.parse(version);
    const response = await sbApi.get("cdn/stories/globals/redirects-list", {
      version: parsedVersion,
    });

    const parsed = getStoryResponseSchema.parse(response);
    const content = parsed.data.story.content as RedirectsListStoryblok;

    /* Guard against empty lists */
    if (!content?.redirects?.length) {
      console.warn("No redirects found in Storyblok – returning empty object.");
      return {};
    }

    /* Transform array → Record<string, RedirectConfig> */
    return Object.fromEntries(
      content.redirects.map((r): [string, RedirectConfig] => {
        /**
         * Storyblok stores `status` as a string.  Default to 301 when absent
         * and cast to Astro’s `ValidRedirectStatus` literal-union.
         */
        const statusCode = (
          r.status ? Number.parseInt(String(r.status), 10) : 301
        ) as ValidRedirectStatus;

        return [
          String(r.old),
          {
            status: statusCode,
            destination: String(r.new),
          },
        ];
      }),
    );
  } catch (error) {
    console.error("Couldn't fetch redirects from Storyblok:", error);
    return {};
  }
}
