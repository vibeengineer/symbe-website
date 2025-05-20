import StoryblokClient from "storyblok-js-client";
import type { RedirectsListStoryblok } from "@storyblok/types";
import type { RedirectConfig } from "astro";
import { getStoryResponseSchema } from "./helpers";

export async function getRedirects(
  storyblokApiKey: string,
): Promise<Record<string, RedirectConfig>> {
  const sbApi = new StoryblokClient({
    accessToken: storyblokApiKey,
  });
  try {
    const response = await sbApi.get("cdn/stories/globals/redirects-list", {
      version: import.meta.env.MODE === "development" ? "draft" : "published",
    });
    const parsedResponse = getStoryResponseSchema.parse(response);

    const story = parsedResponse.data.story.content as RedirectsListStoryblok;

    if (!story || !story.redirects || story.redirects.length === 0) {
      console.warn(
        "No redirects within story or story not found in Storyblok, returning empty redirects.",
      );
      return {};
    }

    const redirectsArray = story.redirects.map((redirect) => {
      const status = redirect.status ? Number.parseInt(redirect.status) : 301;
      return [
        redirect.old,
        {
          status: status,
          destination: redirect.new,
        },
      ];
    });

    const redirectsObject = Object.fromEntries(redirectsArray);
    return redirectsObject;
  } catch (error) {
    console.error("Couldn't fetch redirects:", error);
    return {};
  }
}
