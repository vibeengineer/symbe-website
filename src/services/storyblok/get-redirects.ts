import { useStoryblokApi } from "@storyblok/astro";
import type { RedirectsListStoryblok } from "../../../storyblok/types";
import type { RedirectConfig } from "astro";

export async function getRedirects(): Promise<Record<string, RedirectConfig>> {
  const sbApi = useStoryblokApi();
  let story = null;
  try {
    const { data } = await sbApi.get("cdn/stories/globals/redirects", {
      version: import.meta.env.MODE === "development" ? "draft" : "published",
    });

    story = data?.story as RedirectsListStoryblok;
    if (!story || !story.redirects || story.redirects.length === 0) {
      console.warn(
        "Redirects or story not found in Storyblok, returning empty redirects.",
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
