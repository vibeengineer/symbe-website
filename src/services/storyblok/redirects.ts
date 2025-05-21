import StoryblokClient from "storyblok-js-client";
import type { RedirectsListStoryblok } from "@storyblok/types";
import type { RedirectConfig } from "astro";
import { getStoryResponseSchema } from "./helpers";
import { z } from "zod";

const versionSchema = z.enum(["draft", "published"]);

export async function getRedirects(
  storyblokApiKey: string,
  version: string,
): Promise<Record<string, RedirectConfig>> {
  const sbApi = new StoryblokClient({
    accessToken: storyblokApiKey,
  });
  try {
    const parsedVersion = versionSchema.parse(version);
    const response = await sbApi.get("cdn/stories/globals/redirects-list", {
      version: parsedVersion,
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
