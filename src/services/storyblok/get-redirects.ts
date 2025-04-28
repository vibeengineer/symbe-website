import StoryblokClient from "storyblok-js-client";

import type { RedirectsListStoryblok } from "../../../storyblok/types";
import type { RedirectConfig } from "astro";

export async function getRedirects(
  storyblokApiKey: string,
): Promise<Record<string, RedirectConfig>> {
  const sbApi = new StoryblokClient({
    accessToken: storyblokApiKey,
  });
  try {
    const { data } = await sbApi.get("cdn/stories/globals/redirects-list", {
      version: import.meta.env.MODE === "development" ? "draft" : "published",
    });

    const story = data?.story?.content as RedirectsListStoryblok;

    console.log({ story });

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
